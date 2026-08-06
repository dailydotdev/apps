import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ToolComment } from '@dailydotdev/shared/src/graphql/tools';
import {
  commentOnTool,
  deleteToolComment,
  getToolComments,
} from '@dailydotdev/shared/src/graphql/tools';
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
  comment: ToolComment;
  isReply?: boolean;
  canReply: boolean;
  onReply?: () => void;
  onDelete: (id: string) => void;
  viewerId?: string;
}): ReactElement => (
  <div className={`flex items-start gap-3 ${isReply ? 'ml-10' : ''}`}>
    {comment.user && (
      <img
        src={comment.user.image}
        alt={`${comment.user.name}'s avatar`}
        className="size-8 flex-none rounded-full object-cover"
      />
    )}
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Footnote} bold>
        {comment.user?.name ?? 'Deleted user'}{' '}
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
        {viewerId && comment.user?.id === viewerId && (
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
}: ToolDiscussionProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { showPrompt } = usePrompt();
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const queryKey = generateQueryKey(
    RequestKey.UserTools,
    undefined,
    'tool-comments',
    toolId,
  );

  const { data: comments } = useQuery({
    queryKey,
    queryFn: () => getToolComments(toolId),
    staleTime: StaleTime.Default,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: commentOnTool,
    onSuccess: () => {
      setReplyTo(null);
      invalidate();
    },
    onError: () => displayToast('Failed to post comment'),
  });

  const { mutate: removeComment } = useMutation({
    mutationFn: deleteToolComment,
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
          onSubmit={(content) => submitComment({ id: toolId, content })}
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
            {comment.replies?.map((reply) => (
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
                  placeholder={`Reply to ${comment.user?.name ?? 'comment'}…`}
                  onSubmit={(content) =>
                    submitComment({
                      id: toolId,
                      content,
                      parentId: comment.id,
                    })
                  }
                  onCancel={() => setReplyTo(null)}
                  isPending={isPending}
                />
              </div>
            )}
          </div>
        ))}
        {comments && comments.length === 0 && (
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
