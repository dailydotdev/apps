import type { Post } from '../../graphql/posts';
import { formatKeyword } from '../../lib/strings';

export const anonymousPostExperienceTagLimit = 3;

export const getPostTopicTags = (
  post?: Pick<Post, 'tags'>,
  limit = anonymousPostExperienceTagLimit,
): string[] => {
  return (post?.tags ?? [])
    .filter((tag): tag is string => !!tag)
    .slice(0, limit)
    .map(formatKeyword);
};

export const getPostTopicLabel = (topics: string[]): string => {
  if (!topics.length) {
    return 'the tech you care about';
  }

  return topics.join(', ');
};

export const getPostTopicTargetId = (
  post?: Pick<Post, 'id' | 'tags'>,
): string | undefined => (post?.tags?.length ? post.tags.join(',') : post?.id);
