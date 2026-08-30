import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectSchema = z.object({
  title: z.string(),
  year: z.number(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['active', 'complete']).default('complete'),
  categories: z.array(z.enum(['fsae', 'full-car', 'component-cfd', 'tooling', 'validation', 'design'])),
  tags: z.array(z.string()).default([]),
  summary: z.string(),
  heroVideo: z.object({
    src: z.string(),
    poster: z.string(),
    caption: z.string(),
  }).optional(),
  heroImage: z.string().optional(),
  cardImageFit: z.enum(['contain', 'cover']).default('contain'),
  model3d: z.string().optional(),
  role: z.string().optional(),
  team: z.string().optional(),
  duration: z.string().optional(),
  academic: z.object({
    institution: z.string(),
    course: z.string(),
    assignment: z.string(),
    note: z.string().optional(),
    requirements: z.array(z.string()).min(1),
    media: z.array(z.object({
      src: z.string(),
      alt: z.string(),
      caption: z.string(),
    })).default([]),
  }).optional(),
  nda: z.boolean().default(false),
  featured: z.boolean().default(false),
  order: z.number().default(99),
  studySequence: z.number().int().positive().optional(),
  github: z.string().url().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { projects };
