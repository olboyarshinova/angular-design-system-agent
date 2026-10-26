import {z} from 'zod';

export const ReviewSchema = z.object({
    issues: z.array(
        z.object({
            file: z.string(),
            line: z.number().int().positive().nullable(),
            severity: z.enum(['high', 'medium', 'low']),
            category: z.enum([
                'performance',
                'memory',
                'architecture',
                'reusability',
                'best-practices',
                'design-system',
            ]),
            problem: z.string(),
            suggestion: z.string(),
        })
    ),
});

export type Review = z.infer<typeof ReviewSchema>;
