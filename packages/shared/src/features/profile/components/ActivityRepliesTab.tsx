import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicProfile } from '../../../lib/user';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import CommentFeed from '../../../components/CommentFeed';
import { USER_COMMENTS_QUERY } from '../../../graphql/comments';
import { Origin } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import type { CommentsData } from './Activity.helpers';
import {
  ActivityTabIndex,
  activityTabs,
  COMMENT_CLASS_NAME,
  MIN_ITEMS_FOR_SHOW_MORE,
  ACTIVITY_QUERY_KEYS,
  getItemCount,
  getUserPath,
  renderEmptyScreen,
} from './Activity.helpers';
import { ActivityHeader } from './ActivityHeader';

export const ActivityRepliesTab = ({
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
        pageSize={10}
        allowFetchMore={false}
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
