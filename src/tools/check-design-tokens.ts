import {tool} from '@langchain/core/tools';
import {z} from 'zod';

export const checkDesignTokens = tool(
    async ({scss}) => {
        const issues: string[] = [];
        const lines = scss.split('\n');

        lines.forEach((line, index) => {
            if (/#[0-9a-fA-F]{3,8}\b/.test(line)) {
                issues.push(`Line ${index + 1}: Hardcoded color`);
            }

            if (/\b(?:padding|margin|gap):\s*\d+px/.test(line)) {
                issues.push(`Line ${index + 1}: Hardcoded spacing`);
            }
        });

        return JSON.stringify({issues});
    },
    {
        name: 'check_design_tokens',
        description: 'Find hardcoded colors and spacing in SCSS code.',
        schema: z.object({
            scss: z.string().describe('SCSS source code'),
        }),
    }
);
