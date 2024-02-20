import { useCallback, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PromptOptions, usePrompt } from '../usePrompt';
import { ButtonVariant } from '../../components/buttons/common';
import { ButtonColor } from '../../components/buttons/Button';
import { postAnalyticsEvent } from '../../lib/feed';
import { AnalyticsEvent } from '../../lib/analytics';
import { deleteComment } from '../../graphql/comments';
import { removePostComments } from '../usePostById';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { useToastNotification } from '../useToastNotification';
import { useRequestProtocol } from '../useRequestProtocol';
import { Post } from '../../graphql/posts';

type UseDeleteCommentRet = {
  deleteComment: (
    commentId: string,
    parentId: string | null,
    post: Post,
  ) => Promise<void>;
};

const options: PromptOptions = {
  title: 'Delete comment?',
  description:
    'Are you sure you want to delete your comment? This action cannot be undone.',
  okButton: {
    title: 'Delete',
    variant: ButtonVariant.Primary,
    color: ButtonColor.Cabbage,
  },
};

export function useDeleteComment(): UseDeleteCommentRet {
  const client = useQueryClient();
  const { showPrompt } = usePrompt();
  const { trackEvent } = useContext(AnalyticsContext);
  const { displayToast } = useToastNotification();
  const { requestMethod } = useRequestProtocol();

  return {
    deleteComment: useCallback(
      async (commentId, parentId, post) => {
        if (!(await showPrompt(options))) {
          return;
        }

        trackEvent(postAnalyticsEvent(AnalyticsEvent.DeleteComment, post));
        await deleteComment(commentId, requestMethod);
        displayToast('The comment has been deleted');
        removePostComments(client, post, commentId, parentId);
      },
      [client, showPrompt, trackEvent, displayToast, requestMethod],
    ),
  };
}
