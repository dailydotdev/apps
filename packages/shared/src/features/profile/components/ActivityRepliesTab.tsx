import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import type { PublicProfile } from '../../../lib/user';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { USER_COMMENTS_QUERY } from '../../../graphql/comments';
import type { CommentFeedData } from '../../../graphql/comments';
import { Origin } from '../../../lib/log';
import Link from '../../../components/utilities/Link';
import {
  ActivityTabIndex,
  activityTabs,
  COMMENT_CLASS_NAME,
  MIN_ITEMS_FOR_SHOW_MORE,
  ACTIVITY_QUERY_KEYS,
  getUserPath,
  renderEmptyScreen,
} from './Activity.helpers';
import { ActivityHeader } from './ActivityHeader';
import MainComment from '../../../components/comments/MainComment';
import PlaceholderCommentList from '../../../components/comments/PlaceholderCommentList';
import { useShareComment } from '../../../hooks/useShareComment';
import { useUpvoteQuery } from '../../../hooks/useUpvoteQuery';
import { useDeleteComment } from '../../../hooks/comments/useDeleteComment';
import { gqlClient } from '../../../graphql/common';

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
  const { openShareComment } = useShareComment(Origin.Profile);
  const { onShowUpvoted } = useUpvoteQuery();
  const { deleteComment } = useDeleteComment();

  const queryResult = useQuery<CommentFeedData>({
    queryKey: ACTIVITY_QUERY_KEYS.comments(userId),
    queryFn: () =>
      gqlClient.request(USER_COMMENTS_QUERY, {
        userId,
        first: 10,
      }),
  });

  const showEmptyScreen = queryResult.data?.page?.edges?.length === 0;

  const shouldShowMoreButton = useMemo(() => {
    const itemCount = queryResult.data?.page?.edges?.length ?? 0;
    return itemCount > MIN_ITEMS_FOR_SHOW_MORE;
  }, [queryResult.data]);

  if (queryResult.isPending) {
    return (
      <>
        <div className="flex min-h-10 w-auto flex-row items-center justify-between laptop:w-full">
          <ActivityHeader selectedTab={selectedTab} onTabClick={onTabClick} />
        </div>
        <PlaceholderCommentList
          placeholderAmount={5}
          className={classNames(
            '!mt-0 border-border-subtlest-tertiary p-4',
            COMMENT_CLASS_NAME?.container,
          )}
          showContextHeader
        />
      </>
    );
  }

  return (
    <>
      <div className="flex min-h-10 w-auto flex-row items-center justify-between laptop:w-full">
        <ActivityHeader selectedTab={selectedTab} onTabClick={onTabClick} />
      </div>
      {showEmptyScreen ? (
        renderEmptyScreen(ActivityTabIndex.Replies, isSameUser, userName)
      ) : (
        <div className="w-full">
          {queryResult.data?.page?.edges?.map(({ node }) => (
            <MainComment
              key={node.id}
              className={{
                ...COMMENT_CLASS_NAME,
                container: COMMENT_CLASS_NAME?.container,
              }}
              post={node.post}
              comment={node}
              origin={Origin.Profile}
              onShare={(c) => openShareComment(c, c.post)}
              onDelete={(comment, parentId) =>
                deleteComment(comment.id, parentId, comment.post)
              }
              onShowUpvotes={(id, count) => onShowUpvoted(id, count, 'comment')}
              onCommented={() => undefined}
              postAuthorId={null}
              postScoutId={null}
              appendTooltipTo={() => document.body}
              linkToComment
              lazy
              showContextHeader
              logImpression
              logClick
            />
          ))}
        </div>
      )}
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
