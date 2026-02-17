import type {
  CSSProperties,
  FormEventHandler,
  FormHTMLAttributes,
  MutableRefObject,
  ReactElement,
} from 'react';
import React, { forwardRef, useRef } from 'react';
import classNames from 'classnames';
import { defaultMarkdownCommands } from '../../../hooks/input';
import type { RichTextInputRef } from '../RichTextInput';
import RichTextInput from '../RichTextInput';
import type { Comment } from '../../../graphql/comments';
import { formToJson } from '../../../lib/form';
import type { Post } from '../../../graphql/posts';
import { useWriteCommentContext } from '../../../contexts/WriteCommentContext';

export interface CommentClassName {
  container?: string;
  tab?: string;
  markdownContainer?: string;
  input?: string;
}

export interface CommentMarkdownInputProps {
  post: Post;
  editCommentId?: string;
  parentCommentId?: string;
  initialContent?: string;
  replyTo?: string;
  className?: CommentClassName;
  style?: CSSProperties;
  onCommented?: (
    comment: Comment,
    isNew: boolean,
    parentCommentId?: string,
  ) => void;
  showSubmit?: boolean;
  showUserAvatar?: boolean;
  onChange?: (value: string) => void;
  formProps?: FormHTMLAttributes<HTMLFormElement>;
  onClose?: () => void;
}

export function CommentMarkdownInputComponent(
  {
    post,
    initialContent,
    replyTo,
    editCommentId,
    parentCommentId,
    className = {},
    style,
    onChange,
    showSubmit = true,
    showUserAvatar = true,
    formProps = {},
    onClose,
  }: CommentMarkdownInputProps,
  ref: MutableRefObject<HTMLFormElement>,
): ReactElement {
  const shouldFocus = useRef(true);
  const postId = post?.id;
  const sourceId = post?.source?.id;
  const {
    mutateComment: { mutateComment, isLoading, isSuccess },
  } = useWriteCommentContext();
  const richTextRef = useRef<RichTextInputRef>(null);

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
      className={className?.container}
      style={style}
      ref={ref}
    >
      <RichTextInput
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
          container: classNames('!min-h-16', className?.markdownContainer),
          input: classNames(className?.input, replyTo && 'mt-0'),
          profile: replyTo && '!mt-0',
        }}
        postId={postId}
        sourceId={sourceId}
        showUserAvatar={showUserAvatar}
        isLoading={isLoading}
        disabledSubmit={isSuccess}
        initialContent={initialContent}
        editCommentId={editCommentId}
        parentCommentId={parentCommentId}
        textareaProps={{
          name: 'content',
          rows: 7,
          placeholder: 'Share your thoughts',
        }}
        onSubmit={onKeyboardSubmit}
        enabledCommand={{ ...defaultMarkdownCommands, upload: true }}
        submitCopy={showSubmit && (editCommentId ? 'Update' : 'Comment')}
        timeline={
          replyTo ? (
            <span className="py-2 pl-12 text-text-tertiary typo-caption1">
              Reply to
              <span className="ml-2 font-bold text-text-primary">
                {replyTo}
              </span>
            </span>
          ) : null
        }
        onValueUpdate={onChange}
        onClose={onClose}
      />
    </form>
  );
}

export const CommentMarkdownInput = forwardRef(CommentMarkdownInputComponent);
