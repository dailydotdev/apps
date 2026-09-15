import type React from 'react';
import { PostType } from '../../../graphql/posts';
import { ArticleGrid } from '../article/ArticleGrid';
import { ShareGrid } from '../share/ShareGrid';
import { FreeformGrid } from '../Freeform/FreeformGrid';
import { CollectionGrid } from '../collection/CollectionGrid';
import PollGrid from '../poll/PollGrid';
import { SocialTwitterGrid } from '../socialTwitter/SocialTwitterGrid';
import { BriefCard } from '../brief/BriefCard/BriefCard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PostTypeToGridCard: Record<PostType, React.ComponentType<any>> = {
  [PostType.Article]: ArticleGrid,
  [PostType.Share]: ShareGrid,
  [PostType.Welcome]: FreeformGrid,
  [PostType.Freeform]: FreeformGrid,
  [PostType.VideoYouTube]: ArticleGrid,
  [PostType.Collection]: CollectionGrid,
  [PostType.Brief]: BriefCard,
  [PostType.Poll]: PollGrid,
  [PostType.SocialTwitter]: SocialTwitterGrid,
  [PostType.Digest]: ArticleGrid,
};
