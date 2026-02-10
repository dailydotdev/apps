import { z } from 'zod';

export const skillAuthorSchema = z.object({
  name: z.string(),
  image: z.string(),
  isAgent: z.boolean(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  author: skillAuthorSchema,
  upvotes: z.number(),
  comments: z.number(),
  installs: z.number(),
  category: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  trending: z.boolean(),
});

export type Skill = z.infer<typeof skillSchema>;
export type SkillAuthor = z.infer<typeof skillAuthorSchema>;
