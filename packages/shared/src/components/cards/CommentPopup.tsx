import React, { KeyboardEvent, ReactElement, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import commentPopupText from '../../commentPopupText';
import { DiscussIcon as CommentIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/Button';
import { ModalClose } from '../modals/common/ModalClose';

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
        'absolute left-0 top-0 z-2 flex h-full w-full flex-col justify-end overflow-hidden rounded-16 bg-theme-post-disabled',
        !show && 'opacity-0',
      )}
      ref={containerRef}
      style={{
        pointerEvents: 'all',
        transition: `opacity ${transitionDuration}ms ease-out`,
        willChange: 'opacity',
      }}
    >
      <div className="invert relative flex h-3/4 flex-col rounded-16 bg-background-default p-4">
        <ModalClose onClick={onClose} top="2" />
        <h3 className="ml-2 mr-11 font-bold text-text-primary typo-callout">
          {text.title}
        </h3>
        <div className="flex flex-1 flex-col">
          <textarea
            placeholder={text.placeholder}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={onKeyDown}
            className="focus-outline my-4 flex-1 resize-none bg-surface-float px-3 py-3 text-text-primary placeholder-text-tertiary caret-text-link typo-callout"
            style={{
              borderRadius: '0.875rem',
            }}
          />
          <Button
            variant={ButtonVariant.Primary}
            icon={<CommentIcon />}
            onClick={() => onSubmit?.(comment)}
            disabled={!comment?.trim().length}
            loading={loading}
            className="self-end"
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
