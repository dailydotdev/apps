import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { usePersonalization } from './PersonalizationContext';

/** One floating line: the last change, Undo, and the screen's next step. */
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
  const message = lastMessage ?? notice ?? defaultMessage;

  return (
    <div className="pointer-events-none sticky bottom-4 z-3 mt-8 flex justify-center tablet:bottom-6">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-[40rem] items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2 pl-4 shadow-2"
      >
        <span
          className={classNames(
            'min-w-0 flex-1 truncate text-text-primary',
            isCompact ? 'typo-footnote' : 'typo-callout',
          )}
          title={message}
        >
          {message}
        </span>
        <span
          className={classNames(
            'flex items-center',
            isCompact ? 'gap-1' : 'gap-2',
          )}
        >
          {pendingCount > 0 && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<UndoIcon />}
              aria-label="Undo"
              title="Undo"
              onClick={undo}
            >
              {isCompact ? undefined : 'Undo'}
            </Button>
          )}
          {onOpenControls && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<SettingsIcon />}
              aria-label="Personalize"
              title="Personalize your feed"
              onClick={onOpenControls}
            >
              {isCompact ? undefined : 'Personalize'}
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
        </span>
      </div>
    </div>
  );
};
