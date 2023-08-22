import { useMutation } from 'react-query';
import { useCallback, useContext } from 'react';
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
import { mutationHandlers, useVotePost } from './useVotePost';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '../lib/analytics';
import useUpdatePost from './useUpdatePost';
import { useBlockPostPanel } from './post/useBlockPostPanel';
import { AuthTriggers } from '../lib/auth';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, showLogin } = useAuthContext();
  const { showPrompt } = usePrompt();
  const { updatePost } = useUpdatePost();
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

  const onDownvoteMutate =
    post &&
    updatePost({
      id: post.id,
      update: mutationHandlers.downvote(post),
    });
  const onCancelDownvoteMutate =
    post &&
    updatePost({
      id: post.id,
      update: mutationHandlers.cancelDownvote(post),
    });
  const { downvotePost, cancelPostDownvote } = useVotePost({
    onDownvotePostMutate: (params) => {
      onShowPanel();
      return onDownvoteMutate(params);
    },
    onCancelPostDownvoteMutate: (params) => {
      onClose(true);
      return onCancelDownvoteMutate(params);
    },
  });

  return {
    onConfirmDeletePost: canDelete ? deletePostPrompt : null,
    onPinPost: canPin ? onPinPost : null,
    onToggleDownvotePost: () => {
      if (!user) {
        showLogin(AuthTriggers.Downvote);
        return;
      }

      if (post?.userState?.vote === UserPostVote.Down) {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.RemovePostDownvote, post, {
            extra: { origin },
          }),
        );

        cancelPostDownvote({ id: post.id });
      } else {
        trackEvent(
          postAnalyticsEvent(AnalyticsEvent.DownvotePost, post, {
            extra: { origin },
          }),
        );

        downvotePost({ id: post.id });
      }
    },
  };
};
