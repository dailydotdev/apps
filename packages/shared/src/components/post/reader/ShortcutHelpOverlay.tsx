import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

const rows: Array<{ keys: string; action: string }> = [
  { keys: 'Esc', action: 'Close reader' },
  { keys: '[ / ]', action: 'Previous / next post' },
  { keys: 'R', action: 'Toggle discussion panel' },
  { keys: 'C', action: 'Focus comment composer' },
  { keys: 'U', action: 'Toggle upvote' },
  { keys: 'B', action: 'Toggle bookmark' },
  { keys: '?', action: 'Toggle this help' },
];

type ShortcutHelpOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

export function ShortcutHelpOverlay({
  isOpen,
  onClose,
  className,
}: ShortcutHelpOverlayProps): ReactElement | null {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={classNames(
        'z-30 absolute inset-0 flex items-start justify-center bg-overlay-quaternary-onion p-6',
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reader-shortcuts-title"
    >
      <div className="w-full max-w-md rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Typography
            id="reader-shortcuts-title"
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            bold
          >
            Keyboard shortcuts
          </Typography>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.action}
              className="flex items-center justify-between gap-4 border-b border-border-subtlest-tertiary py-2 last:border-0"
            >
              <Typography type={TypographyType.Callout}>
                {row.action}
              </Typography>
              <kbd className="rounded-8 bg-surface-float px-2 py-1 text-text-secondary typo-footnote">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
