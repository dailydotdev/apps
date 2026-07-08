import type React from 'react';
import { PostType } from '../../../graphql/posts';
import { ArticleFeaturedWideGridCard } from '../article/ArticleFeaturedWideGridCard';
import { FreeformFeaturedWideGridCard } from '../Freeform/FreeformFeaturedWideGridCard';
import { CollectionFeaturedWideGridCard } from '../collection/CollectionFeaturedWideGridCard';
import { ShareFeaturedWideGridCard } from '../share/ShareFeaturedWideGridCard';
import type { FeaturedWideCardProps } from './featuredWide';

export const PostTypeToWideCard: Partial<
  Record<PostType, React.ComponentType<FeaturedWideCardProps>>
> = {
  [PostType.Article]: ArticleFeaturedWideGridCard,
  [PostType.VideoYouTube]: ArticleFeaturedWideGridCard,
  [PostType.Freeform]: FreeformFeaturedWideGridCard,
  [PostType.Collection]: CollectionFeaturedWideGridCard,
  [PostType.Share]: ShareFeaturedWideGridCard,
};
