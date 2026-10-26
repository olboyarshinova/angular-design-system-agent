import {readFile} from 'node:fs/promises';
import path from 'node:path';
import type {Review} from './report-schema.js';

export async function validateReview(
    projectPath: string,
    issues: Review['issues']
): Promise<Review['issues']> {
    const validIssues: Review['issues'] = [];

    for (const issue of issues) {
        const filePath = path.resolve(projectPath, issue.file);
        const relative = path.relative(projectPath, filePath);

        if (
            relative === '..' ||
            relative.startsWith(`..${path.sep}`) ||
            path.isAbsolute(relative)
        ) {
            continue;
        }

        let source: string;

        try {
            source = await readFile(filePath, 'utf-8');
        } catch {
            continue;
        }

        const lines = source.split(/\r?\n/);

        if (
            issue.line !== null &&
            (issue.line < 1 || issue.line > lines.length)
        ) {
            continue;
        }

        validIssues.push(issue);
    }

    return validIssues;
}
