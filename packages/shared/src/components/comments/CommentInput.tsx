import type { ReactElement } from 'react';
import React from 'react';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { WriteCommentContext } from '../../contexts/WriteCommentContext';
import { useMutateComment } from '../../hooks/post/useMutateComment';

interface CommentInputProps
  extends Omit<CommentMarkdownInputProps, 'className'> {
  onClose?: () => void;
  className?: {
    input?: CommentMarkdownInputProps['className'];
  };
}

export default function CommentInput({
  onClose,
  className,
  ...props
}: CommentInputProps): ReactElement {
  const mutateCommentResult = useMutateComment({
    post: props.post,
    editCommentId: props.editCommentId,
    parentCommentId: props.parentCommentId,
    onCommented: props.onCommented,
  });

  return (
    <WriteCommentContext.Provider
      value={{ mutateComment: mutateCommentResult }}
    >
      <CommentMarkdownInput
        {...props}
        className={className?.input}
        onClose={onClose}
      />
    </WriteCommentContext.Provider>
  );
}
