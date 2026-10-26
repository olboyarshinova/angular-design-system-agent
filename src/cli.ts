import 'dotenv/config';
import {readdir, readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createAgent} from 'langchain';
import {ChatOpenAI} from '@langchain/openai';
import {ReviewSchema, type Review} from './report-schema.js';
import {validateReview} from './validate-review.js';
import {analyzeTypeScript} from './analyzers/typescript-analyzer.js';
import {createProjectTools} from './tools/project-tools.js';

const extensions = new Set(['.ts', '.html', '.scss']);

const priority = {
    high: 0,
    medium: 1,
    low: 2,
};

async function findFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, {withFileTypes: true});
    const files: string[] = [];

    for (const entry of entries) {
        const excludedDirs = new Set([
            'node_modules',
            'dist',
            '.angular',
            '.git',
            '.angular-review',
            'coverage',
            'reports',
        ]);

        if (entry.isDirectory() && excludedDirs.has(entry.name)) {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await findFiles(fullPath));
        } else if (
            entry.isFile() &&
            extensions.has(path.extname(entry.name))
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function escapeMarkdown(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function toMarkdown(issues: Review['issues']): string {
    const lines = [
        '# Angular Code Review',
        '',
        `Found ${issues.length} issues`,
        '',
    ];

    for (const issue of issues) {
        lines.push(
            `### ${issue.severity.toUpperCase()} — ${escapeMarkdown(issue.problem)}`,
            '',
            `**File:** \`${issue.file}:${issue.line ?? '?'}\``,
            '',
            `**Fix:** ${escapeMarkdown(issue.suggestion)}`,
            '',
        );
    }

    return lines.join('\n');
}

function getMaxIssues(): number | undefined {
    const index = process.argv.indexOf('--max-issues');

    if (index === -1) {
        return undefined;
    }

    const value = process.argv[index + 1];
    const maxIssues = Number(value);

    if (!value || !Number.isSafeInteger(maxIssues) || maxIssues <= 0) {
        throw new Error('--max-issues must be a positive integer');
    }

    return maxIssues;
}

function getPositiveIntegerOption(name: string): number | undefined {
    const index = process.argv.indexOf(name);

    if (index === -1) {
        return undefined;
    }

    const value = process.argv[index + 1];
    const number = Number(value);

    if (!value || !Number.isSafeInteger(number) || number <= 0) {
        throw new Error(`${name} must be a positive integer`);
    }

    return number;
}

async function main(): Promise<void> {
    const projectPath = path.resolve(
        process.argv[2] ?? './examples/angular-demo'
    );
    const maxFiles = getPositiveIntegerOption('--max-files');
    const files = (await findFiles(projectPath))
        .sort()
        .slice(0, maxFiles);
    const styleGuide = await readFile(
        './config/style-guide.md',
        'utf-8'
    );
    const projectTools = await createProjectTools(projectPath);
    const agent = createAgent({
        model: new ChatOpenAI({
            model: 'gpt-4.1-mini',
            temperature: 0,
            maxTokens: 1000,
        }),
        responseFormat: ReviewSchema,
        tools: projectTools,
        systemPrompt: `
You are a senior Angular code reviewer.

Follow this style guide:
${styleGuide}

Review:
- Performance and change detection
- RxJS subscriptions and memory leaks
- Component architecture and reusability
- Angular best practices
- UI kit and design tokens
- Accessibility

Use available project tools for HTML and SCSS analysis.
If no project tools are available, do not invent UI kit components
or design token names.
For TypeScript, analyze the provided source code.

Return a structured report.

Rules:
- Report only actionable issues.
- One issue per finding.
- Use exact line numbers from the provided source.
- If the line is uncertain, return null.
- Maximum 120 characters per problem and suggestion.
- No code snippets, introductions or summaries.
- Do not recommend refactoring without a concrete reason.
- Do not invent issues.
- An empty issues array is valid.
- Every issue must be supported by the provided source code.
- Do not report elements, APIs or patterns absent from the file.
- Do not report style preferences as defects unless required by the style guide.
- Prefer fewer accurate findings over speculative findings.
The static analyzer checks:
- Explicit any types
- Missing OnPush configuration
- Direct interval().subscribe() calls without visible cleanup

Return at most 5 highest-priority issues per file.
Keep each problem and suggestion under 100 characters.

Do not duplicate these findings.
        `,
    });

    const allIssues: Review['issues'] = [];

    for (const file of files) {
        const source = await readFile(file, 'utf-8');
        const numberedSource = source
            .split(/\r?\n/)
            .map((line, index) => `${index + 1} | ${line}`)
            .join('\n');
        const relativePath = path.relative(projectPath, file);

        if (file.endsWith('.ts')) {
            allIssues.push(...analyzeTypeScript(relativePath, source));
        }

        console.log(`Analyzing ${relativePath}...`);

        try {
            const result = await agent.invoke({
                messages: [{
                    role: 'user',
                    content: `
Review file: ${relativePath}

Source code with original line numbers:
${numberedSource}

Use only the line numbers shown before "|".
If the exact line is uncertain, return null.
            `,
                }],
            });

            const report = ReviewSchema.parse(result.structuredResponse);

            allIssues.push(
                ...report.issues.map(issue => ({
                    ...issue,
                    file: relativePath,
                }))
            );
        } catch (error) {
            console.error(
                `Failed to analyze ${relativePath}:`,
                error instanceof Error ? error.message : error
            );
        }
    }

    const validatedIssues = await validateReview(
        projectPath,
        allIssues
    );

    validatedIssues.sort(
        (a, b) => priority[a.severity] - priority[b.severity]
    );

    const maxIssues = getPositiveIntegerOption('--max-issues');
    const finalIssues = maxIssues
        ? validatedIssues.slice(0, maxIssues)
        : validatedIssues;

    await mkdir('reports', {recursive: true});

    await writeFile(
        'reports/review.json',
        JSON.stringify({issues: finalIssues}, null, 2),
        'utf-8'
    );

    const markdown = toMarkdown(finalIssues);

    await writeFile(
        'reports/review.md',
        markdown,
        'utf-8'
    );

    console.log('\n' + markdown);
    console.log(
        '\nReports saved to reports/review.md and reports/review.json'
    );
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
