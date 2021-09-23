import request from 'graphql-request';
import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import {
  CommentUpvotesData,
  COMMENT_UPVOTES_BY_ID_QUERY,
} from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { ModalProps } from './StyledModal';
import { UpvotedPopupModal } from './UpvotedPopupModal';

interface CommentUpvotersModalProps extends ModalProps {
  commentId: string;
}

export function CommentUpvotersModal({
  commentId,
  ...modalProps
}: CommentUpvotersModalProps): ReactElement {
  const commentUpvotesQueryKey = ['commentUpvotes', commentId];
  const { data } = useQuery<CommentUpvotesData>(commentUpvotesQueryKey, () =>
    request(`${apiUrl}/graphql`, COMMENT_UPVOTES_BY_ID_QUERY, {
      id: commentId,
    }),
  );

  const upvotes = React.useMemo(
    () => data?.commentUpvotes?.edges?.map((edge) => edge.node) || [],
    [data],
  );

  return <UpvotedPopupModal {...modalProps} listProps={{ upvotes }} />;
}

export default CommentUpvotersModal;
