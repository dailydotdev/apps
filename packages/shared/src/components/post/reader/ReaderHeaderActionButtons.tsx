import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { MiniCloseIcon as CloseIcon, SidebarArrowRight } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';

export const readerHeaderActionGroupClassName =
  'flex items-center gap-px rounded-12 border border-border-subtlest-tertiary bg-background-default p-px shadow-3';

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

type ReaderHeaderActionGroupProps = {
  onToggleRail?: () => void;
  onClose?: () => void;
};

export function ReaderHeaderActionGroup({
  onToggleRail,
  onClose,
}: ReaderHeaderActionGroupProps): ReactElement | null {
  if (!onToggleRail && !onClose) {
    return null;
  }

  return (
    <>
      {onToggleRail ? (
        <div className={readerHeaderActionGroupClassName}>
          <ReaderDiscussionToggleButton onToggleRail={onToggleRail} />
        </div>
      ) : null}
      {onClose ? (
        <div className={readerHeaderActionGroupClassName}>
          <ReaderCloseButton onClose={onClose} />
        </div>
      ) : null}
    </>
  );
}
