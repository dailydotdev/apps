import React, { KeyboardEvent, ReactElement, useState } from 'react';
import { requestIdleCallback } from 'next/dist/client/request-idle-callback';
import classNames from 'classnames';
import commentPopupText from '../../commentPopupText';
import CommentIcon from '../icons/Discuss';
import { Button } from '../buttons/Button';
import { ModalCloseButton } from '../modals/ModalCloseButton';

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
      <div
        className={classNames(
          'invert relative flex flex-col p-4 bg-theme-bg-primary rounded-2xl',
          layoutModeClass,
        )}
      >
        <ModalCloseButton
          onClick={onClose}
          style={{ top: '0.5rem', right: '0.75rem' }}
        />
        <h3 className="mr-11 ml-2 font-bold text-theme-label-primary typo-callout">
          {text.title}
        </h3>
        <div
          className={classNames(
            'flex',
            listMode ? 'items-center' : 'flex-col flex-1',
          )}
        >
          <textarea
            placeholder={text.placeholder}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={onKeyDown}
            className={classNames(
              'flex-1 px-3 bg-theme-float text-theme-label-primary resize-none typo-callout focus-outline placeholder-theme-label-tertiary caret-theme-label-link',
              listMode ? 'h-10 mr-4 py-2.5' : 'my-4 py-3',
            )}
            style={{
              borderRadius: '0.875rem',
            }}
          />
          <Button
            icon={<CommentIcon />}
            onClick={() => onSubmit?.(comment)}
            disabled={!comment?.trim().length}
            loading={loading}
            className={classNames('btn-primary', 'self-end')}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}
