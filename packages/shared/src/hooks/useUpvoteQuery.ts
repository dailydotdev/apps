import { useMemo } from 'react';
import { QueryKey } from 'react-query';
import { LazyModal } from '../components/modals/common/types';
import { COMMENT_UPVOTES_BY_ID_QUERY } from '../graphql/comments';
import { POST_UPVOTES_BY_ID_QUERY } from '../graphql/posts';
import { useLazyModal } from './useLazyModal';

export interface RequestQueryProps {
  queryKey: QueryKey;
  query: string;
  params: {
    id: string;
    first: number;
  };
}

type UpvoteType = 'post' | 'comment';

interface UseUpvoteQuery {
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
  const { openModal } = useLazyModal();
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

  return useMemo(() => ({ onShowUpvoted }), []);
};
