import type { ReactElement } from 'react';
import React from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { PostTypeToGridCard } from '@dailydotdev/shared/src/components/cards/common/gridCards';
import { PostTypeToListCard } from '@dailydotdev/shared/src/components/cards/common/listCards';
import { ArticleList } from '@dailydotdev/shared/src/components/cards/article/ArticleList';
import { ArticleGrid } from '@dailydotdev/shared/src/components/cards/article/ArticleGrid';
import realFeed from './realFeed.json';

/**
 * 40 posts from the live anonymous feed (api.daily.dev, popularity ranking,
 * fetched 2026-10-08): real titles, covers, sources and counts.
 */
export const realPosts: Post[] = realFeed.posts.map(
  (p) =>
    ({
      ...p,
      title: p.title ?? '',
      bookmarked: false,
      read: false,
      commented: false,
      numAwards: 0,
      userState: { vote: UserVote.None, flags: { feedbackDismiss: false } },
      sharedPost: p.sharedPost
        ? { ...p.sharedPost, private: false, summary: '' }
        : undefined,
    } as unknown as Post),
);

/** Production grid card, or list card below 1,020px. */
export const RealCard = ({
  post,
  list = false,
}: {
  post: Post;
  list?: boolean;
}): ReactElement => {
  const Card = list
    ? PostTypeToListCard[post.type] ?? ArticleList
    : PostTypeToGridCard[post.type] ?? ArticleGrid;

  return (
    <Card
      post={post}
      onPostClick={fn()}
      onPostAuxClick={fn()}
      onUpvoteClick={fn()}
      onDownvoteClick={fn()}
      onCommentClick={fn()}
      onBookmarkClick={fn()}
      onCopyLinkClick={fn()}
      onShare={fn()}
      onReadArticleClick={fn()}
    />
  );
};

/** Production v1 collapsed rail and grid gap. */
export const GEOMETRY = {
  sidebarClosed: 44,
  gap: 32,
};

const BREAKPOINTS: [number, number][] = [
  [1976, 6],
  [1668, 5],
  [1360, 4],
  [1020, 3],
  [656, 2],
  [0, 1],
];

/**
 * FeedContext shifts its breakpoints by the sidebar's width, so the column
 * count is decided by what is left after the collapsed rail.
 */
export const columnsForViewport = (width: number): number => {
  const left = width - (width >= 1020 ? GEOMETRY.sidebarClosed : 0);
  return BREAKPOINTS.find(([min]) => left >= min)?.[1] ?? 1;
};
