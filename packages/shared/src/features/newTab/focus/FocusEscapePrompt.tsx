import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FocusEscapePromptProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  remainingLabel: string;
}

// Bespoke dialog rather than the shared Modal so the Focus overlay stays a
// single bundle and doesn't pull in react-modal on every new tab. Focus is
// trapped inside on open and released back to the timer on close.
export const FocusEscapePrompt = ({
  isOpen,
  onConfirm,
  onCancel,
  remainingLabel,
}: FocusEscapePromptProps): ReactElement | null => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }
      const focusables = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className={classNames(
        'fixed inset-0 z-modal flex items-center justify-center bg-overlay-quaternary-onion backdrop-blur-md',
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="focus-escape-title"
        aria-describedby="focus-escape-desc"
        className="mx-4 flex w-full max-w-md flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-6 shadow-2"
      >
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          id="focus-escape-title"
          bold
        >
          End focus session?
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          id="focus-escape-desc"
        >
          You still have {remainingLabel} left. Breaking focus now will end the
          session and clear your timer.
        </Typography>
        <div className="mt-2 flex justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            onClick={onCancel}
          >
            Keep focusing
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Medium}
            onClick={onConfirm}
          >
            End session
          </Button>
        </div>
      </div>
    </div>
  );
};
