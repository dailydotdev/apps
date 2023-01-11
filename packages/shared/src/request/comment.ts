import { useMutation } from 'react-query';
import { DELETE_COMMENT_MUTATION } from '../graphql/comments';
import { EmptyResponse } from '../graphql/emptyResponse';
import { Post } from '../graphql/posts';
import { usePostComment } from '../hooks/usePostComment';
import { useRequestProtocol } from '../hooks/useRequestProtocol';
import { apiUrl } from '../lib/config';

export const deleteComment = ({
  commentId,
  parentId,
  post,
}: {
  commentId: string;
  parentId: string | null;
  post: Post;
}): Promise<EmptyResponse> => {
  const { deleteCommentCache } = usePostComment(post);
  const { requestMethod } = useRequestProtocol();
  const { mutateAsync: deleteCommentRequest } = useMutation<EmptyResponse>(
    () =>
      requestMethod(`${apiUrl}/graphql`, DELETE_COMMENT_MUTATION, {
        id: commentId,
      }),
    { onSuccess: () => deleteCommentCache(commentId, parentId) },
  );
  return deleteCommentRequest();
};
