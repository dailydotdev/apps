import { useMutation } from 'react-query';
import { useCallback } from 'react';
import { PromptOptions, usePrompt } from './usePrompt';
import {
  deletePost,
  Post,
  updatePinnedPost,
  UserPostVote,
} from '../graphql/posts';
import { SourcePermissions, SourceType } from '../graphql/sources';
import { Roles } from '../lib/user';
import { useAuthContext } from '../contexts/AuthContext';
import { useVotePost } from './vote/useVotePost';
import { Origin } from '../lib/analytics';
import { useBlockPostPanel } from './post/useBlockPostPanel';

interface UsePostMenuActions {
  onConfirmDeletePost: () => Promise<void>;
  onPinPost: () => Promise<void>;
  onToggleDownvotePost: () => void;
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
  origin: Origin;
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
  origin,
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
    post?.source.type === SourceType.Squad && post?.author?.id === user?.id;
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

  const { onClose, onShowPanel } = useBlockPostPanel(post);
  const { toggleDownvote } = useVotePost();

  return {
    onConfirmDeletePost: canDelete ? deletePostPrompt : null,
    onPinPost: canPin ? onPinPost : null,
    onToggleDownvotePost: () => {
      if (post.userState?.vote !== UserPostVote.Down) {
        onShowPanel();
      } else {
        onClose(true);
      }

      toggleDownvote({ post, origin });
    },
  };
};
