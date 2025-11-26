import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { MyProfileEmptyScreen } from '../../../components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '../../../components/profile/ProfileEmptyScreen';
import { link } from '../../../lib/links';
import {
  OtherFeedPage,
  generateQueryKey,
  RequestKey,
} from '../../../lib/query';
import type { FeedProps } from '../../../components/Feed';
import {
  AUTHOR_FEED_QUERY,
  USER_UPVOTED_FEED_QUERY,
} from '../../../graphql/feed';

export type ActivityTab = { id: string; title: string; path: string };

export interface FeedData {
  pages?: Array<{
    page?: {
      edges?: Array<unknown>;
    };
  }>;
}

export interface CommentsData {
  page?: {
    edges?: Array<unknown>;
  };
}

export enum ActivityTabIndex {
  Posts = 0,
  Replies = 1,
  Upvoted = 2,
}

export const activityTabs: ActivityTab[] = [
  {
    id: 'posts',
    title: 'Posts',
    path: '/posts',
  },
  {
    id: 'replies',
    title: 'Replies',
    path: '/replies',
  },
  {
    id: 'upvoted',
    title: 'Upvoted',
    path: '/upvoted',
  },
];

export const COMMENT_CLASS_NAME = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
} as const;

export const MIN_ITEMS_FOR_SHOW_MORE = 3;
export const HORIZONTAL_FEED_CLASSES =
  '[&_.grid]:!auto-cols-[17rem] tablet:[&_.grid]:!auto-cols-[20rem] [&_.grid]:gap-4';
export const TAB_ITEMS = activityTabs.map((tab) => ({ label: tab.title }));

export const ACTIVITY_QUERY_KEYS = {
  posts: (userId: string) => ['author', userId] as const,
  upvoted: (userId: string) => [OtherFeedPage.UserUpvoted, userId] as const,
  comments: (userId: string) =>
    generateQueryKey(RequestKey.UserComments, null, userId, 'activity'),
} as const;

export const getItemCount = (
  data: FeedData | CommentsData | undefined,
  tabIndex: ActivityTabIndex,
): number => {
  if (!data) {
    return 0;
  }

  switch (tabIndex) {
    case ActivityTabIndex.Posts:
    case ActivityTabIndex.Upvoted:
      return (data as FeedData)?.pages?.[0]?.page?.edges?.length ?? 0;
    case ActivityTabIndex.Replies:
      return (data as CommentsData)?.page?.edges?.length ?? 0;
    default:
      return 0;
  }
};

export const getUserPath = (
  username: string | undefined,
  userId: string | undefined,
  path: string,
): string => {
  const userIdentifier = username || userId;
  return `/${userIdentifier}${path}`;
};

export const renderEmptyScreen = (
  tabIndex: ActivityTabIndex,
  isSameUser: boolean,
  userName: string,
): ReactElement | null => {
  if (isSameUser) {
    switch (tabIndex) {
      case ActivityTabIndex.Posts:
        return (
          <MyProfileEmptyScreen
            className="min-h-[27.125rem] items-center justify-center px-4 py-6 text-center tablet:px-6"
            text="Hardest part of being a developer? Where do we start – it's everything. Go on, share with us your best rant."
            cta="New post"
            buttonProps={{ tag: 'a', href: link.post.create }}
          />
        );
      case ActivityTabIndex.Upvoted:
        return (
          <MyProfileEmptyScreen
            className="min-h-[27.125rem] items-center justify-center px-4 py-6 text-center tablet:px-6"
            text="Trapped in endless meetings? Make the most of It - Find posts you love and upvote away!"
            cta="Explore posts"
            buttonProps={{ tag: 'a', href: '/' }}
          />
        );
      case ActivityTabIndex.Replies:
        return (
          <MyProfileEmptyScreen
            className="min-h-[27.125rem] items-center justify-center px-4 py-6 text-center tablet:px-6"
            text="All tests have passed on the first try and you have no idea why? Time for a break. Browse the feed and join a discussion!"
            cta="Explore posts"
            buttonProps={{ tag: 'a', href: '/' }}
          />
        );
      default:
        return null;
    }
  }

  // Other user's profile
  switch (tabIndex) {
    case ActivityTabIndex.Posts:
      return (
        <ProfileEmptyScreen
          title={`${userName} hasn't posted yet`}
          text="Once they do, those posts will show up here."
        />
      );
    case ActivityTabIndex.Upvoted:
      return (
        <ProfileEmptyScreen
          title={`${userName} hasn't upvoted yet`}
          text="Once they do, those posts will show up here."
        />
      );
    case ActivityTabIndex.Replies:
      return (
        <ProfileEmptyScreen
          title={`${userName} hasn't replied to any post yet`}
          text="Once they do, those replies will show up here."
        />
      );
    default:
      return null;
  }
};

export const useActivityFeedProps = (
  userId: string,
  isSameUser: boolean,
  userName: string,
) => {
  const postsFeedProps: FeedProps<unknown> = useMemo(
    () => ({
      feedName: OtherFeedPage.Author,
      feedQueryKey: ACTIVITY_QUERY_KEYS.posts(userId),
      query: AUTHOR_FEED_QUERY,
      variables: {
        userId,
      },
      disableAds: true,
      allowFetchMore: false,
      pageSize: 10,
      isHorizontal: true,
      emptyScreen: renderEmptyScreen(
        ActivityTabIndex.Posts,
        isSameUser,
        userName,
      ),
    }),
    [userId, isSameUser, userName],
  );

  const upvotedFeedProps: FeedProps<unknown> = useMemo(
    () => ({
      feedName: OtherFeedPage.UserUpvoted,
      feedQueryKey: ACTIVITY_QUERY_KEYS.upvoted(userId),
      query: USER_UPVOTED_FEED_QUERY,
      variables: {
        userId,
      },
      disableAds: true,
      allowFetchMore: false,
      pageSize: 10,
      isHorizontal: true,
      emptyScreen: renderEmptyScreen(
        ActivityTabIndex.Upvoted,
        isSameUser,
        userName,
      ),
    }),
    [userId, isSameUser, userName],
  );

  return { postsFeedProps, upvotedFeedProps };
};
