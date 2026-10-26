import {tool} from '@langchain/core/tools';
import {z} from 'zod';
import {readFile} from 'node:fs/promises';

type UIKitComponent = {
    name: string;
    selector: string;
    replaces: string;
    example: string;
};

export const findUiComponents = tool(
    async ({html}) => {
        const content = await readFile(
            './examples/angular-demo/ui-kit.json',
            'utf-8'
        );
        const config = JSON.parse(content) as {
            components: UIKitComponent[];
        };
        const suggestions = config.components
            .filter(component => {
                const regex = new RegExp(
                    `<${component.replaces}(?=[\\s/>])`,
                    'i'
                );

                return regex.test(html);
            })
            .map(component => ({
                component: component.name,
                suggestion: component.example,
            }));

        return JSON.stringify({suggestions});
    },
    {
        name: 'find_ui_components',
        description:
            'Find UI kit components that can replace native HTML elements.',
        schema: z.object({
            html: z.string().describe('Angular HTML template'),
        }),
    }
);
