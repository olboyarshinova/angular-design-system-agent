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

    function addIssue(
        node: ts.Node,
        severity: 'high' | 'medium' | 'low',
        category: Review['issues'][number]['category'],
        problem: string,
        suggestion: string
    ): void {
        const line = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile)
        ).line + 1;

        issues.push({
            file,
            line,
            severity,
            category,
            problem,
            suggestion,
        });
    }

    function visit(node: ts.Node): void {
        // Rule 1: Explicit any
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
            addIssue(
                node,
                'medium',
                'best-practices',
                'Explicit any reduces type safety.',
                'Use a specific type or unknown.'
            );
        }

        // Rule 2: Angular component without OnPush
        if (ts.isClassDeclaration(node)) {
            const decorators = ts.canHaveDecorators(node)
                ? ts.getDecorators(node) ?? []
                : [];

            for (const decorator of decorators) {
                const expression = decorator.expression;

                if (
                    !ts.isCallExpression(expression) ||
                    !ts.isIdentifier(expression.expression) ||
                    expression.expression.text !== 'Component'
                ) {
                    continue;
                }

                const metadata = expression.arguments[0];

                if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
                    continue;
                }

                const hasChangeDetection = metadata.properties.some(
                    property =>
                        ts.isPropertyAssignment(property) &&
                        property.name.getText(sourceFile) === 'changeDetection'
                );

                if (!hasChangeDetection) {
                    addIssue(
                        decorator,
                        'low',
                        'performance',
                        'Component uses the default change detection strategy.',
                        'Consider ChangeDetectionStrategy.OnPush.'
                    );
                }
            }
        }

        // Rule 3: Potentially unmanaged RxJS subscription
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            node.expression.name.text === 'subscribe'
        ) {
            const receiver = node.expression.expression;
            const receiverText = receiver.getText(sourceFile);
            const isInterval = /^interval\s*\(/.test(receiverText);
            const hasCleanupOperator =
                receiverText.includes('takeUntilDestroyed(') ||
                receiverText.includes('takeUntil(') ||
                receiverText.includes('take(') ||
                receiverText.includes('first(');

            if (isInterval && !hasCleanupOperator) {
                addIssue(
                    node,
                    'medium',
                    'memory',
                    'interval() subscription has no visible cleanup.',
                    'Use takeUntilDestroyed() or another cleanup mechanism.',
                );
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    return issues;
}
