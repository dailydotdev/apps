import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { CommentMarkdownInputProps } from '../fields/MarkdownInput/CommentMarkdownInput';
import { CommentMarkdownInput } from '../fields/MarkdownInput/CommentMarkdownInput';
import { WriteCommentContext } from '../../contexts/WriteCommentContext';
import { useMutateComment } from '../../hooks/post/useMutateComment';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer, DrawerPosition } from '../drawers/Drawer';

interface CommentInputProps extends CommentMarkdownInputProps {
  onClose?: () => void;
}

export default function CommentInput({
  onClose,
  className,
  ...props
}: CommentInputProps): ReactElement {
  const isFullScreen = !useViewSize(ViewSize.Laptop);
  // Crossing the Laptop breakpoint (tablet rotation) swaps the drawer and
  // inline trees, remounting the editor — the draft has to survive up here.
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
