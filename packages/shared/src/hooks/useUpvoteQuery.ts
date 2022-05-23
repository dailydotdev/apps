import { useMemo, useState } from 'react';
import { QueryKey } from 'react-query';
import { COMMENT_UPVOTES_BY_ID_QUERY } from '../graphql/comments';
import { POST_UPVOTES_BY_ID_QUERY } from '../graphql/posts';

export interface RequestQueryProps {
  queryKey: QueryKey;
  query: string;
  params: {
    id: string;
    first: number;
  };
}

export type UpvotedPopupInitialStateProps = {
  upvotes: number;
  modal: boolean;
  requestQuery?: RequestQueryProps;
};

interface UseUpvoteQuery {
  requestQuery: UpvotedPopupInitialStateProps;
  onShowUpvotedPost: (postId: string, upvotes: number) => unknown;
  onShowUpvotedComment: (commentId: string, upvotes: number) => unknown;
  resetUpvoteQuery: () => void;
}

export const getUpvotedPopupInitialState =
  (): UpvotedPopupInitialStateProps => ({
    upvotes: 0,
    modal: false,
    requestQuery: null,
  });

const DEFAULT_UPVOTES_PER_PAGE = 50;

export const useUpvoteQuery = (): UseUpvoteQuery => {
  const [upvotedPopup, setUpvotedPopup] = useState(getUpvotedPopupInitialState);
  const onShowUpvotedPost = (postId: string, upvotes: number) => {
    setUpvotedPopup({
      modal: true,
      upvotes,
      requestQuery: {
        queryKey: ['postUpvotes', postId],
        query: POST_UPVOTES_BY_ID_QUERY,
        params: { id: postId, first: DEFAULT_UPVOTES_PER_PAGE },
      },
    });
  };

  const onShowUpvotedComment = (commentId: string, upvotes: number) => {
    setUpvotedPopup({
      modal: true,
      upvotes,
      requestQuery: {
        queryKey: ['commentUpvotes', commentId],
        query: COMMENT_UPVOTES_BY_ID_QUERY,
        params: { id: commentId, first: DEFAULT_UPVOTES_PER_PAGE },
      },
    });
  };

  return useMemo(
    () => ({
      requestQuery: upvotedPopup,
      onShowUpvotedPost,
      onShowUpvotedComment,
      resetUpvoteQuery: () => setUpvotedPopup(getUpvotedPopupInitialState()),
    }),
    [upvotedPopup, onShowUpvotedPost, onShowUpvotedComment],
  );
};
