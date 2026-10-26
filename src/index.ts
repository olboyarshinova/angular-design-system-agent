import 'dotenv/config';
import {ChatOpenAI} from '@langchain/openai';
import {ToolMessage} from '@langchain/core/messages';
import {checkDesignTokens} from './tools/check-design-tokens.js';

const model = new ChatOpenAI({
    model: 'gpt-4.1-mini',
    temperature: 0,
    maxTokens: 200,
});
const tools = [checkDesignTokens];
const modelWithTools = model.bindTools(tools);

async function main() {
    const scss = `
.button {
    background: #2563eb;
    padding: 13px;
    border-radius: 7px;
}`;
    const messages = [
        {
            role: 'system' as const,
            content: `You are an Angular design system assistant.
Always use tools to analyze code.
Report only detected issues.
Keep responses concise.`,
        },
        {
            role: 'user' as const,
            content: `Check this SCSS:\n${scss}`,
        },
    ];

    const response = await modelWithTools.invoke(messages);
    const history = [...messages, response];

    for (const toolCall of response.tool_calls ?? []) {
        if (toolCall.name === 'check_design_tokens') {
            const result = await checkDesignTokens.invoke(toolCall.args);

            history.push(
                new ToolMessage({
                    content: result,
                    tool_call_id: toolCall.id!,
                }),
            );
        }
    }

    const finalResponse = await modelWithTools.invoke(history);

    console.log(finalResponse.content);
}

main().catch(console.error);
