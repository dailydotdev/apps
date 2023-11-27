import React, { ReactElement } from 'react';
import {
  ArticleCard,
  CardType,
  PlaceholderCard,
  SquadShareCard,
} from '../cards';
import { FeedItem, FeedItemType } from '../../../hooks/useFeed';
import { PostType } from '../../../graphql/posts';
import { AdCard } from '../../cards/AdCard';

export type LeanFeedItemComponentProps = {
  item: FeedItem;
};

const ItemTypeToTag: Record<PostType, React.ComponentType<CardType>> = {
  [PostType.Article]: ArticleCard,
  [PostType.Share]: SquadShareCard,
  [PostType.Welcome]: ArticleCard,
  [PostType.Freeform]: ArticleCard,
};

export default function SquadFeedItemComponent({
  item,
}: LeanFeedItemComponentProps): ReactElement {
  switch (item.type) {
    case FeedItemType.Post: {
      const PostTag = ItemTypeToTag[item.post.type ?? PostType.Article];
      return <PostTag post={item.post} />;
    }
    case FeedItemType.Ad:
      return <AdCard ad={item.ad} />;
    default:
      return <PlaceholderCard />;
  }
}
