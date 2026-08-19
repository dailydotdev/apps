import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useId, useRef } from 'react';
import CloseButton from '../../../components/CloseButton';
import { ButtonSize } from '../../../components/buttons/common';
import type { Deal } from '../types';
import { DealContent, DealContentPresentation } from './DealContent';

interface DealDetailModalProps {
  deal: Deal;
  onClose: () => void;
  onClaim?: (deal: Deal) => void;
  onOpenDeal?: (deal: Deal) => void;
  onCodeFeedback?: (worked: boolean) => void;
  onUpvote?: (deal: Deal) => void;
  isClaimedByMe?: boolean;
  isUpvoted?: boolean;
  now?: number;
  shareBar?: ReactNode;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => element.offsetParent !== null,
  );

export const DealDetailModal = ({
  deal,
  onClose,
  onClaim,
  onOpenDeal,
  onCodeFeedback,
  onUpvote,
  isClaimedByMe,
  isUpvoted,
  now,
  shareBar,
}: DealDetailModalProps): ReactElement => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();

        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return;
      }

      const focusable = getFocusable(dialogRef.current);

      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();

        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOutside = !dialogRef.current.contains(active);

      if (event.shiftKey && (isOutside || active === first)) {
        event.preventDefault();
        last.focus();

        return;
      }

      if (!event.shiftKey && (isOutside || active === last)) {
        event.preventDefault();
        first.focus();
      }
    };

    globalThis.addEventListener('keydown', onKeyDown);

    return () => globalThis.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center tablet:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close the deal details"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-overlay-quaternary-onion"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-1 flex h-full max-h-full w-full max-w-2xl flex-col overflow-hidden border-border-subtlest-secondary bg-background-default shadow-2 tablet:h-auto tablet:max-h-[min(calc(100vh-5rem),44rem)] tablet:rounded-16 tablet:border"
      >
        <div className="flex flex-1 flex-col overflow-y-auto p-4 tablet:p-6">
          <DealContent
            deal={deal}
            presentation={DealContentPresentation.Modal}
            now={now}
            titleId={titleId}
            isClaimedByMe={isClaimedByMe}
            isUpvoted={isUpvoted}
            onClaim={onClaim}
            onUpvote={onUpvote}
            onCodeFeedback={onCodeFeedback}
            onSelectDeal={onOpenDeal}
            shareBar={shareBar}
          />
        </div>

        <CloseButton
          type="button"
          size={ButtonSize.Small}
          onClick={onClose}
          className="absolute right-4 top-4 z-1"
        />
      </div>
    </div>
  );
};
