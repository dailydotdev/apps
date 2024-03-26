import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FormWrapper } from '../fields/form';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { useMutateComment } from '../../hooks/post/useMutateComment';
import { useVisualViewport } from '../../hooks/utils/useVisualViewport';
import { COMMENT_BY_ID_WITH_POST_QUERY } from '../../graphql/comments';
import useCommentById from '../../hooks/comments/useCommentById';
import { useAuthContext } from '../../contexts/AuthContext';
import { Switch } from '../fields/Switch';
import { useNotificationToggle } from '../../hooks/notifications';
import { NotificationPromptSource } from '../../lib/analytics';
import { Post } from '../../graphql/posts';

// statically defined heights of various containers that
// affect final height of the input container
// when styles change, these should be updated accordingly
const headerSize = 57;
const replySize = 40;
const footerSize = 48;
export interface Props {
  postId: string;
  editCommentId?: string;
  replyCommentId?: string;
}

const CommentInputPage = ({
  postId,
  editCommentId,
  replyCommentId,
}: Props): ReactElement => {
  const [value, setValue] = useState('');
  const [styleHeight, setStyleHeight] = useState<number | 'auto'>('auto');
  const { user } = useAuthContext();
  const router = useRouter();

  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle({
      source: NotificationPromptSource.NewComment,
    });

  const isEdit = !!editCommentId;
  const isReply = !!replyCommentId;

  const { comment } = useCommentById({
    id: isEdit ? editCommentId : replyCommentId,
    query: COMMENT_BY_ID_WITH_POST_QUERY,
    options: {
      retry: false,
      enabled: !!editCommentId || !!replyCommentId,
    },
  });
  const post = useMemo(
    () => comment?.post ?? ({ id: postId } as Post),
    [comment, postId],
  );
  const parentCommentId = useMemo(
    () => comment?.parent?.id ?? replyCommentId,
    [comment, replyCommentId],
  );

  const { mutateComment, isLoading } = useMutateComment({
    post,
    editCommentId: isEdit && editCommentId,
    parentCommentId,
    onCommented: router.back,
  });

  const { height } = useVisualViewport();
  const replyHeight = height > 0 ? replySize : 0;
  const footerHeight = shouldShowCta ? footerSize : 0;
  const totalHeight = height - headerSize - replyHeight - footerHeight;
  const inputHeight = totalHeight > 0 ? totalHeight : 'auto';

  useEffect(() => {
    setStyleHeight(inputHeight);
  }, [inputHeight, setStyleHeight]);

  const { submitCopy, initialContent } = useMemo(() => {
    if (isEdit) {
      return {
        submitCopy: 'Save',
        initialContent: comment?.content,
      };
    }
    if (isReply) {
      return {
        submitCopy: 'Reply',
        initialContent:
          comment?.author?.id && comment.author.id !== user?.id
            ? `@${comment?.author?.username} `
            : undefined,
      };
    }
    return { submitCopy: 'Comment' };
  }, [isEdit, isReply, comment, user?.id]);

  return (
    <div>
      <FormWrapper
        form="new comment"
        copy={{ right: submitCopy }}
        leftButtonProps={{
          onClick: router.back,
        }}
        rightButtonProps={{
          onClick: async () => {
            await onSubmitted();
            mutateComment(value);
          },
          loading: isLoading,
        }}
        className={{
          container: 'flex-1 first:!border-none',
          header: 'sticky top-0 z-2 w-full bg-background-default',
        }}
      >
        {isReply && comment && (
          <div className="ml-12 flex gap-2 border-l border-theme-divider-tertiary py-3 pl-5 text-theme-label-tertiary typo-caption1">
            Reply to
            <span className="font-bold text-theme-label-primary">
              {comment.author?.username}
            </span>
          </div>
        )}
        <CommentMarkdownInput
          replyTo={null}
          post={post}
          parentCommentId={parentCommentId}
          editCommentId={isEdit && editCommentId}
          initialContent={initialContent}
          className={{
            markdownContainer: 'flex-1',
            container: classNames(
              'flex flex-col',
              isReply ? 'h-[calc(100%-2.5rem)]' : 'h-full',
            ),
            tab: 'flex-1',
            input: '!max-h-none flex-1',
          }}
          showSubmit={false}
          showUserAvatar={false}
          onChange={setValue}
          style={{
            height: `${styleHeight}px`,
          }}
        />
        {shouldShowCta && (
          <Switch
            inputId="push_notification-switch"
            name="push_notification"
            labelClassName="flex-1 font-normal"
            className="mx-3 my-3.5"
            compact={false}
            checked={isEnabled}
            onToggle={onToggle}
          >
            Receive updates when other members engage
          </Switch>
        )}
      </FormWrapper>
    </div>
  );
};

export default CommentInputPage;
