import type { ReactElement, RefObject } from 'react';
import React, { useContext, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../../lib/user';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import type { FeedProps } from '../../../components/Feed';
import Feed from '../../../components/Feed';
import AuthContext from '../../../contexts/AuthContext';
import CommentFeed from '../../../components/CommentFeed';
import { USER_COMMENTS_QUERY } from '../../../graphql/comments';
import { Origin } from '../../../lib/log';
import { useHorizontalScrollHeader } from '../../../components/HorizontalScroll/useHorizontalScrollHeader';
import {
  TypographyType,
  Typography,
} from '../../../components/typography/Typography';
import Link from '../../../components/utilities/Link';
import FeedContext from '../../../contexts/FeedContext';
import TabList from '../../../components/tabs/TabList';
import { ButtonSize } from '../../../components/buttons/common';
import type { FeedData, CommentsData } from './Activity.helpers';
import {
  ActivityTabIndex,
  activityTabs,
  COMMENT_CLASS_NAME,
  MIN_ITEMS_FOR_SHOW_MORE,
  HORIZONTAL_FEED_CLASSES,
  TAB_ITEMS,
  ACTIVITY_QUERY_KEYS,
  getItemCount,
  getUserPath,
  renderEmptyScreen,
} from './Activity.helpers';
import { OtherFeedPage } from '../../../lib/query';
import {
  AUTHOR_FEED_QUERY,
  USER_UPVOTED_FEED_QUERY,
} from '../../../graphql/feed';

type ActivityProps = {
  user: PublicProfile;
};

interface ActivityHeaderProps {
  selectedTab: string;
  onTabClick: (label: string) => void;
}

const ActivityHeader = ({
  selectedTab,
  onTabClick,
}: ActivityHeaderProps): ReactElement => {
  return (
    <div className="flex flex-col gap-3">
      <Typography type={TypographyType.Body} bold>
        Activity
      </Typography>
      <TabList
        items={TAB_ITEMS}
        active={selectedTab}
        onClick={onTabClick}
        className={{ item: '!p-0 !pr-3', indicator: 'hidden' }}
      />
    </div>
  );
};

interface HorizontalFeedWithContextProps {
  feedProps: FeedProps<unknown>;
  feedRef: RefObject<HTMLElement>;
}

const HorizontalFeedWithContext = ({
  feedProps,
  feedRef,
}: HorizontalFeedWithContextProps): ReactElement => {
  const currentFeedSettings = useContext(FeedContext);

  const feedContextValue = useMemo(() => {
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

  return (
    <FeedContext.Provider value={feedContextValue}>
      <Feed
        {...feedProps}
        className={HORIZONTAL_FEED_CLASSES}
        feedContainerRef={feedRef as RefObject<HTMLDivElement>}
      />
    </FeedContext.Provider>
  );
};

const PostsTab = ({
  userId,
  isSameUser,
  userName,
  user,
  selectedTab,
  onTabClick,
}: {
  userId: string;
  isSameUser: boolean;
  userName: string;
  user: PublicProfile;
  selectedTab: string;
  onTabClick: (label: string) => void;
}): ReactElement => {
  const feedProps: FeedProps<unknown> = useMemo(
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

  const { data: postsData } = useQuery<FeedData>({
    queryKey: ACTIVITY_QUERY_KEYS.posts(userId),
    enabled: false,
  });

  const shouldShowMoreButton = useMemo(() => {
    const itemCount = getItemCount(postsData, ActivityTabIndex.Posts);
    return itemCount > MIN_ITEMS_FOR_SHOW_MORE;
  }, [postsData]);

  const { ref, header } = useHorizontalScrollHeader({
    title: <ActivityHeader selectedTab={selectedTab} onTabClick={onTabClick} />,
    className: '!items-end !m-0',
    buttonSize: ButtonSize.Small,
  });

  return (
    <>
      {header}
      <HorizontalFeedWithContext feedProps={feedProps} feedRef={ref} />
      {shouldShowMoreButton && (
        <Link
          href={getUserPath(
            user?.username,
            user?.id,
            activityTabs[ActivityTabIndex.Posts].path,
          )}
          passHref
        >
          <Button tag="a" variant={ButtonVariant.Subtle} className="w-full">
            Show More
          </Button>
        </Link>
      )}
    </>
  );
};

const UpvotedTab = ({
  userId,
  isSameUser,
  userName,
  user,
  selectedTab,
  onTabClick,
}: {
  userId: string;
  isSameUser: boolean;
  userName: string;
  user: PublicProfile;
  selectedTab: string;
  onTabClick: (label: string) => void;
}): ReactElement => {
  const feedProps: FeedProps<unknown> = useMemo(
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

  const { data: upvotedData } = useQuery<FeedData>({
    queryKey: ACTIVITY_QUERY_KEYS.upvoted(userId),
    enabled: false,
  });

  const shouldShowMoreButton = useMemo(() => {
    const itemCount = getItemCount(upvotedData, ActivityTabIndex.Upvoted);
    return itemCount > MIN_ITEMS_FOR_SHOW_MORE;
  }, [upvotedData]);

  const { ref, header } = useHorizontalScrollHeader({
    title: <ActivityHeader selectedTab={selectedTab} onTabClick={onTabClick} />,
    className: '!items-end !m-0',
    buttonSize: ButtonSize.Small,
  });

  return (
    <>
      {header}
      <HorizontalFeedWithContext feedProps={feedProps} feedRef={ref} />
      {shouldShowMoreButton && (
        <Link
          href={getUserPath(
            user?.username,
            user?.id,
            activityTabs[ActivityTabIndex.Upvoted].path,
          )}
          passHref
        >
          <Button tag="a" variant={ButtonVariant.Subtle} className="w-full">
            Show More
          </Button>
        </Link>
      )}
    </>
  );
};

const RepliesTab = ({
  userId,
  isSameUser,
  userName,
  user,
  selectedTab,
  onTabClick,
}: {
  userId: string;
  isSameUser: boolean;
  userName: string;
  user: PublicProfile;
  selectedTab: string;
  onTabClick: (label: string) => void;
}): ReactElement => {
  const { data: commentsData } = useQuery<CommentsData>({
    queryKey: ACTIVITY_QUERY_KEYS.comments(userId),
    enabled: false,
  });

  const shouldShowMoreButton = useMemo(() => {
    const itemCount = getItemCount(commentsData, ActivityTabIndex.Replies);
    return itemCount > MIN_ITEMS_FOR_SHOW_MORE;
  }, [commentsData]);

  return (
    <>
      <div className="flex min-h-10 w-auto flex-row items-center justify-between laptop:w-full">
        <ActivityHeader selectedTab={selectedTab} onTabClick={onTabClick} />
      </div>
      <CommentFeed
        feedQueryKey={ACTIVITY_QUERY_KEYS.comments(userId)}
        query={USER_COMMENTS_QUERY}
        logOrigin={Origin.Profile}
        variables={{ userId }}
        emptyScreen={renderEmptyScreen(
          ActivityTabIndex.Replies,
          isSameUser,
          userName,
        )}
        commentClassName={COMMENT_CLASS_NAME}
      />
      {shouldShowMoreButton && (
        <Link
          href={getUserPath(
            user?.username,
            user?.id,
            activityTabs[ActivityTabIndex.Replies].path,
          )}
          passHref
        >
          <Button tag="a" variant={ButtonVariant.Subtle} className="w-full">
            Show More
          </Button>
        </Link>
      )}
    </>
  );
};

export const Activity = ({ user }: ActivityProps): ReactElement | null => {
  const [selectedTab, setSelectedTab] = useState<string>(activityTabs[0].title);
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;

  const selectedTabIndex = useMemo(
    () => activityTabs.findIndex((tab) => tab.title === selectedTab),
    [selectedTab],
  );

  const handleTabClick = useCallback((label: string) => {
    setSelectedTab(label);
  }, []);

  const renderContent = () => {
    switch (selectedTabIndex) {
      case ActivityTabIndex.Posts:
        return (
          <PostsTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      case ActivityTabIndex.Replies:
        return (
          <RepliesTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      case ActivityTabIndex.Upvoted:
        return (
          <UpvotedTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      default:
        return null;
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3 overflow-hidden pt-6">
      {renderContent()}
    </div>
  );
};
