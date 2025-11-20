import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../../lib/user';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import type { FeedProps } from '../../../components/Feed';
import Link from '../../../components/utilities/Link';
import { ButtonSize } from '../../../components/buttons/common';
import type { FeedData } from './Activity.helpers';
import {
  ActivityTabIndex,
  activityTabs,
  MIN_ITEMS_FOR_SHOW_MORE,
  ACTIVITY_QUERY_KEYS,
  getItemCount,
  getUserPath,
  renderEmptyScreen,
} from './Activity.helpers';
import { OtherFeedPage } from '../../../lib/query';
import { USER_UPVOTED_FEED_QUERY } from '../../../graphql/feed';
import { useHorizontalScrollHeader } from '../../../components/HorizontalScroll/useHorizontalScrollHeader';
import { ActivityHeader } from './ActivityHeader';
import { HorizontalFeedWithContext } from './HorizontalFeedWithContext';

export const ActivityUpvotedTab = ({
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
