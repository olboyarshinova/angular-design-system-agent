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

        if (path.extname(target) !== '.scss') {
            throw new Error('Only SCSS files are allowed');
        }

        return readFile(target, 'utf-8');
    },
    {
        name: 'read_scss_file',
        description: 'Read an SCSS file from the Angular demo project.',
        schema: z.object({
            filePath: z.string().describe(
                'Relative path to an SCSS file inside the project'
            ),
        }),
    }
);
