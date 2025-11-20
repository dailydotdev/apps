import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import InfiniteScrolling, {
  checkFetchMore,
} from './containers/InfiniteScrolling';
import MainComment from './comments/MainComment';
import type { Origin } from '../lib/log';
import { useShareComment } from '../hooks/useShareComment';
import { useUpvoteQuery } from '../hooks/useUpvoteQuery';
import { useDeleteComment } from '../hooks/comments/useDeleteComment';
import PlaceholderCommentList from './comments/PlaceholderCommentList';
import type { CommentClassName } from './comments/common';
import type { CommentFeedData } from '../graphql/comments';
import { useViewSize, ViewSize } from '../hooks';
import { gqlClient } from '../graphql/common';
import { getNextPageParam } from '../lib/query';

interface CommentFeedProps<T> {
  feedQueryKey: unknown[];
  query: string;
  logOrigin: Origin;
  variables?: T;
  emptyScreen?: ReactNode;
  commentClassName?: CommentClassName;
  isMainFeed?: boolean;
}

export default function CommentFeed<T>({
  feedQueryKey,
  query,
  logOrigin,
  variables,
  emptyScreen,
  commentClassName,
  isMainFeed,
}: CommentFeedProps<T>): ReactElement {
  const { openShareComment } = useShareComment(logOrigin);
  const { onShowUpvoted } = useUpvoteQuery();
  const { deleteComment } = useDeleteComment();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const queryResult = useInfiniteQuery<CommentFeedData>({
    queryKey: feedQueryKey,
    queryFn: ({ pageParam }) =>
      gqlClient.request(query, {
        ...variables,
        first: 20,
        after: pageParam,
      }),
    initialPageParam: '',
    getNextPageParam: ({ page }) => getNextPageParam(page?.pageInfo),
  });
  const length = queryResult?.data?.pages?.length;
  const showEmptyScreen =
    length > 0 && queryResult.data.pages[0].page.edges.length === 0;

  if (queryResult.isPending) {
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
                    !isLaptop &&
                    isMainFeed &&
                    'rounded-t-24 border-t',
                ),
              }}
              post={node.post}
              comment={node}
              origin={logOrigin}
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
          )),
        )}
      </InfiniteScrolling>
    </>
  );
}
