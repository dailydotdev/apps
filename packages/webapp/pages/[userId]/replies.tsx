import React, { ReactElement, ReactNode, useContext } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  USER_COMMENTS_QUERY,
  UserCommentsData,
} from '@dailydotdev/shared/src/graphql/comments';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import InfiniteScrolling, {
  checkFetchMore,
} from '@dailydotdev/shared/src/components/containers/InfiniteScrolling';
import dynamic from 'next/dynamic';
import { useShareComment } from '@dailydotdev/shared/src/hooks/useShareComment';
import { useUpvoteQuery } from '@dailydotdev/shared/src/hooks/useUpvoteQuery';
import { useDeleteComment } from '@dailydotdev/shared/src/hooks/comments/useDeleteComment';
import MainComment from '@dailydotdev/shared/src/components/comments/MainComment';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import {
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
} from '../../components/layouts/ProfileLayout';

const ShareModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "shareModal" */ '@dailydotdev/shared/src/components/modals/ShareModal'
    ),
);

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

const analyticsOrigin = Origin.Profile;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileCommentsPage = ({ user }: ProfileLayoutProps): ReactElement => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;

  const userId = user?.id;

  const { shareComment, openShareComment, closeShareComment } =
    useShareComment(analyticsOrigin);
  const { onShowUpvoted } = useUpvoteQuery();
  const { deleteComment } = useDeleteComment();

  const queryResult = useInfiniteQuery<UserCommentsData>(
    generateQueryKey(RequestKey.UserComments, null, userId),
    ({ pageParam }) =>
      request(graphqlUrl, USER_COMMENTS_QUERY, {
        userId,
        first: 20,
        after: pageParam,
      }),
    {
      enabled: !!userId,
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );

  const length = queryResult?.data?.pages?.length;
  const showEmptyScreen =
    length > 0 && queryResult.data.pages[0].page.edges.length === 0;
  let children: ReactNode;
  if (length > 0 && !showEmptyScreen) {
    children = (
      <InfiniteScrolling
        isFetchingNextPage={queryResult.isFetchingNextPage}
        canFetchMore={checkFetchMore(queryResult)}
        fetchNextPage={queryResult.fetchNextPage}
      >
        {queryResult.data.pages.flatMap((page) =>
          page.page.edges.map(({ node }) => (
            <MainComment
              key={node.id}
              className={commentClassName}
              post={node.post}
              comment={node}
              origin={analyticsOrigin}
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
            />
          )),
        )}
      </InfiniteScrolling>
    );
  } else if (showEmptyScreen) {
    if (isSameUser) {
      children = (
        <MyProfileEmptyScreen
          className="items-center px-4 py-6 text-center tablet:px-6"
          text="All tests have passed on the first try and you have no idea why? Time for a break. Browse the feed and join a discussion!"
          cta="Explore posts"
          buttonProps={{ tag: 'a', href: '/' }}
        />
      );
    } else {
      children = (
        <ProfileEmptyScreen
          title={`${user.name} hasn't replied to any post yet`}
          text="Once they do, those replies will show up here."
        />
      );
    }
  }

  return (
    <>
      {children}
      {shareComment && (
        <ShareModal
          isOpen={!!shareComment}
          post={shareComment.post}
          comment={shareComment}
          origin={analyticsOrigin}
          onRequestClose={closeShareComment}
        />
      )}
    </>
  );
};

ProfileCommentsPage.getLayout = getProfileLayout;
export default ProfileCommentsPage;
