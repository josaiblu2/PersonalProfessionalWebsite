import { defineCollection, z } from 'astro:content';

const insightsCollection = defineCollection({
  type: 'content',
  // Nota (EXP-004a): se usa la forma de función del schema para acceder al
  // helper image() de Astro sin migrar a la Content Layer API (eso renombraría
  // post.slug -> post.id y rompería las URLs ya indexadas de los 140 posts existentes).
  schema: ({ image }) => z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    image: z.string().optional(),
    // Nuevo campo opcional (EXP-004a): imagen colocada junto al .md,
    // optimizada automáticamente por Astro en build. El campo legacy
    // 'image' se mantiene declarado por compatibilidad, pero desde BL-007
    // (2026-09-23) ningun componente lo consume: los 141 posts usan
    // coverImage y la carpeta public/assets/posts/ que 'image' referenciaba
    // fue eliminada por estar huerfana.
    coverImage: image().optional(),
    imageAlt: z.string().optional(),
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
