import React, { ReactElement } from 'react';
import { ArticleCard, CardType, PlaceholderCard, ShareCard } from '../cards';
import { FeedItem, FeedItemType } from '../../../hooks/useFeed';
import { PostType } from '../../../graphql/posts';
import { VideoCard } from '../cards/video/VideoCard';
import { CollectionCard } from '../cards/collection/CollectionCard';
import { AdCard } from '../cards/ad/AdCard';

export type LeanFeedItemComponentProps = {
  item: FeedItem;
};

const ItemTypeToTag: Record<PostType, React.ComponentType<CardType>> = {
  [PostType.Article]: ArticleCard,
  [PostType.Share]: ShareCard,
  [PostType.Welcome]: ArticleCard,
  [PostType.Freeform]: ArticleCard,
  [PostType.VideoYouTube]: VideoCard,
  [PostType.Collection]: CollectionCard,
};

export default function GenericFeedItemComponent({
  item,
}: LeanFeedItemComponentProps): ReactElement {
  switch (item.type) {
    case FeedItemType.Post: {
      const PostTag = ItemTypeToTag[item.post.type ?? PostType.Article];
      return <PostTag post={item.post} index={item.index} />;
    }
    case FeedItemType.Ad:
      return <AdCard ad={item.ad} />;
    default:
      return <PlaceholderCard />;
  }
}
