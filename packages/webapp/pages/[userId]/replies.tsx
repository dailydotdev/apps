import React, { ReactElement } from 'react';
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
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
} from '../../components/layouts/ProfileLayout/v2';

const ShareModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "shareModal" */ '@dailydotdev/shared/src/components/modals/ShareModal'
    ),
);

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const commentClassName = {
  container: 'relative border-0 rounded-none',
};

const analyticsOrigin = Origin.Profile;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileCommentsPage = ({ profile }: ProfileLayoutProps): ReactElement => {
  const userId = profile?.id;

  const { shareComment, openShareComment, closeShareComment } =
    useShareComment(analyticsOrigin);
  const { onShowUpvoted } = useUpvoteQuery();
  const { deleteComment } = useDeleteComment();

  const queryResult = useInfiniteQuery<UserCommentsData>(
    ['user_comments', userId],
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

  const length = queryResult?.data?.pages?.length ?? 0;

  return (
    <>
      <InfiniteScrolling
        isFetchingNextPage={queryResult.isFetchingNextPage}
        canFetchMore={checkFetchMore(queryResult)}
        fetchNextPage={queryResult.fetchNextPage}
      >
        {length > 0 &&
          queryResult.data.pages.flatMap((page) =>
            page.page.edges.map(({ node }) => (
              <MainComment
                key={node.id}
                className="rounded-none border-0 border-b"
                commentBoxClassName={commentClassName}
                post={node.post}
                comment={node}
                origin={analyticsOrigin}
                onShare={(c) => openShareComment(c, c.post)}
                onDelete={(comment, parentId) =>
                  deleteComment(comment.id, parentId, comment.post)
                }
                onShowUpvotes={(id, count) =>
                  onShowUpvoted(id, count, 'comment')
                }
                onCommented={() => undefined}
                postAuthorId={null}
                postScoutId={null}
                appendTooltipTo={() => document.body}
                linkToComment
              />
            )),
          )}
      </InfiniteScrolling>
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
