import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CommentOnData } from '../../graphql/comments';
import { COMMENT_ON_POST_MUTATION } from '../../graphql/comments';
import LogContext from '../../contexts/LogContext';
import { feedLogExtra, usePostLogEvent } from '../../lib/feed';
import type { Post } from '../../graphql/posts';
import { gqlClient } from '../../graphql/common';
import { LogEvent } from '../../lib/log';

export default function useCommentPopup(
  feedName: string,
  ranking?: string,
): {
  setShowCommentPopupId: (value: string | undefined) => void;
  isSendingComment: boolean;
  comment: (variables: {
    post: Post;
    content: string;
    row: number;
    column: number;
    columns: number;
  }) => Promise<CommentOnData>;
  showCommentPopupId: string;
} {
  const postLogEvent = usePostLogEvent();
  const [showCommentPopupId, setShowCommentPopupId] = useState<string>();
  const { logEvent } = useContext(LogContext);

  const { mutateAsync: comment, isPending: isSendingComment } = useMutation<
    CommentOnData,
    unknown,
    {
      post: Post;
      content: string;
      row: number;
      column: number;
      columns: number;
    }
  >({
    mutationFn: ({ post, content }) =>
      gqlClient.request(COMMENT_ON_POST_MUTATION, {
        id: post.id,
        content,
      }),

    onSuccess: async (data, { post, row, column, columns }) => {
      logEvent(
        postLogEvent(LogEvent.CommentPost, post, {
          columns,
          column,
          row,
          ...feedLogExtra(feedName, ranking),
        }),
      );
      const link = `${data.comment.permalink}?new=true`;
      setShowCommentPopupId(null);
      window.open(link, '_blank');
    },
  });

  return {
    showCommentPopupId,
    setShowCommentPopupId,
    comment,
    isSendingComment,
  };
}
