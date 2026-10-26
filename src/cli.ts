import 'dotenv/config';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {mkdir, writeFile} from 'node:fs/promises';
import {createAgent} from 'langchain';
import {ChatOpenAI} from '@langchain/openai';
import {ReviewSchema, type Review} from './report-schema.js';
import {checkDesignTokens} from './tools/check-design-tokens.js';
import {findUiComponents} from './tools/find-ui-components.js';

const extensions = new Set(['.ts', '.html', '.scss']);

async function findFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, {withFileTypes: true});
    const files: string[] = [];

    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist') {
            continue;
        }

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await findFiles(fullPath));
        } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

async function main() {
    const projectPath = path.resolve(
        process.argv[2] ?? './examples/angular-demo'
    );
    const files = await findFiles(projectPath);
    const styleGuide = await readFile('./config/style-guide.md', 'utf-8');
    const agent = createAgent({
        model: new ChatOpenAI({
            model: 'gpt-4.1-mini',
            temperature: 0,
            maxTokens: 500,
        }),
        responseFormat: ReviewSchema,
        tools: [checkDesignTokens, findUiComponents],
        systemPrompt: `
You are a senior Angular code reviewer.

Follow this style guide:
${styleGuide}

Review performance, memory leaks, architecture,
reusability, Angular best practices and design tokens.

Use tools for HTML and SCSS analysis.
For TypeScript, analyze the provided source code.

Report only actionable issues.
For each issue include file, line, severity,
problem and suggested fix.
Be concise.

Return a structured report.

Rules:
- One issue per finding.
- Exact line number if identifiable, otherwise null.
- Maximum 120 characters per problem and suggestion.
- No code snippets, introductions or summaries.
- Do not recommend refactoring without a concrete reason.
- Do not invent issues.
- An empty issues array is valid.
        `,
    });

    const allIssues: Review['issues'] = [];

    for (const file of files) {
        const source = await readFile(file, 'utf-8');
        const relativePath = path.relative(projectPath, file);
        const result = await agent.invoke({
            messages: [{
                role: 'user',
                content: `Review file: ${relativePath}\n\n${source}`,
            }],
        });

        const report = ReviewSchema.parse(result.structuredResponse);
        allIssues.push(...report.issues);
    }

    await mkdir('reports', {recursive: true});

    await writeFile(
        'reports/review.json',
        JSON.stringify({issues: allIssues}, null, 2),
        'utf-8'
    );

    for (const issue of allIssues) {
        console.log(
            `[${issue.severity.toUpperCase()}] ${issue.file}:${issue.line ?? '?'} ` +
            `${issue.problem}\n  Fix: ${issue.suggestion}`
        );
    }

    console.log(`\nTotal issues: ${allIssues.length}`);
    console.log('Report saved: reports/review.json');
}

main().catch(console.error);
