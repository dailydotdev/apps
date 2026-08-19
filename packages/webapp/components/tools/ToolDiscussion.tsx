import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { initToolDiscussion } from '@dailydotdev/shared/src/graphql/tools';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import {
  COMMENT_ON_COMMENT_MUTATION,
  COMMENT_ON_POST_MUTATION,
  DELETE_COMMENT_MUTATION,
  POST_COMMENTS_QUERY,
} from '@dailydotdev/shared/src/graphql/comments';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { usePrompt } from '@dailydotdev/shared/src/hooks/usePrompt';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { publishTimeRelativeShort } from '@dailydotdev/shared/src/lib/dateFormat';

interface ToolDiscussionProps {
  toolId: string;
  toolTitle: string;
  discussionPostId: string | null;
}

const CommentComposer = ({
  placeholder,
  onSubmit,
  onCancel,
  isPending,
}: {
  placeholder: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isPending: boolean;
}): ReactElement => {
  const [content, setContent] = useState('');

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) {
          return;
        }
        onSubmit(trimmed);
        setContent('');
      }}
    >
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={placeholder}
        maxLength={2000}
        rows={2}
        className="w-full resize-y rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 text-text-primary typo-callout focus:border-border-subtlest-primary focus:outline-none"
      />
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          disabled={isPending || !content.trim()}
        >
          Comment
        </Button>
      </div>
    </form>
  );
};

const CommentRow = ({
  comment,
  isReply,
  canReply,
  onReply,
  onDelete,
  viewerId,
}: {
  comment: Comment;
  isReply?: boolean;
  canReply: boolean;
  onReply?: () => void;
  onDelete: (id: string) => void;
  viewerId?: string;
}): ReactElement => (
  <div className={`flex items-start gap-3 ${isReply ? 'ml-10' : ''}`}>
    {comment.author && (
      <img
        src={comment.author.image}
        alt={`${comment.author.name}'s avatar`}
        className="size-8 flex-none rounded-full object-cover"
      />
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {comment.author?.name ?? 'Deleted user'}{' '}
        <span className="font-normal text-text-quaternary">
          · {publishTimeRelativeShort(comment.createdAt)}
        </span>
      </Typography>
      <div
        className="text-text-secondary typo-callout [&_a]:text-text-link"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />
      <div className="mt-1 flex gap-3">
        {canReply && onReply && (
          <button
            type="button"
            onClick={onReply}
            className="font-bold text-text-quaternary typo-caption1 hover:text-text-primary"
          >
            Reply
          </button>
        )}
        {viewerId && comment.author?.id === viewerId && (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className="font-bold text-text-quaternary typo-caption1 hover:text-status-error"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
);

export const ToolDiscussion = ({
  toolId,
  toolTitle,
  discussionPostId,
}: ToolDiscussionProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  // The SSG prop can lag behind (ISR window); the client vote-state query
  // delivers the fresh id as a prop update, so derive instead of seeding
  // state.
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const postId = createdPostId ?? discussionPostId;

  const queryKey = generateQueryKey(
    RequestKey.PostComments,
    undefined,
    'tool-discussion',
    postId,
  );

  const { data: comments } = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await gqlClient.request<{
        postComments: Connection<Comment>;
      }>(POST_COMMENTS_QUERY, { postId, first: 20 });
      return result.postComments.edges.map(({ node }) => node);
    },
    enabled: !!postId,
    staleTime: StaleTime.Default,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async ({
      content,
      parentCommentId,
    }: {
      content: string;
      parentCommentId?: string;
    }) => {
      // The hidden discussion post is created lazily on first comment.
      const targetPostId = postId ?? (await initToolDiscussion(toolId));
      if (!postId) {
        setCreatedPostId(targetPostId);
      }
      if (parentCommentId) {
        await gqlClient.request(COMMENT_ON_COMMENT_MUTATION, {
          id: parentCommentId,
          content,
        });
      } else {
        await gqlClient.request(COMMENT_ON_POST_MUTATION, {
          id: targetPostId,
          content,
        });
      }
    },
    onSuccess: () => {
      setReplyTo(null);
      invalidate();
    },
    onError: () => displayToast('Failed to post comment'),
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: async (id: string) => {
      await gqlClient.request(DELETE_COMMENT_MUTATION, { id });
    },
    onSuccess: invalidate,
    onError: () => displayToast('Failed to delete comment'),
  });

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await showPrompt({
        title: 'Delete comment?',
        description: 'This cannot be undone.',
        okButton: { title: 'Delete', variant: ButtonVariant.Primary },
      });
      if (confirmed) {
        removeComment(id);
      }
    },
    [removeComment, showPrompt],
  );

  const requireLogin = useCallback((): boolean => {
    if (user) {
      return false;
    }
    showLogin({ trigger: AuthTriggers.Comment });
    return true;
  }, [user, showLogin]);

  return (
    <div className="flex flex-col gap-4">
      {user ? (
        <CommentComposer
          placeholder={`Share your experience with ${toolTitle}…`}
          onSubmit={(content) => submitComment({ content })}
          isPending={isPending}
        />
      ) : (
        <button
          type="button"
          onClick={requireLogin}
          className="rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 text-left text-text-quaternary typo-callout"
        >
          Share your experience with {toolTitle}…
        </button>
      )}

      <div className="flex flex-col gap-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-3">
            <CommentRow
              comment={comment}
              canReply
              onReply={() => {
                if (!requireLogin()) {
                  setReplyTo(replyTo === comment.id ? null : comment.id);
                }
              }}
              onDelete={handleDelete}
              viewerId={user?.id}
            />
            {comment.children?.edges?.map(({ node: reply }) => (
              <CommentRow
                key={reply.id}
                comment={reply}
                isReply
                canReply={false}
                onDelete={handleDelete}
                viewerId={user?.id}
              />
            ))}
            {replyTo === comment.id && (
              <div className="ml-10">
                <CommentComposer
                  placeholder={`Reply to ${comment.author?.name ?? 'comment'}…`}
                  onSubmit={(content) =>
                    submitComment({ content, parentCommentId: comment.id })
                  }
                  onCancel={() => setReplyTo(null)}
                  isPending={isPending}
                />
              </div>
            )}
          </div>
        ))}
        {postId && comments && comments.length === 0 && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Quaternary}
          >
            No comments yet — be the first to share your experience.
          </Typography>
        )}
      </div>
    </div>
  );
};
