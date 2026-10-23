import type { ReactElement } from 'react';
import React, { createContext, useContext } from 'react';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';

// Opening a post from the feed: the card's click makes it the page's post,
// so the review can be read through, post to post, the way production's
// card navigates to the post page.

const OpenContext = createContext<(post: Post) => void>(() => undefined);

export const OpenProvider = OpenContext.Provider;

export const useOpen = (): ((post: Post) => void) => useContext(OpenContext);

const noop = (): void => undefined;

/** Production's list card for the post's type, the phone feed's card. */
export const ListCard = ({ post }: { post: Post }): ReactElement => {
  const open = useOpen();
  const Card = PostTypeToListCard[post.type] ?? ArticleList;
  return (
    <Card
      post={post}
      onPostClick={(clicked: Post) => open(clicked)}
      onCommentClick={(clicked: Post) => open(clicked)}
      onPostAuxClick={noop}
      onReadArticleClick={noop}
      onUpvoteClick={noop}
      onDownvoteClick={noop}
      onBookmarkClick={noop}
      onCopyLinkClick={noop}
      onShare={noop}
      onMenuClick={noop}
    />
  );
};
