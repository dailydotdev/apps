import React, {
  CSSProperties,
  FormEventHandler,
  ReactElement,
  useEffect,
  useRef,
} from 'react';
import classNames from 'classnames';
import { defaultMarkdownCommands } from '../../../hooks/input';
import MarkdownInput, { MarkdownRef } from './index';
import { Comment } from '../../../graphql/comments';
import { formToJson } from '../../../lib/form';
import { Post } from '../../../graphql/posts';
import { useMutateComment } from '../../../hooks/post/useMutateComment';

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
}

export function CommentMarkdownInput({
  post,
  parentCommentId,
  initialContent,
  replyTo,
  editCommentId,
  className = {},
  style,
  onCommented,
  onChange,
  showSubmit = true,
  showUserAvatar = true,
}: CommentMarkdownInputProps): ReactElement {
  const postId = post?.id;
  const sourceId = post?.source?.id;
  const markdownRef = useRef<MarkdownRef>();

  const { mutateComment, isLoading, isSuccess } = useMutateComment({
    post,
    editCommentId,
    parentCommentId,
    onCommented,
  });

  const onSubmitForm: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const { content } = formToJson<{ content: string }>(e.currentTarget);

    return mutateComment(content);
  };

  const onKeyboardSubmit: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const content = e.currentTarget.value;

    return mutateComment(content);
  };

  useEffect(() => {
    markdownRef?.current?.textareaRef?.current?.focus();
  }, []);

  return (
    <form
      action="#"
      onSubmit={onSubmitForm}
      className={className?.container}
      style={style}
    >
      <MarkdownInput
        ref={markdownRef}
        className={{
          tab: classNames('!min-h-16', className?.tab),
          input: classNames(className?.input, replyTo && 'mt-0'),
          profile: replyTo && '!mt-0',
          container: className?.markdownContainer,
        }}
        postId={postId}
        sourceId={sourceId}
        showUserAvatar={showUserAvatar}
        isLoading={isLoading}
        disabledSubmit={isSuccess}
        initialContent={initialContent}
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
            <span className="py-2 pl-12 text-theme-label-tertiary typo-caption1">
              Reply to
              <span className="ml-2 font-bold text-theme-label-primary">
                {replyTo}
              </span>
            </span>
          ) : null
        }
        onValueUpdate={onChange}
      />
    </form>
  );
}
