import { useMutation } from 'react-query';
import { useCallback, useMemo } from 'react';
import { PromptOptions, usePrompt } from './usePrompt';
import { deletePost, Post, updatePinnedPost } from '../graphql/posts';
import { SourcePermissions, SourceType } from '../graphql/sources';
import { Roles } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';

interface UsePostMenuActions {
  onConfirmDeletePost: () => Promise<void>;
  onPinPost: () => Promise<void>;
}

interface DeletePostProps {
  post: Post;
  id: string;
  index?: number;
}

interface UsePostMenuActionsProps {
  post: Post;
  postIndex?: number;
  onPinSuccessful?: () => Promise<unknown>;
  onPostDeleted?: (args: DeletePostProps) => void;
}

const deletePromptOptions: PromptOptions = {
  title: 'Delete post?',
  description:
    'Are you sure you want to delete this post? This action cannot be undone.',
  okButton: {
    title: 'Delete',
    className: 'btn-primary-cabbage',
  },
};

export const usePostMenuActions = ({
  post,
  postIndex,
  onPostDeleted,
  onPinSuccessful,
}: UsePostMenuActionsProps): UsePostMenuActions => {
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const { mutateAsync: onDeletePost } = useMutation(
    ({ id }: DeletePostProps) => deletePost(id),
    { onSuccess: (_, vars) => onPostDeleted(vars) },
  );
  const deletePostPrompt = useCallback(async () => {
    const param = { id: post.id, index: postIndex, post };

    if (await showPrompt(deletePromptOptions)) {
      await onDeletePost(param);
    }
  }, [post, postIndex, onDeletePost, showPrompt]);

  const isSharedPostAuthor =
    post?.source.type === SourceType.Squad && post?.author?.id === user.id;
  const isModerator = user?.roles?.includes(Roles.Moderator);
  const canDelete =
    isModerator ||
    isSharedPostAuthor ||
    post?.source.currentMember?.permissions?.includes(
      SourcePermissions.PostDelete,
    );

  const canPin = post?.source.currentMember?.permissions?.includes(
    SourcePermissions.PostPin,
  );

  const { mutateAsync: onPinPost } = useMutation(
    () => updatePinnedPost({ id: post.id, pinned: !post.pinnedAt }),
    { onSuccess: onPinSuccessful },
  );

  return useMemo(
    () => ({
      onConfirmDeletePost: canDelete ? deletePostPrompt : null,
      onPinPost: canPin ? onPinPost : null,
    }),
    [deletePostPrompt, canDelete, onPinPost, canPin],
  );
};
