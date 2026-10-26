import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';

export const isExternalPost = (post: Pick<Post, 'type'>): boolean =>
  post.type === PostType.Article ||
  post.type === PostType.VideoYouTube ||
  post.type === PostType.SocialTwitter;
