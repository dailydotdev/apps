import type { ReactElement } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { RequestQuery } from '../../graphql/common';
import { useRequestProtocol } from '../../hooks/useRequestProtocol';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import InfiniteScrolling, {
  checkFetchMore,
} from '../containers/InfiniteScrolling';
import type { PostItem, PostRepostsData } from '../../graphql/posts';
import PostItemCard from '../post/PostItemCard';
import { getNextPageParam } from '../../lib/query';
import { FlexCentered } from '../utilities';

export interface RepostsModalProps extends ModalProps {
  requestQuery: RequestQuery<PostRepostsData>;
}

export function RepostsModal({
  requestQuery: { queryKey, query, params, options = {} },
  ...props
}: RepostsModalProps): ReactElement {
  const { requestMethod } = useRequestProtocol();
  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      requestMethod(
        query,
        { ...params, after: pageParam },
        { requestKey: JSON.stringify(queryKey) },
      ),
    initialPageParam: '',
    ...options,
    getNextPageParam: ({ postReposts }) =>
      getNextPageParam(postReposts?.pageInfo),
  });

  const reposts: PostItem[] =
    queryResult.data?.pages.flatMap((page) =>
      page.postReposts.edges.map(({ node }) => ({
        post: node,
        timestamp: node.createdAt ? new Date(node.createdAt) : undefined,
      })),
    ) ?? [];

  return (
    <Modal {...props} kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Medium}>
      <Modal.Header title="Reposts" />
      <Modal.Body className="!p-0">
        <InfiniteScrolling
          canFetchMore={checkFetchMore(queryResult)}
          isFetchingNextPage={queryResult.isFetchingNextPage}
          fetchNextPage={queryResult.fetchNextPage}
        >
          {reposts.map((postItem) => (
            <PostItemCard
              key={`${postItem.post.id}-${postItem.timestamp?.toISOString()}`}
              postItem={postItem}
              showButtons={false}
            />
          ))}
        </InfiniteScrolling>
        {!queryResult.isPending && reposts.length === 0 && (
          <FlexCentered className="p-10 text-text-tertiary typo-callout">
            No reposts found
          </FlexCentered>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default RepostsModal;
