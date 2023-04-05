import { useMutation } from 'react-query';
import { useMemo } from 'react';
import { PromptOptions, usePrompt } from './usePrompt';
import { deletePost, Post } from '../graphql/posts';
import { SourcePermissions, SourceType } from '../graphql/sources';
import { Roles } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';

interface UsePostMenuActions {
  onConfirmDeletePost: () => Promise<void>;
}

interface DeletePostProps {
  id: string;
  index?: number;
}

interface UsePostMenuActionsProps {
  post: Post;
  postIndex?: number;
  onPostDeleted?: (args: DeletePostProps) => void;
}

const deletePromptOptions: PromptOptions = {
  title: 'Delete post?',
  description: 'Are you sure you want to delete this post?',
  okButton: {
    title: 'Delete',
    className: 'btn-primary-cabbage',
  },
};

export const usePostMenuActions = ({
  post,
  postIndex,
  onPostDeleted,
}: UsePostMenuActionsProps): UsePostMenuActions => {
  const { user } = useAuthContext();
  const { showPrompt } = usePrompt();
  const { mutateAsync: onDeletePost } = useMutation(
    ({ id }: DeletePostProps) => deletePost(id),
    { onSuccess: (_, vars) => onPostDeleted(vars) },
  );
  const deletePostPrompt = async () => {
    const param = { id: post.id, index: postIndex };

    if (await showPrompt(deletePromptOptions)) {
      await onDeletePost(param);
    }
  };

  const isSharedPostAuthor =
    post?.source.type === SourceType.Squad && post?.author?.id === user.id;
  const isModerator = user?.roles?.includes(Roles.Moderator);
  const canDelete =
    isModerator ||
    isSharedPostAuthor ||
    post?.source.currentMember?.permissions?.includes(
      SourcePermissions.PostDelete,
    );

  return useMemo(
    () => ({ onConfirmDeletePost: canDelete ? deletePostPrompt : null }),
    [onDeletePost, canDelete],
  );
};
