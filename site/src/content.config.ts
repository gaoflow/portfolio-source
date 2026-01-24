import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    date: z.string().regex(/^\d{4}-\d{2}$/),
    status: z.enum(['active', 'complete']).default('complete'),
    categories: z.array(z.enum(['fsae', 'full-car', 'component-cfd', 'tooling', 'validation', 'design'])),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    methodLine: z.string(),
    heroImage: z.string().optional(),
    model3d: z.string().optional(),
    role: z.string().optional(),
    team: z.string().optional(),
    duration: z.string().optional(),
    heroMetrics: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    keyOutputs: z.array(z.string()).default([]),
    nda: z.boolean().default(false),
    featured: z.boolean().default(false),
    sample: z.boolean().default(false),
    order: z.number().default(99),
    studySequence: z.number().int().positive().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    sourceProjects: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { projects, notes };
