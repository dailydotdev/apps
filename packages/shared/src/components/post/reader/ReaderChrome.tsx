import type { ReactElement } from 'react';
import React from 'react';
import {
  ReaderCloseButton,
  ReaderDiscussionToggleButton,
  readerHeaderActionGroupClassName,
} from './ReaderHeaderActionButtons';

type ReaderChromeProps = {
  onClose: () => void;
  isRailOpen: boolean;
  onToggleRail: () => void;
  isPostPage?: boolean;
};

export function ReaderChrome({
  onClose,
  isRailOpen,
  onToggleRail,
  isPostPage = false,
}: ReaderChromeProps): ReactElement {
  return (
    <div
      className="z-30 pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2"
      role="banner"
    >
      {!isRailOpen ? (
        <div
          className={`pointer-events-auto h-9 ${readerHeaderActionGroupClassName}`}
          aria-label="Header controls left"
        >
          <ReaderDiscussionToggleButton onToggleRail={onToggleRail} />
        </div>
      ) : (
        <div aria-hidden />
      )}

      {!isPostPage && (
        <div
          className={`pointer-events-auto h-9 ${readerHeaderActionGroupClassName}`}
          aria-label="Reader actions"
        >
          <ReaderCloseButton onClose={onClose} />
        </div>
      )}
    </div>
  );
}
