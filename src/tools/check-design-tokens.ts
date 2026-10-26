import {tool} from '@langchain/core/tools';
import {z} from 'zod';

const tokens = {
    colors: {
        primary: '#2563eb',
        danger: '#dc2626',
        text: '#111827',
    },
    spacing: {
        sm: '8px',
        md: '16px',
        lg: '24px',
    },
};

export const checkDesignTokens = tool(
    async ({scss}) => {
        const issues: string[] = [];

        scss.split('\n').forEach((line, index) => {
            const color = line.match(/#[0-9a-fA-F]{3,8}\b/);

            if (color) {
                const token = Object.entries(tokens.colors)
                    .find(([, value]) => value === color[0]);

                issues.push(
                    `Line ${index + 1}: Replace ${color[0]} with ${
                        token ? `$color-${token[0]}` : 'a design token'
                    }`
                );
            }

            const spacing = line.match(
                /\b(?:padding|margin|gap):\s*(\d+px)/
            );

            if (spacing) {
                const token = Object.entries(tokens.spacing)
                    .find(([, value]) => value === spacing[1]);

                issues.push(
                    `Line ${index + 1}: Replace ${spacing[1]} with ${
                        token ? `$spacing-${token[0]}` : 'a design token'
                    }`
                );
            }
        });

        return JSON.stringify({issues});
    },
    {
        name: 'check_design_tokens',
        description: 'Check SCSS for hardcoded values and suggest design tokens.',
        schema: z.object({
            scss: z.string().describe('SCSS source code'),
        }),
    }
);
