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
  useActivityFeedProps,
} from './Activity.helpers';

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

export const Activity = ({ user }: ActivityProps): ReactElement | null => {
  const [selectedTab, setSelectedTab] = useState<string>(activityTabs[0].title);
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;

  const selectedTabIndex = useMemo(
    () => activityTabs.findIndex((tab) => tab.title === selectedTab),
    [selectedTab],
  );

  const { postsFeedProps, upvotedFeedProps } = useActivityFeedProps(
    userId,
    isSameUser,
    user?.name ?? 'User',
  );

  const { data: postsData } = useQuery<FeedData>({
    queryKey: ACTIVITY_QUERY_KEYS.posts(userId),
    enabled: false,
  });

  const { data: upvotedData } = useQuery<FeedData>({
    queryKey: ACTIVITY_QUERY_KEYS.upvoted(userId),
    enabled: false,
  });

  const { data: commentsData } = useQuery<CommentsData>({
    queryKey: ACTIVITY_QUERY_KEYS.comments(userId),
    enabled: false,
  });

  const shouldShowMoreButton = useMemo(() => {
    let data: FeedData | CommentsData | undefined;

    if (selectedTabIndex === ActivityTabIndex.Posts) {
      data = postsData;
    } else if (selectedTabIndex === ActivityTabIndex.Replies) {
      data = commentsData;
    } else {
      data = upvotedData;
    }

    const itemCount = getItemCount(data, selectedTabIndex);
    return itemCount > MIN_ITEMS_FOR_SHOW_MORE;
  }, [selectedTabIndex, postsData, commentsData, upvotedData]);

  const handleTabClick = useCallback((label: string) => {
    setSelectedTab(label);
  }, []);

  const { ref, header: horizontalHeader } = useHorizontalScrollHeader({
    title: (
      <ActivityHeader selectedTab={selectedTab} onTabClick={handleTabClick} />
    ),
    className: '!items-end !m-0',
    buttonSize: ButtonSize.Small,
  });

  const renderContent = () => {
    switch (selectedTabIndex) {
      case ActivityTabIndex.Posts:
        return (
          <HorizontalFeedWithContext feedProps={postsFeedProps} feedRef={ref} />
        );
      case ActivityTabIndex.Replies:
        return (
          <CommentFeed
            feedQueryKey={ACTIVITY_QUERY_KEYS.comments(userId)}
            query={USER_COMMENTS_QUERY}
            logOrigin={Origin.Profile}
            variables={{ userId }}
            emptyScreen={renderEmptyScreen(
              ActivityTabIndex.Replies,
              isSameUser,
              user?.name ?? 'User',
            )}
            commentClassName={COMMENT_CLASS_NAME}
          />
        );
      case ActivityTabIndex.Upvoted:
        return (
          <HorizontalFeedWithContext
            feedProps={upvotedFeedProps}
            feedRef={ref}
          />
        );
      default:
        return null;
    }
  };

  const renderHeader = () => {
    if (selectedTabIndex !== ActivityTabIndex.Replies) {
      return horizontalHeader;
    }

    return (
      <div className="laptop:w-full flex min-h-10 w-auto flex-row items-center justify-between">
        <ActivityHeader selectedTab={selectedTab} onTabClick={handleTabClick} />
      </div>
    );
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3 overflow-hidden pt-6">
      {renderHeader()}
      {renderContent()}
      {shouldShowMoreButton && (
        <Link
          href={getUserPath(
            user?.username,
            user?.id,
            activityTabs[selectedTabIndex].path,
          )}
          passHref
        >
          <Button tag="a" variant={ButtonVariant.Subtle} className="w-full">
            Show More
          </Button>
        </Link>
      )}
    </div>
  );
};
