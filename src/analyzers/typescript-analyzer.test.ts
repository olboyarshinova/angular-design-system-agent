
import { describe, expect, it } from 'vitest';
import { analyzeTypeScript } from './typescript-analyzer.js';

describe('TypeScript analyzer', () => {
    it('detects explicit any with correct line number', () => {
        const source = [
            'const name: string = "Test";',
            'const count: any = 0;',
        ].join('\n');

        const issues = analyzeTypeScript('test.ts', source);

        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    line: 2,
                    severity: 'medium',
                    category: 'best-practices',
                }),
            ])
        );
    });

    it('does not report any inside comments', () => {
        const source = '// Avoid any in production code';

        expect(analyzeTypeScript('test.ts', source)).toEqual([]);
    });

    it('detects Angular component without OnPush', () => {
        const source = `
            import { Component } from '@angular/core';

            @Component({
                selector: 'app-test',
                template: '<p>Test</p>'
            })
            export class TestComponent {}
        `;

        const issues = analyzeTypeScript('test.ts', source);

        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'performance',
                    severity: 'low',
                }),
            ])
        );
    });

    it('detects direct interval subscription', () => {
        const source = `
            import { interval } from 'rxjs';

            interval(1000).subscribe(console.log);
        `;

        const issues = analyzeTypeScript('test.ts', source);

        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    category: 'memory',
                    severity: 'medium',
                }),
            ])
        );
    });

    it('returns no issues for valid typed code', () => {
        const source = `
            const count: number = 0;
            const name: string = 'Angular';
        `;

        expect(analyzeTypeScript('test.ts', source)).toEqual([]);
    });
});
