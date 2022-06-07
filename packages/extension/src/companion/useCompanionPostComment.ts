import { useState, useMemo } from 'react';
import { Post } from '@dailydotdev/shared/src/graphql/posts';
import {
  usePostComment,
  UsePostCommentOptionalProps,
} from '@dailydotdev/shared/src/hooks/usePostComment';
import { useBackgroundRequest } from './useBackgroundRequest';

interface UseCompanionPostCommentOptionalProps
  extends UsePostCommentOptionalProps {
  onCommentSuccess?: () => void;
}

interface UseCompanionPostComment extends ReturnType<typeof usePostComment> {
  onInput: (value: string) => void;
}

export const useCompanionPostComment = (
  post: Post,
  params: UseCompanionPostCommentOptionalProps = {},
): UseCompanionPostComment => {
  const postComment = usePostComment(post, params);
  const { closeNewComment, updatePostComments, parentComment } = postComment;
  const [input, setInput] = useState<string>('');
  const previewQueryKey = ['comment_preview', input];
  const mentionQueryKey = ['user-mention', post?.id];
  const mutationKey = ['post_comments_mutations', post?.id];
  useBackgroundRequest(mentionQueryKey, { enabled: !!parentComment });
  useBackgroundRequest(previewQueryKey, { enabled: !!parentComment });
  useBackgroundRequest(mutationKey, {
    enabled: !!parentComment,
    callback: ({ req, res }) => {
      const isNew = req.variables.id !== res.comment.id;
      updatePostComments(res.comment, isNew);
      closeNewComment();
      params?.onCommentSuccess?.();
    },
  });

  return useMemo(() => ({ ...postComment, onInput: setInput }), [postComment]);
};
