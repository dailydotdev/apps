import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { ViewSize, useViewSize } from '../../hooks';
import { useMutateComment } from '../../hooks/post/useMutateComment';
import { WriteCommentContext } from '../../contexts/WriteCommentContext';

interface CommentInputOrPageProps
  extends Omit<CommentMarkdownInputProps, 'className'> {
  onClose?: () => void;
  className?: {
    input?: CommentMarkdownInputProps['className'];
    modal?: string;
  };
  replyToCommentId?: string;
}

export default function CommentInputOrPage({
  onClose,
  className,
  ...props
}: CommentInputOrPageProps): ReactElement {
  const isMobile = useViewSize(ViewSize.MobileL);
  const router = useRouter();
  const mutateCommentResult = useMutateComment({
    post: props.post,
    editCommentId: props.editCommentId,
    parentCommentId: props.parentCommentId,
    onCommented: props.onCommented,
  });

  if (isMobile) {
    const commentId = props.editCommentId ?? 'new';
    const editSuffix = props.editCommentId ? '/edit' : '';
    const query: Record<string, string> = {
      id: props.post.id,
      commentId,
    };

    if (!editSuffix && props.parentCommentId) {
      query.replyTo = props.replyToCommentId ?? props.parentCommentId;
    }

    router.push({
      pathname: `/posts/[id]/comments/[commentId]${editSuffix}`,
      query,
    });

    return null;
  }

  return (
    <WriteCommentContext.Provider
      value={{ mutateComment: mutateCommentResult }}
    >
      <CommentMarkdownInput {...props} className={className.input} />
    </WriteCommentContext.Provider>
  );
}
