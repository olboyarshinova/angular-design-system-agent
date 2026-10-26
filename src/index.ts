import 'dotenv/config';
import { createAgent } from 'langchain';
import { ChatOpenAI } from '@langchain/openai';
import { readScssFile } from './tools/read-scss-file.js';
import { checkDesignTokens } from './tools/check-design-tokens.js';

const agent = createAgent({
    model: new ChatOpenAI({
        model: 'gpt-4.1-mini',
        temperature: 0,
        maxTokens: 400,
    }),
    tools: [readScssFile, checkDesignTokens],
    systemPrompt: `
You are an Angular design system assistant.
Always read the requested file using read_scss_file.
Then analyze its content using check_design_tokens.
Report only detected issues.
Be concise. Do not invent design tokens.
    `,
});

async function main() {
    const result = await agent.invoke({
        messages: [
            {
                role: 'user',
                content: 'Analyze button.component.scss',
            },
        ],
    });

    console.log(result.messages.at(-1)?.content);
}

main().catch(console.error);
