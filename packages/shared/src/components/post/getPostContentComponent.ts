import type { ComponentType } from 'react';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PostContentProps } from './common';
import { PostContent } from './PostContent';
import { SquadPostContent } from './SquadPostContent';
import { PollPostContent } from './poll/PollPostContent';
import { BriefPostContent } from './brief/BriefPostContent';
import { CollectionPostContent } from './collection/CollectionPostContent';
import { SocialTwitterPostContent } from './SocialTwitterPostContent';

type PostContentType =
  | PostType.Article
  | PostType.Share
  | PostType.Collection
  | PostType.Brief
  | PostType.Poll
  | PostType.SocialTwitter;

const contentTypeByPostType: Partial<Record<PostType, PostContentType>> = {
  [PostType.Share]: PostType.Share,
  [PostType.Welcome]: PostType.Share,
  [PostType.Freeform]: PostType.Share,
  [PostType.Collection]: PostType.Collection,
  [PostType.Brief]: PostType.Brief,
  [PostType.Poll]: PostType.Poll,
  [PostType.SocialTwitter]: PostType.SocialTwitter,
};

const getPostContentType = (post: Pick<Post, 'type'>): PostContentType =>
  contentTypeByPostType[post.type] ?? PostType.Article;

type PostContentComponent = ComponentType<PostContentProps>;

const contentByType: Record<PostContentType, PostContentComponent> = {
  [PostType.Article]: PostContent as PostContentComponent,
  [PostType.Share]: SquadPostContent as PostContentComponent,
  [PostType.Collection]: CollectionPostContent as PostContentComponent,
  [PostType.Brief]: BriefPostContent as PostContentComponent,
  [PostType.Poll]: PollPostContent as PostContentComponent,
  [PostType.SocialTwitter]: SocialTwitterPostContent as PostContentComponent,
};

export const getPostContentComponent = (
  post: Pick<Post, 'type'>,
): PostContentComponent => contentByType[getPostContentType(post)];
