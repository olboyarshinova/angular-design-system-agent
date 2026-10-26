import * as ts from 'typescript';
import type {Review} from '../report-schema.js';

export function analyzeTypeScript(
    file: string,
    source: string
): Review['issues'] {
    const issues: Review['issues'] = [];

    const sourceFile = ts.createSourceFile(
        file,
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    );

    function visit(node: ts.Node): void {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            const line = sourceFile.getLineAndCharacterOfPosition(
                node.getStart(sourceFile)
            ).line + 1;

            issues.push({
                file,
                line,
                severity: 'medium',
                category: 'best-practices',
                problem: 'Explicit any type reduces type safety.',
                suggestion: 'Replace any with a specific type or unknown.',
            });
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return issues;
}
