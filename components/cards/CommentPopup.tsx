import React, { KeyboardEvent, ReactElement, useState } from 'react';
import { ModalCloseButton } from '../modals/StyledModal';
import commentPopupText from '../../commentPopupText';
import CommentIcon from '../../icons/comment.svg';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import Button from '../buttons/Button';
import classNames from 'classnames';

const transitionDuration = 150;

export type CommentPopupProps = {
  onClose?: () => unknown;
  onSubmit?: (comment: string) => unknown;
  loading?: boolean;
};

export default function CommentPopup({
  onClose,
  onSubmit,
  loading,
}: CommentPopupProps): ReactElement {
  const [show, setShow] = useState(false);
  const [comment, setComment] = useState<string>();
  const [text] = useState(
    commentPopupText[Math.floor(Math.random() * commentPopupText.length)],
  );

  const containerRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      requestIdleCallback(() => setShow(true));
    }
  };

  const onKeyDown = async (event: KeyboardEvent): Promise<void> => {
    // Ctrl / Command + Enter
    if (
      (event.ctrlKey || event.metaKey) &&
      event.keyCode === 13 &&
      comment?.length
    ) {
      onSubmit(comment);
    }
  };

  return (
    <div
      className={classNames(
        'absolute flex flex-col left-0 top-0 w-full h-full justify-end bg-theme-post-disabled rounded-2xl z-2 overflow-hidden',
        !show && 'opacity-0',
      )}
      ref={containerRef}
      style={{
        pointerEvents: 'all',
        transition: `opacity ${transitionDuration}ms ease-out`,
        willChange: 'opacity',
      }}
    >
      <div className="invert relative flex flex-col h-3/4 p-4 bg-theme-bg-primary rounded-2xl">
        <ModalCloseButton onClick={onClose} />
        <h3 className="text-theme-label-primary mr-11 ml-2 typo-callout">
          {text.title}
        </h3>
        <textarea
          placeholder={text.placeholder}
          onChange={(event) => setComment(event.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 my-4 p-3 bg-theme-float text-theme-label-primary resize-none typo-callout focus-outline placeholder-theme-label-tertiary"
          style={{
            borderRadius: '0.875rem',
            caretColor: 'var(--theme-label-link)',
          }}
        />
        <Button
          icon={<CommentIcon />}
          onClick={() => onSubmit?.(comment)}
          disabled={!comment?.length}
          loading={loading}
          className="btn-primary"
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
