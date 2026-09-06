import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { WriteCommentContext } from '../../contexts/WriteCommentContext';
import { useMutateComment } from '../../hooks/post/useMutateComment';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer, DrawerPosition } from '../drawers/Drawer';

export interface CommentInputProps extends CommentMarkdownInputProps {
  onClose?: () => void;
  /** Inline on small viewports too — the companion must not cover the host page. */
  forceInline?: boolean;
}

export default function CommentInput({
  onClose,
  className,
  forceInline = false,
  ...props
}: CommentInputProps): ReactElement {
  const isFullScreen = !useViewSize(ViewSize.Laptop) && !forceInline;
  // The draft lives above the drawer/inline swap at the Laptop breakpoint.
  const [draft, setDraft] = useState<string>();

  const mutateCommentResult = useMutateComment({
    post: props.post,
    editCommentId: props.editCommentId,
    parentCommentId: props.parentCommentId,
    onCommented: props.onCommented,
  });

  const composer = (
    <CommentMarkdownInput
      {...props}
      autoFocus={isFullScreen || props.autoFocus}
      fills={isFullScreen}
      className={isFullScreen ? undefined : className}
      initialContent={draft ?? props.initialContent}
      onChange={(value) => {
        setDraft(value);
        props.onChange?.(value);
      }}
      onClose={onClose}
    />
  );

  return (
    <WriteCommentContext.Provider
      value={{ mutateComment: mutateCommentResult }}
    >
      {isFullScreen ? (
        <Drawer
          isOpen
          isFullScreen
          // Transformed ancestors (`animate-composer-in`) trap position: fixed
          appendOnRoot
          position={DrawerPosition.Bottom}
          onClose={() => onClose?.()}
          className={{ wrapper: 'flex flex-col !p-0' }}
        >
          {composer}
        </Drawer>
      ) : (
        composer
      )}
    </WriteCommentContext.Provider>
  );
}
