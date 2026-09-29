import {defineCollection} from 'astro:content';
import {z} from 'astro/zod';
import {glob} from 'astro/loaders';
const guides=defineCollection({
  loader:glob({pattern:'**/*.mdx',base:'./src/content/guides'}),
  schema:z.object({title:z.string(),description:z.string(),draft:z.boolean().default(true),order:z.number().default(100)}),
});
export const collections={guides};
