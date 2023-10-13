import React, { FunctionComponent, ReactElement } from 'react';
import { FeedItem } from '../../hooks/useFeed';
import { ArticlePostCard } from '../cards/ArticlePostCard';
import { AdCard } from '../cards/AdCard';
import { PlaceholderCard } from '../cards/PlaceholderCard';
import { PostType } from '../../graphql/posts';
import { SharePostCard } from '../cards/SharePostCard';
import { WelcomePostCard } from '../cards/WelcomePostCard';

export type LeanFeedItemComponentProps = {
  item: FeedItem;
};

const PostTypeToTag: Record<PostType, FunctionComponent> = {
  [PostType.Article]: ArticlePostCard,
  [PostType.Share]: SharePostCard,
  [PostType.Welcome]: WelcomePostCard,
  [PostType.Freeform]: WelcomePostCard,
};

export default function LeanFeedItemComponent({
  item,
}: LeanFeedItemComponentProps): ReactElement {
  const AdTag = AdCard;
  const PlaceholderTag = PlaceholderCard;

  switch (item.type) {
    case 'post': {
      const PostTag = PostTypeToTag[item.post.type] ?? ArticlePostCard;
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
