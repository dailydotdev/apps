import { useMutation } from 'react-query';
import { useMemo } from 'react';
import { PromptOptions, usePrompt } from './usePrompt';
import { deletePost, Post } from '../graphql/posts';

interface UsePostMenuActions {
  onConfirmDeletePost: () => Promise<void>;
}

interface UsePostMenuActionsProps {
  post: Post;
  onPostDeleted?: () => void;
}

const deletePromptOptions: PromptOptions = {
  title: 'Delete post 🚫',
  description:
    'Are you sure you want to delete this post? This action cannot be undone.',
  okButton: {
    title: 'Delete',
    className: 'btn-primary-ketchup',
  },
};

export const usePostMenuActions = ({
  post,
  onPostDeleted,
}: UsePostMenuActionsProps): UsePostMenuActions => {
  const { showPrompt } = usePrompt();
  const { mutateAsync: onDeletePost } = useMutation(() => deletePost(post.id), {
    onSuccess: onPostDeleted,
  });
  const deletePostPrompt = async () => {
    if (await showPrompt(deletePromptOptions)) {
      await onDeletePost();
    }
  };

  return useMemo(() => ({ onConfirmDeletePost: deletePostPrompt }), [post]);
};
