import React, { FunctionComponent, ReactElement } from 'react';
import { FeedItem } from '../../hooks/useFeed';
import { AdCard } from '../cards/AdCard';
import { PlaceholderCard } from '../cards/PlaceholderCard';
import { PostType } from '../../graphql/posts';
import { LeanWelcomePostCard } from './cards/LeanWelcomePostCard';
import { LeanSharePostCard } from './cards/LeanSharePostCard';
import { LeanArticlePostCard } from './cards/LeanArticlePostCard';

export type LeanFeedItemComponentProps = {
  item: FeedItem;
};

const PostTypeToTag: Record<PostType, FunctionComponent> = {
  [PostType.Article]: LeanArticlePostCard,
  [PostType.Share]: LeanSharePostCard,
  [PostType.Welcome]: LeanWelcomePostCard,
  [PostType.Freeform]: LeanWelcomePostCard,
};

export default function LeanFeedItemComponent({
  item,
}: LeanFeedItemComponentProps): ReactElement {
  const AdTag = AdCard;
  const PlaceholderTag = PlaceholderCard;

  switch (item.type) {
    case 'post': {
      const PostTag = PostTypeToTag[item.post.type] ?? LeanArticlePostCard;
      return (
        <PostTag
          post={{
            ...item.post,
          }}
          data-testid="postItem"
        />
      );
    }
    case 'ad':
      return <AdTag ad={item.ad} />;
    default:
      return <PlaceholderTag />;
  }
}
