import type { Post } from '../graphql/posts';

type PostSourceInfo = Pick<Post, 'author' | 'sharedPost' | 'source'>;

export const getPostSourceName = (post: PostSourceInfo): string =>
  post.source?.name ?? post.author?.name ?? '';

export const getPostSourcePermalink = (
  post: PostSourceInfo,
): string | undefined => post.source?.permalink;

export const getPostSourceHandle = (
  post: PostSourceInfo,
  fallback = 'unknown',
): string => post.source?.handle ?? post.sharedPost?.source?.handle ?? fallback;
