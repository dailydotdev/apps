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

// Derived from the map so the placement layer can never widen a type that
// has no wide-card renderer — the grid-cell width, the WIDENABLE set, and
// the render component all resolve from `PostTypeToWideCard` alone.
export const WIDENABLE_POST_TYPES = new Set<PostType>(
  Object.keys(PostTypeToWideCard) as PostType[],
);
