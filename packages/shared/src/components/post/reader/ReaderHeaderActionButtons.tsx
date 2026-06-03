import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import {
  MiniCloseIcon as CloseIcon,
  SettingsIcon,
  SidebarArrowRight,
} from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';
import { settingsUrl } from '../../../lib/constants';

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

// Link to the appearance settings page where the user can toggle the
// "Read articles inside daily.dev" preference. Opens in the same tab.
export function ReaderSettingsLink(): ReactElement {
  return (
    <Tooltip side="bottom" content="Reader settings">
      <Button
        tag="a"
        variant={ButtonVariant.Tertiary}
        icon={<SettingsIcon />}
        size={ButtonSize.Small}
        href={`${settingsUrl}/appearance`}
        className={iconButtonClassName}
        aria-label="Reader settings"
      />
    </Tooltip>
  );
}

type ReaderHeaderActionGroupProps = {
  onToggleRail?: () => void;
  onClose?: () => void;
  /**
   * Render the appearance-settings link alongside the close button so users
   * always have a one-click path to opt out of the reader experience.
   */
  showSettingsLink?: boolean;
};

export function ReaderHeaderActionGroup({
  onToggleRail,
  onClose,
  showSettingsLink = false,
}: ReaderHeaderActionGroupProps): ReactElement | null {
  if (!onToggleRail && !onClose && !showSettingsLink) {
    return null;
  }

  return (
    <>
      {onToggleRail ? (
        <div className={readerHeaderActionGroupClassName}>
          <ReaderDiscussionToggleButton onToggleRail={onToggleRail} />
        </div>
      ) : null}
      {onClose || showSettingsLink ? (
        <div className={readerHeaderActionGroupClassName}>
          {showSettingsLink ? <ReaderSettingsLink /> : null}
          {onClose ? <ReaderCloseButton onClose={onClose} /> : null}
        </div>
      ) : null}
    </>
  );
}
