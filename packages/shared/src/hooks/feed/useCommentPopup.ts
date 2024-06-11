import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import request from 'graphql-request';
import {
  COMMENT_ON_POST_MUTATION,
  CommentOnData,
} from '../../graphql/comments';
import { graphqlUrl } from '../../lib/config';
import LogContext from '../../contexts/LogContext';
import { feedLogsExtra, postLogsEvent } from '../../lib/feed';
import { Post } from '../../graphql/posts';

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
  const [showCommentPopupId, setShowCommentPopupId] = useState<string>();
  const { trackEvent } = useContext(LogContext);

  const { mutateAsync: comment, isLoading: isSendingComment } = useMutation<
    CommentOnData,
    unknown,
    {
      post: Post;
      content: string;
      row: number;
      column: number;
      columns: number;
    }
  >(
    ({ post, content }) =>
      request(graphqlUrl, COMMENT_ON_POST_MUTATION, {
        id: post.id,
        content,
      }),
    {
      onSuccess: async (data, { post, row, column, columns }) => {
        trackEvent(
          postLogsEvent('comment post', post, {
            columns,
            column,
            row,
            ...feedLogsExtra(feedName, ranking),
          }),
        );
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
