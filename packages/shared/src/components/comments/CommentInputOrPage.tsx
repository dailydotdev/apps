import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  CommentMarkdownInput,
  CommentMarkdownInputProps,
} from '../fields/MarkdownInput/CommentMarkdownInput';
import { ViewSize, useViewSize } from '../../hooks';

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

  if (isMobile) {
    const commentId = props.editCommentId ?? 'new';
    const editSuffix = props.editCommentId ? '/edit' : '';
    const url = new URL(
      `${props.post.commentsPermalink}/comments/${commentId}${editSuffix}`,
    );

    if (!editSuffix && props.parentCommentId) {
      url.searchParams.set(
        'replyTo',
        props.replyToCommentId ?? props.parentCommentId,
      );
    }

    router.push(url.toString());

    return null;
  }

  return <CommentMarkdownInput {...props} className={className.input} />;
}
