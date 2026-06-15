import { z } from 'zod';

export const topicSchema = z.enum([
  'Databases',
  'AI & Agents',
  'Web Development',
  'Backend',
]);
export type Topic = z.infer<typeof topicSchema>;

const sourceSchema = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  sourceImage: z.string().url(),
});

const postRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().url().nullable(),
  upvotes: z.number(),
  comments: z.number(),
});

const commentSchema = z.object({
  username: z.string(),
  userImage: z.string().url(),
  content: z.string(),
  upvotes: z.number(),
});

export const storyItemSchema = z.object({
  id: z.string(),
  kind: z.literal('story'),
  title: z.string(),
  summary: z.string(),
  posts: z.array(postRefSchema),
  totalUpvotes: z.number(),
  totalComments: z.number(),
  sources: z.array(sourceSchema),
  highlightedComments: z.array(commentSchema),
});
export type StoryItem = z.infer<typeof storyItemSchema>;

export const topicDigestSchema = z.object({
  id: z.string(),
  kind: z.literal('topic'),
  topic: topicSchema,
  title: z.string(),
  tldr: z.string(),
  content: z.string(),
});
export type TopicDigest = z.infer<typeof topicDigestSchema>;

export const dailyDataSchema = z.object({
  lead: storyItemSchema,
  reads: z.array(storyItemSchema),
  topics: z.array(topicDigestSchema),
});
export type DailyData = z.infer<typeof dailyDataSchema>;

export const TOPIC_TOKEN: Record<Topic, string> = {
  Databases: 'text-accent-water-default',
  'AI & Agents': 'text-accent-bun-default',
  'Web Development': 'text-accent-onion-default',
  Backend: 'text-accent-avocado-default',
};
