import type { ReactElement } from 'react';
import React from 'react';
import { ReaderHeaderActionGroup } from './ReaderHeaderActionButtons';

type ReaderChromeProps = {
  onClose: () => void;
  isPostPage?: boolean;
};

export function ReaderChrome({
  onClose,
  isPostPage = false,
}: ReaderChromeProps): ReactElement {
  return (
    <div
      className="z-30 pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2"
      role="banner"
    >
      <div aria-hidden />

      {!isPostPage && (
        <div className="pointer-events-auto" aria-label="Reader actions">
          <ReaderHeaderActionGroup onClose={onClose} showLegacyLayoutOptOut />
        </div>
      )}
    </div>
  );
}
