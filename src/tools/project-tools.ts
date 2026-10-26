import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {tool} from '@langchain/core/tools';
import {z} from 'zod';

type Tokens = {
    colors?: Record<string, string>;
    spacing?: Record<string, string>;
    radius?: Record<string, string>;
};

type UiKit = {
    components: Array<{
        name: string;
        selector: string;
        replaces: string;
        example?: string;
    }>;
};

async function loadJson<T>(
    projectPath: string,
    filename: string
): Promise<T | null> {
    try {
        const content = await readFile(
            path.join(projectPath, '.angular-review', filename),
            'utf-8'
        );

        return JSON.parse(content) as T;
    } catch (error) {
        if (
            (error as NodeJS.ErrnoException).code === 'ENOENT'
        ) {
            return null;
        }

        throw error;
    }
}

export async function createProjectTools(projectPath: string) {
    const tokens = await loadJson<Tokens>(
        projectPath,
        'design-tokens.json'
    );

    const uiKit = await loadJson<UiKit>(
        projectPath,
        'ui-kit.json'
    );

    const tools = [];

    if (tokens) {
        tools.push(
            tool(
                async ({scss}) => {
                    const issues: string[] = [];

                    for (const [group, values] of Object.entries(tokens)) {
                        if (!values) continue;

                        for (const [name, value] of Object.entries(values)) {
                            if (scss.includes(value)) {
                                issues.push(
                                    `Hardcoded ${value}. ` +
                                    `Consider token ${group}.${name}.`
                                );
                            }
                        }
                    }

                    return JSON.stringify({issues});
                },
                {
                    name: 'check_design_tokens',
                    description: 'Find literal values matching project design tokens in SCSS.',
                    schema: z.object({
                        scss: z.string(),
                    }),
                }
            )
        );
    }

    if (uiKit) {
        tools.push(
            tool(
                async ({html}) => {
                    const suggestions = uiKit.components
                        .filter(component => {
                            const tag = component.replaces.toLowerCase();

                            return new RegExp(
                                `<${tag}(?=[\\s/>])`,
                                'i'
                            ).test(html);
                        })
                        .map(component => ({
                            component: component.name,
                            suggestion: `Consider ${component.selector}.`,
                            example: component.example,
                        }));

                    return JSON.stringify({suggestions});
                },
                {
                    name: 'find_ui_components',
                    description: 'Find project UI kit alternatives for native HTML elements.',
                    schema: z.object({
                        html: z.string(),
                    }),
                }
            )
        );
    }

    return tools;
}
