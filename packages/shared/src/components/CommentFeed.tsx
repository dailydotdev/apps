import React, { ReactElement, ReactNode } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import request from 'graphql-request';
import classNames from 'classnames';
import InfiniteScrolling, {
  checkFetchMore,
} from './containers/InfiniteScrolling';
import MainComment from './comments/MainComment';
import { Origin } from '../lib/analytics';
import { useShareComment } from '../hooks/useShareComment';
import { useUpvoteQuery } from '../hooks/useUpvoteQuery';
import { useDeleteComment } from '../hooks/comments/useDeleteComment';
import { Comment } from '../graphql/comments';
import { graphqlUrl } from '../lib/config';
import { Connection } from '../graphql/common';
import PlaceholderCommentList from './comments/PlaceholderCommentList';
import { CommentClassName } from './comments/common';
import { useMobileUxExperiment } from '../hooks/useMobileUxExperiment';

interface CommentFeedProps<T> {
  feedQueryKey: unknown[];
  query: string;
  analyticsOrigin: Origin;
  variables?: T;
  emptyScreen?: ReactNode;
  commentClassName?: CommentClassName;
  isMainFeed?: boolean;
}

interface CommentFeedData {
  page: Connection<Comment>;
}
export default function CommentFeed<T>({
  feedQueryKey,
  query,
  analyticsOrigin,
  variables,
  emptyScreen,
  commentClassName,
  isMainFeed,
}: CommentFeedProps<T>): ReactElement {
  const { openShareComment } = useShareComment(analyticsOrigin);
  const { onShowUpvoted } = useUpvoteQuery();
  const { deleteComment } = useDeleteComment();
  const { isNewMobileLayout } = useMobileUxExperiment();

  const queryResult = useInfiniteQuery<CommentFeedData>(
    feedQueryKey,
    ({ pageParam }) =>
      request(graphqlUrl, query, {
        ...variables,
        first: 20,
        after: pageParam,
      }),
    {
      getNextPageParam: (lastPage) =>
        lastPage.page.pageInfo.hasNextPage && lastPage.page.pageInfo.endCursor,
    },
  );
  const length = queryResult?.data?.pages?.length;
  const showEmptyScreen =
    length > 0 && queryResult.data.pages[0].page.edges.length === 0;

  if (queryResult.isLoading) {
    return (
      <PlaceholderCommentList
        placeholderAmount={5}
        className={classNames(
          '!mt-0 border-border-subtlest-tertiary p-4',
          commentClassName?.container,
        )}
        showContextHeader
      />
    );
  }

  if (showEmptyScreen && emptyScreen) {
    return <>{emptyScreen}</>;
  }

  return (
    <>
      <InfiniteScrolling
        isFetchingNextPage={queryResult.isFetchingNextPage}
        canFetchMore={checkFetchMore(queryResult)}
        fetchNextPage={queryResult.fetchNextPage}
        className="w-full"
      >
        {queryResult.data.pages.flatMap((page) =>
          page.page.edges.map(({ node }, index) => (
            <MainComment
              key={node.id}
              className={{
                ...commentClassName,
                container: classNames(
                  commentClassName.container,
                  index === 0 &&
                    isNewMobileLayout &&
                    isMainFeed &&
                    'rounded-t-24 border-t',
                ),
              }}
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
              lazy
              showContextHeader
              trackImpression
              trackClick
            />
          )),
        )}
      </InfiniteScrolling>
    </>
  );
}
