import React, { KeyboardEvent, ReactElement, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import commentPopupText from '../../commentPopupText';
import { DiscussIcon as CommentIcon } from '../icons';
import { Button, ButtonVariant } from '../buttons/ButtonV2';
import { ModalClose } from '../modals/common/ModalClose';

const transitionDuration = 150;

export type CommentPopupProps = {
  onClose?: () => unknown;
  onSubmit?: (comment: string) => unknown;
  loading?: boolean;
  listMode?: boolean;
  compactCard?: boolean;
};

export default function CommentPopup({
  onClose,
  onSubmit,
  loading,
  listMode,
  compactCard,
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

  let layoutModeClass: string;
  if (listMode) {
    layoutModeClass = 'h-full ml-14 justify-between';
  } else if (compactCard) {
    layoutModeClass = 'h-full';
  } else {
    layoutModeClass = 'h-3/4';
  }
  return (
    <div
      className={classNames(
        'absolute left-0 top-0 z-2 flex h-full w-full flex-col justify-end overflow-hidden rounded-2xl bg-theme-post-disabled',
        !show && 'opacity-0',
      )}
      ref={containerRef}
      style={{
        pointerEvents: 'all',
        transition: `opacity ${transitionDuration}ms ease-out`,
        willChange: 'opacity',
      }}
    >
      <div
        className={classNames(
          'invert relative flex flex-col rounded-2xl bg-theme-bg-primary p-4',
          layoutModeClass,
        )}
      >
        <ModalClose onClick={onClose} top="2" />
        <h3 className="ml-2 mr-11 font-bold text-theme-label-primary typo-callout">
          {text.title}
        </h3>
        <div
          className={classNames(
            'flex',
            listMode ? 'items-center' : 'flex-1 flex-col',
          )}
        >
          <textarea
            placeholder={text.placeholder}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={onKeyDown}
            className={classNames(
              'focus-outline flex-1 resize-none bg-theme-float px-3 text-theme-label-primary placeholder-theme-label-tertiary caret-theme-label-link typo-callout',
              listMode ? 'mr-4 h-10 py-2.5' : 'my-4 py-3',
            )}
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
