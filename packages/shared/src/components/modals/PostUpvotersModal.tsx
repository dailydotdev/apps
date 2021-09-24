import request from 'graphql-request';
import React, { ReactElement } from 'react';
import { useInfiniteQuery } from 'react-query';
import { DEFAULT_UPVOTES_PER_PAGE } from '../../graphql/common';
import { PostUpvotesData, POST_UPVOTES_BY_ID_QUERY } from '../../graphql/posts';
import useFeedInfiniteScroll from '../../hooks/feed/useFeedInfiniteScroll';
import { apiUrl } from '../../lib/config';
import { UpvoterListPlaceholderProps } from '../profile/UpvoterListPlaceholder';
import { ModalProps } from './StyledModal';
import { UpvotedPopupModal } from './UpvotedPopupModal';

interface PostUpvotersModalProps extends ModalProps {
  postId: string;
  listPlaceholderProps: UpvoterListPlaceholderProps;
}

export function PostUpvotersModal({
  postId,
  listPlaceholderProps,
  ...modalProps
}: PostUpvotersModalProps): ReactElement {
  const postUpvotesQueryKey = ['postUpvotes', postId];
  const query = useInfiniteQuery<PostUpvotesData>(
    postUpvotesQueryKey,
    ({ pageParam }) =>
      request(`${apiUrl}/graphql`, POST_UPVOTES_BY_ID_QUERY, {
        id: postId,
        first: DEFAULT_UPVOTES_PER_PAGE,
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
    false,
  );

  return (
    <UpvotedPopupModal
      {...modalProps}
      listProps={{ upvotes }}
      listPlaceholderProps={listPlaceholderProps}
    >
      <div
        className="absolute bottom-0 left-0 h-px w-px opacity-0 pointer-events-none"
        ref={infiniteScrollRef}
      />
    </UpvotedPopupModal>
  );
}

export default PostUpvotersModal;
