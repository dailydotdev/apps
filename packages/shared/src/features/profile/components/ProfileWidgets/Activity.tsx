import type { ReactElement } from 'react';
import React, { useContext, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../../../lib/user';
import {
  Button,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import type { FeedProps } from '../../../../components/Feed';
import Feed from '../../../../components/Feed';
import { AUTHOR_FEED_QUERY, USER_UPVOTED_FEED_QUERY } from '../../../../graphql/feed';
import { OtherFeedPage } from '../../../../lib/query';
import { MyProfileEmptyScreen } from '../../../../components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '../../../../components/profile/ProfileEmptyScreen';
import AuthContext from '../../../../contexts/AuthContext';
import CommentFeed from '../../../../components/CommentFeed';
import { USER_COMMENTS_QUERY } from '../../../../graphql/comments';
import { Origin } from '../../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { link } from '../../../../lib/links';
import { useHorizontalScrollHeader } from '../../../../components/HorizontalScroll/useHorizontalScrollHeader';
import { TypographyType, Typography } from '../../../../components/typography/Typography';
import Link from '../../../../components/utilities/Link';
import FeedContext from '../../../../contexts/FeedContext';
import TabList from '../../../../components/tabs/TabList';
import { ButtonSize } from '../../../../components/buttons/common';

export type ActivityTab = { id: string; title: string; path: string };

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

interface ActivityProps {
  user: PublicProfile;
}

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

export const Activity = ({ user }: ActivityProps): ReactElement => {
  const [selectedTab, setSelectedTab] = useState<string>(activityTabs[0].title);
  const { user: loggedUser } = useContext(AuthContext);
  const currentFeedSettings = useContext(FeedContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;
  
  const selectedTabIndex = activityTabs.findIndex(tab => tab.title === selectedTab);

  const getUserPath = (path: string) => {
    const username = user?.username || user?.id;
    return `/${username}${path}`;
  };

  const feedContextValue = useMemo(() => {
    // We'll show 3 cards to make sure enough cards show on most screens
    const numCards = 3;
    
    return {
      ...currentFeedSettings,
      numCards: {
        eco: numCards,
        roomy: numCards,
        cozy: numCards,
      },
    };
  }, [currentFeedSettings]);

  const postsFeedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    allowFetchMore: false,
    pageSize: 10,
    isHorizontal: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        text="Hardest part of being a developer? Where do we start – it's everything. Go on, share with us your best rant."
        cta="New post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    ) : (
      <ProfileEmptyScreen
        title={`${user?.name ?? 'User'} hasn't posted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  const upvotedFeedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    allowFetchMore: false,
    pageSize: 10,
    isHorizontal: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        text="Trapped in endless meetings? Make the most of It - Find posts you love and upvote away!"
        cta="Explore posts"
        buttonProps={{ tag: 'a', href: '/' }}
      />
    ) : (
      <ProfileEmptyScreen
        title={`${user?.name ?? 'User'} hasn't upvoted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  const commentsEmptyScreen = isSameUser ? (
    <MyProfileEmptyScreen
      className="items-center px-4 py-6 text-center tablet:px-6"
      text="All tests have passed on the first try and you have no idea why? Time for a break. Browse the feed and join a discussion!"
      cta="Explore posts"
      buttonProps={{ tag: 'a', href: '/' }}
    />
  ) : (
    <ProfileEmptyScreen
      title={`${user?.name ?? 'User'} hasn't replied to any post yet`}
      text="Once they do, those replies will show up here."
    />
  );

  // Query to check if there are more than 3 posts
  const { data: postsData } = useQuery({
    queryKey: ['author', userId],
    enabled: false, // Don't auto-fetch, Feed component handles fetching
  });

  // Query to check if there are more than 3 upvoted posts
  const { data: upvotedData } = useQuery({
    queryKey: [OtherFeedPage.UserUpvoted, userId],
    enabled: false,
  });

  // Query to check if there are more than 3 comments
  const { data: commentsData } = useQuery({
    queryKey: generateQueryKey(RequestKey.UserComments, null, userId),
    enabled: false,
  });

  // Check if current tab has more than 3 items to show "Show More" button
  const shouldShowMoreButton = useMemo(() => {
    const MIN_ITEMS = 3;
    
    switch (selectedTabIndex) {
      case 0: // Posts
        return ((postsData as any)?.pages?.[0]?.page?.edges?.length ?? 0) > MIN_ITEMS;
      case 1: // Replies
        return ((commentsData as any)?.page?.edges?.length ?? 0) > MIN_ITEMS;
      case 2: // Upvoted
        return ((upvotedData as any)?.pages?.[0]?.page?.edges?.length ?? 0) > MIN_ITEMS;
      default:
        return false;
    }
  }, [selectedTabIndex, postsData, commentsData, upvotedData]);

  // Render custom title content (shared across all tabs)
  const renderTitleContent = () => (
    <div className="flex flex-col gap-3">
      <Typography type={TypographyType.Body} bold>
        Activity
      </Typography>
        <TabList
          items={activityTabs.map(tab => ({ label: tab.title }))}
          active={selectedTab}
          onClick={(label) => setSelectedTab(label)}
          className={{ item: '!p-0 !pr-3', indicator: 'hidden' }}
        />
    </div>
  );

  // Use horizontal scroll header (with navigation arrows) for Posts/Upvoted
  const { ref, header: horizontalHeader } = useHorizontalScrollHeader({
    title: renderTitleContent(),
    className: '!items-end !mb-0',
    buttonSize: ButtonSize.Small,
  });

  const renderContent = () => {
    switch (selectedTabIndex) {
      case 0: // Posts
        return (
          <FeedContext.Provider value={feedContextValue}>
              <Feed
                {...postsFeedProps}
                className="[&_.grid]:!auto-cols-[17rem] [&_.grid]:gap-4"
                feedContainerRef={ref}
              />
          </FeedContext.Provider>
        );
      case 1: // Replies
        return (
          <CommentFeed
            feedQueryKey={generateQueryKey(RequestKey.UserComments, null, userId)}
            query={USER_COMMENTS_QUERY}
            logOrigin={Origin.Profile}
            variables={{ userId }}
            emptyScreen={commentsEmptyScreen}
            commentClassName={commentClassName}
          />
        );
      case 2: // Upvoted
        return (
          <FeedContext.Provider value={feedContextValue}>
            <Feed
                {...upvotedFeedProps}
                className="[&_.grid]:!auto-cols-[17rem] [&_.grid]:gap-4"
                feedContainerRef={ref}
              />
          </FeedContext.Provider>
        );
      default:
        return null;
    }
  };

  // Conditionally render header based on tab type
  const renderHeader = () => {
    // Replies tab: just show title (no horizontal scroll arrows)
    if (selectedTabIndex === 1) {
      return (
        <div className="mx-4 flex min-h-10 w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full">
          {renderTitleContent()}
        </div>
      );
    }
    
    // Posts/Upvoted tabs: show title + horizontal scroll arrows
    return horizontalHeader;
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden pt-6">
      {renderHeader()}
      {renderContent()}
      {shouldShowMoreButton && (
        <Link href={getUserPath(activityTabs[selectedTabIndex].path)} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Subtle}
            className="w-full"
          >
            Show More
          </Button>
        </Link>
      )}
    </div>
  );
};

