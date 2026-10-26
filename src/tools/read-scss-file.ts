import {tool} from '@langchain/core/tools';
import {z} from 'zod';
import {readFile, realpath} from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve('examples/angular-demo');

export const readScssFile = tool(
    async ({filePath}) => {
        const root = await realpath(projectRoot);
        const target = await realpath(path.resolve(root, filePath));

        const relative = path.relative(root, target);

        if (
            relative === '..' ||
            relative.startsWith(`..${path.sep}`) ||
            path.isAbsolute(relative)
        ) {
            throw new Error('Access outside project directory is forbidden');
        }

        const allowedExtensions = ['.ts', '.html', '.scss'];

        if (!allowedExtensions.includes(path.extname(target))) {
            throw new Error('Only TS, HTML and SCSS files are allowed');
        }

        return readFile(target, 'utf-8');
    },
    {
        name: 'read_project_file',
        description:
            'Read Angular TypeScript, HTML and SCSS files. ' +
            'The project root is examples/angular-demo. ' +
            'Pass paths relative to this root, e.g. button.component.html.',
        schema: z.object({
            filePath: z.string().describe(
                'Relative path to an existing TS, HTML or SCSS file'
            ),
        }),
    }
);
