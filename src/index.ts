import 'dotenv/config';
import {createAgent} from 'langchain';
import {ChatOpenAI} from '@langchain/openai';
import {readFile} from 'node:fs/promises';
import {readScssFile} from './tools/read-scss-file.js';
import {checkDesignTokens} from './tools/check-design-tokens.js';
import {findUiComponents} from './tools/find-ui-components.js';

const styleGuide = await readFile(
    './config/style-guide.md',
    'utf-8'
);

const agent = createAgent({
    model: new ChatOpenAI({
        model: 'gpt-4.1-mini',
        temperature: 0,
        maxTokens: 700,
    }),
    tools: [
        readScssFile,
        checkDesignTokens,
        findUiComponents,
    ],
    systemPrompt: `
You are a senior Angular code reviewer.

Project root: examples/angular-demo.
Read requested files using read_project_file.

Review:
- Performance and change detection
- RxJS subscriptions and potential memory leaks
- Component reusability and architecture
- Angular best practices
- UI kit and design tokens

Project style guide:
${styleGuide}

Report only actionable, evidence-based issues.

For every issue provide:
- file: relative file path
- line: exact line number, or null if uncertain
- severity: high | medium | low
- problem: short description
- suggestion: specific fix

Do not invent issues, line numbers, or UI components.
Do not repeat recommendations.
No introductions or summaries.
`,
});

async function main() {
    const result = await agent.invoke({
        messages: [
            {
                role: 'user',
                content: `
Analyze the file with this EXACT path:
button.component.ts

Pass exactly "button.component.ts" to read_project_file.
Do not prepend src/app or examples/angular-demo.
Follow the project style guide.
Report file, line, severity, problem and suggestion.
`
            },
        ],
    });

    console.log(result.messages.at(-1)?.content);
}

main().catch(console.error);
