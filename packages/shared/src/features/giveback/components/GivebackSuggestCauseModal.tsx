import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { RootPortal } from '../../../components/tooltips/Portal';
import { GivebackSuggestCauseForm } from './GivebackSuggestCauseForm';

interface GivebackSuggestCauseModalProps {
  onClose: () => void;
}

// Standalone home for the suggest-a-cause form (the Causes tab entry point),
// mirroring GivebackActionSubmissionModal's portal + backdrop shell.
export const GivebackSuggestCauseModal = ({
  onClose,
}: GivebackSuggestCauseModalProps): ReactElement => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <RootPortal>
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4 backdrop-blur-sm">
        <button
          type="button"
          aria-label="Close"
          tabIndex={-1}
          className="absolute inset-0 cursor-default"
          onClick={onClose}
        />
        <section
          aria-modal="true"
          role="dialog"
          aria-label="Suggest a cause"
          className="relative z-1 flex max-h-[calc(100vh-2rem)] w-full max-w-[32rem] flex-col overflow-hidden rounded-24 border border-border-subtlest-secondary bg-background-default shadow-2"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 tablet:p-5">
            <GivebackSuggestCauseForm onClose={onClose} origin="causes_tab" />
          </div>
        </section>
      </div>
    </RootPortal>
  );
};
