import type React from 'react';
import { PostType } from '../../../graphql/posts';
import type { SUPPORTED_WIDE_POST_TYPES_TUPLE } from '../../../lib/feedHighlightColSpan';
import { ArticleFeaturedWideGridCard } from '../article/ArticleFeaturedWideGridCard';
import { FreeformFeaturedWideGridCard } from '../Freeform/FreeformFeaturedWideGridCard';
import { CollectionFeaturedWideGridCard } from '../collection/CollectionFeaturedWideGridCard';
import { ShareFeaturedWideGridCard } from '../share/ShareFeaturedWideGridCard';
import type { FeaturedWideCardProps } from './featuredWide';

const wideCards: Record<
  (typeof SUPPORTED_WIDE_POST_TYPES_TUPLE)[number],
  React.ComponentType<FeaturedWideCardProps>
> = {
  [PostType.Article]: ArticleFeaturedWideGridCard,
  [PostType.VideoYouTube]: ArticleFeaturedWideGridCard,
  [PostType.Freeform]: FreeformFeaturedWideGridCard,
  [PostType.Collection]: CollectionFeaturedWideGridCard,
  [PostType.Share]: ShareFeaturedWideGridCard,
};

export const PostTypeToWideCard: Partial<
  Record<PostType, React.ComponentType<FeaturedWideCardProps>>
> = wideCards;
