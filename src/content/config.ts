import { defineCollection, z } from 'astro:content';

const insightsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    image: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
  }),
});

const caseStudiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    metric: z.string(),
    icon: z.string(),
    sortOrder: z.number().default(0),
  }),
});

export const collections = {
  insights: insightsCollection,
  'case-studies': caseStudiesCollection,
};
