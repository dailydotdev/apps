import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  EyeIcon,
  MiniCloseIcon as CloseIcon,
  SidebarArrowRight,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { useLegacyPostLayoutOptOut } from './hooks/useLegacyPostLayoutOptOut';

export const readerHeaderActionGroupClassName =
  'flex h-9 items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default p-px shadow-3';

const iconButtonClassName = '!h-8 !w-8 !min-w-8 !rounded-10 !p-0';

type ReaderDiscussionToggleButtonProps = {
  onToggleRail: () => void;
};

export function ReaderDiscussionToggleButton({
  onToggleRail,
}: ReaderDiscussionToggleButtonProps): ReactElement {
  return (
    <Tooltip content="Show discussion">
      <Button
        icon={<SidebarArrowRight />}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        type="button"
        className={iconButtonClassName}
        onClick={onToggleRail}
        aria-label="Show discussion panel"
        aria-pressed={false}
      />
    </Tooltip>
  );
}

type ReaderCloseButtonProps = {
  onClose: () => void;
};

export function ReaderCloseButton({
  onClose,
}: ReaderCloseButtonProps): ReactElement {
  return (
    <Tooltip side="bottom" content="Close">
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<CloseIcon />}
        size={ButtonSize.Small}
        type="button"
        className={iconButtonClassName}
        onClick={onClose}
        aria-label="Close reader"
      />
    </Tooltip>
  );
}

type ReaderLegacyLayoutToggleButtonProps = {
  target?: 'classic' | 'reader';
  /**
   * When true, render the toggle as `icon + "Close browser mode"` so users
   * inside the reader modal can clearly find the exit. The standalone post
   * page keeps the icon-only variant for a compact chrome.
   */
  showLabel?: boolean;
};

export function ReaderLegacyLayoutToggleButton({
  target = 'classic',
  showLabel = false,
}: ReaderLegacyLayoutToggleButtonProps): ReactElement {
  const { optIn, optOut } = useLegacyPostLayoutOptOut();
  const isClassicTarget = target === 'classic';
  const label = isClassicTarget ? 'Close browser mode' : 'Enable browser mode';
  const ariaLabel = isClassicTarget
    ? 'Use classic post layout'
    : 'Use embedded reader';
  const onClick = isClassicTarget ? () => optOut() : optIn;

  if (showLabel) {
    return (
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<EyeIcon />}
        size={ButtonSize.Small}
        type="button"
        className="!h-8 !gap-1.5 !rounded-10 !px-3 !text-text-primary"
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {label}
      </Button>
    );
  }

  return (
    <Tooltip side="bottom" content={ariaLabel}>
      <Button
        variant={ButtonVariant.Tertiary}
        icon={<EyeIcon />}
        size={ButtonSize.Small}
        type="button"
        className={iconButtonClassName}
        onClick={onClick}
        aria-label={ariaLabel}
      />
    </Tooltip>
  );
}

type ReaderHeaderActionGroupProps = {
  onToggleRail?: () => void;
  onClose?: () => void;
  showLegacyLayoutOptOut?: boolean;
  legacyLayoutOptOutShowLabel?: boolean;
};

export function ReaderHeaderActionGroup({
  onToggleRail,
  onClose,
  showLegacyLayoutOptOut = false,
  legacyLayoutOptOutShowLabel = false,
}: ReaderHeaderActionGroupProps): ReactElement | null {
  if (!onToggleRail && !onClose && !showLegacyLayoutOptOut) {
    return null;
  }

  return (
    <>
      {onToggleRail ? (
        <div className={readerHeaderActionGroupClassName}>
          <ReaderDiscussionToggleButton onToggleRail={onToggleRail} />
        </div>
      ) : null}
      {onClose || showLegacyLayoutOptOut ? (
        <div className={readerHeaderActionGroupClassName}>
          {showLegacyLayoutOptOut ? (
            <ReaderLegacyLayoutToggleButton
              target="classic"
              showLabel={legacyLayoutOptOutShowLabel}
            />
          ) : null}
          {onClose ? <ReaderCloseButton onClose={onClose} /> : null}
        </div>
      ) : null}
    </>
  );
}
