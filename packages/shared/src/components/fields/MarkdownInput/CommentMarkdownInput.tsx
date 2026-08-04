import type {
  ForwardedRef,
  FormEventHandler,
  FormHTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';
import React, { forwardRef, useRef, useState } from 'react';
import classNames from 'classnames';
import { defaultMarkdownCommands } from '../../../hooks/input';
import type { RichTextInputRef } from '../RichTextInput';
import RichTextInput from '../RichTextInput';
import type { Comment } from '../../../graphql/comments';
import { formToJson } from '../../../lib/form';
import type { Post } from '../../../graphql/posts';
import { useWriteCommentContext } from '../../../contexts/WriteCommentContext';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import CloseButton from '../../CloseButton';
import { MarkdownIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { useVisualViewport } from '../../../hooks/utils/useVisualViewport';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

export interface CommentClassName {
  container?: string;
}

export interface CommentMarkdownInputProps {
  post: Post;
  inputId?: string;
  editCommentId?: string;
  parentCommentId?: string;
  initialContent?: string;
  replyTo?: string;
  className?: CommentClassName;
  onCommented?: (
    comment: Comment,
    isNew: boolean,
    parentCommentId?: string,
  ) => void;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  onClose?: () => void;
  /** Fills its container instead of capping against the viewport. */
  fills?: boolean;
}

const MIN_COMPOSER_HEIGHT = 224;
const MAX_COMPOSER_HEIGHT = 512;
const VIEWPORT_HEIGHT_RATIO = 0.8;

export function CommentMarkdownInputComponent(
  {
    post,
    inputId,
    initialContent,
    replyTo,
    editCommentId,
    parentCommentId,
    className = {},
    onChange,
    autoFocus = true,
    formProps = {},
    onClose,
    fills = false,
  }: CommentMarkdownInputProps,
  ref: ForwardedRef<HTMLFormElement>,
): ReactElement {
  const shouldFocus = useRef(autoFocus);
  const postId = post?.id;
  const sourceId = post?.source?.id;
  const {
    mutateComment: { mutateComment, isLoading, isSuccess },
  } = useWriteCommentContext();
  const richTextRef = useRef<RichTextInputRef | null>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);

  const { height: viewportHeight } = useVisualViewport();
  const maxHeight =
    viewportHeight && !fills
      ? Math.min(
          MAX_COMPOSER_HEIGHT,
          Math.max(
            MIN_COMPOSER_HEIGHT,
            Math.round(viewportHeight * VIEWPORT_HEIGHT_RATIO),
          ),
        )
      : undefined;

  let submitCopy = 'Comment';
  if (editCommentId) {
    submitCopy = 'Update';
  } else if (parentCommentId) {
    submitCopy = 'Reply';
  }

  const replyingTo = replyTo ?? post?.author?.username ?? post?.source?.handle;
  let headerLabel: ReactNode = null;
  if (editCommentId) {
    headerLabel = 'Editing your comment';
  } else if (replyingTo) {
    headerLabel = (
      <>
        Replying to <span className="text-text-link">@{replyingTo}</span>
      </>
    );
  }

  const markdownToggleLabel = isMarkdownMode
    ? 'Switch to rich text'
    : 'Switch to Markdown';

  const onSubmitForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (isLoading || isSuccess) {
      return null;
    }

    const { content } = formToJson<{ content: string }>(e.currentTarget);

    const result = await mutateComment(content);

    // Clear draft after successful submission
    if (result && richTextRef.current) {
      richTextRef.current.clearDraft();
    }

    return result;
  };

  const onKeyboardSubmit: FormEventHandler<HTMLTextAreaElement> = async (e) => {
    if (isLoading || isSuccess) {
      return null;
    }

    const content = e.currentTarget.value;

    const result = await mutateComment(content);

    // Clear draft after successful submission
    if (result && richTextRef.current) {
      richTextRef.current.clearDraft();
    }

    return result;
  };

  return (
    <form
      {...formProps}
      action="#"
      onSubmit={onSubmitForm}
      aria-label={submitCopy}
      className={classNames(
        'flex min-h-0 flex-col',
        fills && 'flex-1',
        className?.container,
      )}
      style={{ maxHeight }}
      ref={ref}
    >
      <RichTextInput
        inputId={inputId}
        ref={(richTextRefInstance) => {
          if (richTextRefInstance) {
            richTextRef.current = richTextRefInstance;
            if (shouldFocus.current) {
              richTextRefInstance.focus();
              shouldFocus.current = false;
            }
          }
        }}
        className={{
          container: classNames(
            '!min-h-0 flex-1 overflow-hidden',
            fills
              ? '!rounded-none !bg-transparent'
              : 'border border-border-subtlest-tertiary',
          ),
          profile: fills ? '!ml-5' : undefined,
        }}
        postId={postId}
        sourceId={sourceId}
        showUserAvatar
        isLoading={isLoading}
        disabledSubmit={isSuccess}
        submitButtonVariant={ButtonVariant.Primary}
        initialContent={initialContent}
        editCommentId={editCommentId}
        parentCommentId={parentCommentId}
        minHeightClassName="min-h-[6rem]"
        // No `rows`: the textarea auto-grows from a measured 0px, so it would
        // never act as a floor. `minHeightClassName` sets the empty height.
        textareaProps={{
          name: 'content',
          placeholder: 'Share your thoughts',
        }}
        onSubmit={onKeyboardSubmit}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        submitCopy={submitCopy}
        toolbarPosition="bottom"
        hideMarkdownHeader
        hideFooter
        hideMarkdownToggle
        onMarkdownModeChange={setIsMarkdownMode}
        header={
          <div
            className={classNames(
              'flex shrink-0 flex-row items-center gap-2',
              fills ? 'px-5 pt-5' : 'px-4 pt-2',
            )}
          >
            {headerLabel && (
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                truncate
                className="min-w-0 flex-1"
              >
                {headerLabel}
              </Typography>
            )}
            <span className="ml-auto flex shrink-0 flex-row items-center gap-1">
              <Tooltip content={markdownToggleLabel}>
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  icon={<MarkdownIcon secondary={isMarkdownMode} />}
                  pressed={isMarkdownMode}
                  onClick={() => richTextRef.current?.toggleMarkdownMode()}
                  aria-label={markdownToggleLabel}
                  aria-pressed={isMarkdownMode}
                />
              </Tooltip>
              {onClose && (
                <CloseButton
                  type="button"
                  size={ButtonSize.Small}
                  onClick={onClose}
                  aria-label="Cancel"
                />
              )}
            </span>
          </div>
        }
        onValueUpdate={onChange}
      />
    </form>
  );
}

export const CommentMarkdownInput = forwardRef(CommentMarkdownInputComponent);
