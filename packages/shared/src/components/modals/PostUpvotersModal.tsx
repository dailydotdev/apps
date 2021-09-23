import request from 'graphql-request';
import React, { ReactElement } from 'react';
import { useInfiniteQuery } from 'react-query';
import { PostUpvotesData, POST_UPVOTES_BY_ID_QUERY } from '../../graphql/posts';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { apiUrl } from '../../lib/config';
import { ModalProps } from './StyledModal';
import { UpvotedPopupModal } from './UpvotedPopupModal';

interface PostUpvotersModalProps extends ModalProps {
  postId: string;
}

export function PostUpvotersModal({
  postId,
  ...modalProps
}: PostUpvotersModalProps): ReactElement {
  const postUpvotesQueryKey = ['postUpvotes', postId];
  const query = useInfiniteQuery<PostUpvotesData>(
    postUpvotesQueryKey,
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, POST_UPVOTES_BY_ID_QUERY, {
        id: postId,
        first: 10,
        after: pageParam,
      }),
    {
      enabled: !!postId,
      getNextPageParam: (lastPage) =>
        lastPage.postUpvotes.pageInfo.hasNextPage &&
        lastPage.postUpvotes.pageInfo.endCursor,
    },
  );

  const upvotes = React.useMemo(
    () =>
      query?.data?.pages?.reduce((list, page) => {
        page.postUpvotes.edges.forEach((edge) => list.push(edge.node));

        return list;
      }, []) || [],
    [query],
  );

  const canFetchMore =
    !query.isLoading &&
    !query.isFetchingNextPage &&
    query.hasNextPage &&
    upvotes.length > 0;

  const infiniteScrollRef = useFeedInfiniteScroll(
    query?.fetchNextPage,
    canFetchMore,
  );

  return (
    <UpvotedPopupModal {...modalProps} listProps={{ upvotes }}>
      <div
        className="absolute bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </UpvotedPopupModal>
  );
}

export default PostUpvotersModal;
