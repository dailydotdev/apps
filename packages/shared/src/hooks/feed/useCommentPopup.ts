import { useState } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import {
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
} from '../../graphql/comments';
import { apiUrl } from '../../lib/config';
import { trackEvent } from '../../lib/analytics';

export default function useCommentPopup(): {
  setShowCommentPopupId: (value: string | undefined) => void;
  isSendingComment: boolean;
  comment: (variables: {
    id: string;
    content: string;
  }) => Promise<CommentOnData>;
  showCommentPopupId: string;
} {
  const [showCommentPopupId, setShowCommentPopupId] = useState<string>();

  const { mutateAsync: comment, isLoading: isSendingComment } = useMutation<
    CommentOnData,
    unknown,
    {
      id: string;
      content: string;
    }
  >(
    (requestVariables) =>
      request(`${apiUrl}/graphql`, COMMENT_ON_POST_MUTATION, requestVariables),
    {
      onSuccess: async (data) => {
        trackEvent({
          category: 'Comment Popup',
          action: 'Comment',
        });
        const link = `${data.comment.permalink}?new=true`;
        setShowCommentPopupId(null);
        window.open(link, '_blank');
      },
    },
  );

  return {
    showCommentPopupId,
    setShowCommentPopupId,
    comment,
    isSendingComment,
  };
}
