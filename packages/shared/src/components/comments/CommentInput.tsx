import type { ReactElement } from 'react';
import React from 'react';
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
  // Writing a comment on a phone gets the whole screen, the same way creating a
  // post does — a box wedged into the page leaves too little room to write in.
  const isFullScreen = !useViewSize(ViewSize.Laptop);

  const mutateCommentResult = useMutateComment({
    post: props.post,
    editCommentId: props.editCommentId,
    parentCommentId: props.parentCommentId,
    onCommented: props.onCommented,
  });

  const composer = (
    <CommentMarkdownInput
      {...props}
      // The drawer is the reason to open the keyboard immediately: there is
      // nothing else on screen to interact with.
      autoFocus={isFullScreen || props.autoFocus}
      fills={isFullScreen}
      className={isFullScreen ? undefined : className}
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
          position={DrawerPosition.Bottom}
          onClose={() => onClose?.()}
          className={{ wrapper: 'flex flex-col !px-0 !pt-0' }}
        >
          {composer}
        </Drawer>
      ) : (
        composer
      )}
    </WriteCommentContext.Provider>
  );
}
