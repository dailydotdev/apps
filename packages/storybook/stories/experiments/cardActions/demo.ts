import { useState } from 'react';
import { fn } from 'storybook/test';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';

/**
 * Helpers shared by every card-actions page: the two number formats and the
 * click state that makes each demo bar usable.
 */

/** Production's rule today: one decimal on every abbreviated number. */
export const format = (value: number): string =>
  largeNumberFormat(value) ?? String(value);

/**
 * Proposed rule: a decimal only while the leading number is a single digit
 * (1.7K, 9.9K, 1.2M); from 10 up it is whole (23K, 234K). Every count is then
 * at most four characters. Rounds down, so 999,999 reads 999K, never 1000K.
 */
export const compactCount = (value: number): string => {
  const units: [string, number][] = [
    ['B', 1e9],
    ['M', 1e6],
    ['K', 1e3],
  ];
  const unit = units.find(([, size]) => value >= size);
  if (!unit) {
    return String(value);
  }
  const [suffix, size] = unit;
  const scaled = value / size;
  if (scaled >= 10) {
    return `${Math.floor(scaled)}${suffix}`;
  }
  const tenths = Math.floor(scaled * 10) / 10;
  return `${tenths % 1 === 0 ? tenths.toFixed(0) : tenths.toFixed(1)}${suffix}`;
};

/* ------------------------------------------------------------------------ */
/* Demo state: every bar is clickable, so a reviewer can feel the targets.   */
/* ------------------------------------------------------------------------ */

export interface DemoActions {
  upvoted: boolean;
  downvoted: boolean;
  bookmarked: boolean;
  upvotes: number;
  comments: number;
  impressions: number;
  toggleUpvote: () => void;
  toggleDownvote: () => void;
  toggleBookmark: () => void;
  noop: () => void;
}

export const useDemoActions = (post: Post): DemoActions => {
  const [vote, setVote] = useState<UserVote>(UserVote.None);
  const [bookmarked, setBookmarked] = useState(false);
  return {
    upvoted: vote === UserVote.Up,
    downvoted: vote === UserVote.Down,
    bookmarked,
    upvotes: (post.numUpvotes ?? 0) + (vote === UserVote.Up ? 1 : 0),
    comments: post.numComments ?? 0,
    impressions: post.analytics?.impressions ?? 0,
    toggleUpvote: () =>
      setVote((v) => (v === UserVote.Up ? UserVote.None : UserVote.Up)),
    toggleDownvote: () =>
      setVote((v) => (v === UserVote.Down ? UserVote.None : UserVote.Down)),
    toggleBookmark: () => setBookmarked((b) => !b),
    noop: fn(),
  };
};
