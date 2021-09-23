import request from 'graphql-request';
import React, { ReactElement } from 'react';
import { useQuery } from 'react-query';
import { PostUpvotesData, POST_UPVOTES_BY_ID_QUERY } from '../../graphql/posts';
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
  const { data } = useQuery<PostUpvotesData>(postUpvotesQueryKey, () =>
    request(`${apiUrl}/graphql`, POST_UPVOTES_BY_ID_QUERY, {
      id: postId,
    }),
  );

  const upvotes = React.useMemo(
    () => data?.postUpvotes?.edges?.map((edge) => edge.node) || [],
    [data],
  );

  return <UpvotedPopupModal {...modalProps} listProps={{ upvotes }} />;
}

export default PostUpvotersModal;
