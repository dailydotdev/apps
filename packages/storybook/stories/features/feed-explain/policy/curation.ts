import type { Post } from '@dailydotdev/shared/src/graphql/posts';

export interface Curation {
  /** The value on `post.contentCuration` and in the feed's allowed list. */
  id: string;
  /** The setting's title, for "Hide Opinions". */
  title: string;
  /** One post's kind, for "Opinion, Hot take". */
  label: string;
}

/**
 * The post categories (content curation) from daily-api's
 * seeds/AdvancedSettings.json, group content_curation, all on by default.
 */
export const curations: Curation[] = [
  { id: 'news', title: 'News', label: 'News' },
  { id: 'opinion', title: 'Opinions', label: 'Opinion' },
  { id: 'listicle', title: 'Listicles', label: 'Listicle' },
  { id: 'comparison', title: 'Comparisons', label: 'Comparison' },
  { id: 'story', title: 'Stories', label: 'Story' },
  { id: 'tutorial', title: 'Tutorials', label: 'Tutorial' },
  { id: 'release', title: 'Release', label: 'Release' },
  { id: 'meme', title: 'Memes', label: 'Meme' },
  { id: 'drama', title: 'Drama', label: 'Drama' },
  { id: 'endorsement', title: 'Endorsement', label: 'Endorsement' },
  { id: 'criticism', title: 'Criticism', label: 'Criticism' },
  { id: 'leak', title: 'Leak', label: 'Leak' },
  { id: 'milestone', title: 'Milestone', label: 'Milestone' },
  { id: 'hot_take', title: 'Hot takes', label: 'Hot take' },
];

/**
 * Each story post's `contentCuration`. The public Post type doesn't expose
 * it, so the values come in separately; until they do, posts have none.
 */
export const postCurations: Record<string, string[]> = {};

export const getCurations = (post: Post): string[] =>
  postCurations[post.id] ?? [];

export const hasCurationData = (): boolean =>
  Object.keys(postCurations).length > 0;

export const getCuration = (id: string): Curation =>
  curations.find((curation) => curation.id === id) ?? {
    id,
    title: id,
    label: id,
  };
