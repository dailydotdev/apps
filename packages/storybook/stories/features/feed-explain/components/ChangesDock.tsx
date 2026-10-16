import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { usePersonalization } from './PersonalizationContext';

/** Floats at the bottom: the last change, Undo, and the screen's next step. */
export const ChangesDock = ({
  primaryLabel,
  onPrimary,
  defaultMessage,
  onOpenControls,
  isCompact,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  defaultMessage: string;
  onOpenControls?: () => void;
  isCompact?: boolean;
}): ReactElement => {
  const { lastMessage, notice, pendingCount, undo } = usePersonalization();

  return (
    <div className="pointer-events-none sticky bottom-4 z-3 mt-8 flex justify-center tablet:bottom-6">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-[36rem] items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 pl-4 shadow-2"
      >
        <span className="min-w-0 flex-1 text-text-primary typo-callout">
          {lastMessage ?? notice ?? defaultMessage}
        </span>
        {pendingCount > 0 && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<UndoIcon />}
            onClick={undo}
          >
            Undo
          </Button>
        )}
        {onOpenControls && (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<SettingsIcon />}
            aria-label="All controls"
            title="All personalization controls"
            onClick={onOpenControls}
          >
            {isCompact ? undefined : 'All controls'}
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onPrimary}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
};
