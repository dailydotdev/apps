import { useMemo } from 'react';
import { QueryKey } from '@tanstack/react-query';
import { LazyModal } from '../components/modals/common/types';
import { COMMENT_UPVOTES_BY_ID_QUERY } from '../graphql/comments';
import { POST_UPVOTES_BY_ID_QUERY } from '../graphql/posts';
import { useLazyModal } from './useLazyModal';

type UpvoteType = 'post' | 'comment';

interface UseUpvoteQuery {
  queryKey: QueryKey;
  onShowUpvoted: (id: string, upvotes: number, type?: UpvoteType) => unknown;
}

const DEFAULT_UPVOTES_PER_PAGE = 50;

const KEY_MAP = {
  post: 'postUpvotes',
  comment: 'commentUpvotes',
};

const QUERY_MAP = {
  post: POST_UPVOTES_BY_ID_QUERY,
  comment: COMMENT_UPVOTES_BY_ID_QUERY,
};

export const useUpvoteQuery = (): UseUpvoteQuery => {
  const { modal, openModal } = useLazyModal<LazyModal.UpvotedPopup>();
  const onShowUpvoted = (
    id: string,
    upvotes: number,
    type: UpvoteType = 'post',
  ) => {
    openModal({
      type: LazyModal.UpvotedPopup,
      props: {
        placeholderAmount: upvotes,
        requestQuery: {
          queryKey: [KEY_MAP[type], id],
          query: QUERY_MAP[type],
          params: { id, first: DEFAULT_UPVOTES_PER_PAGE },
        },
      },
    });
  };

  return useMemo(
    () => ({ onShowUpvoted, queryKey: modal?.props?.requestQuery?.queryKey }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modal],
  );
};
