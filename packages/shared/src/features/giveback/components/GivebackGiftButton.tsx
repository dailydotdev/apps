import type { ForwardedRef, ReactElement } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { GiftIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { Tooltip } from '../../../components/tooltip/Tooltip';

export type GivebackGiftButtonVariant = 'header' | 'rail';

export interface GivebackGiftButtonProps {
  variant?: GivebackGiftButtonVariant;
  showLabel?: boolean;
  label?: string;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

const pressClass = 'transition-transform duration-150 ease-out active:scale-90';

// The persistent giveback entry point. Calm at rest — a plain gift, no ambient
// progress meter and no notification badge. Ref-forwarding so the dock can
// anchor money jumps and the milestone glow to the icon.
export const GivebackGiftButton = forwardRef(function GivebackGiftButton(
  {
    variant = 'header',
    showLabel = false,
    label = 'Giveback',
    tooltip = 'Giveback',
    onClick,
    className,
  }: GivebackGiftButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
): ReactElement {
  const isRail = variant === 'rail';

  // Header: a square icon button that matches the notification bell exactly
  // (Float, w-10, centered, no side padding) so it's not wider than its
  // neighbours.
  if (!isRail) {
    return (
      <Tooltip content={tooltip} side="bottom">
        <Button
          ref={ref}
          type="button"
          variant={ButtonVariant.Float}
          aria-label={tooltip}
          onClick={onClick}
          icon={<GiftIcon />}
          className={classNames(
            'relative w-10 justify-center',
            pressClass,
            className,
          )}
        />
      </Tooltip>
    );
  }

  const railButton = (
    <Button
      ref={ref}
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.Small}
      onClick={onClick}
      aria-label={tooltip}
      className={classNames(
        'relative',
        pressClass,
        showLabel && '!justify-start gap-3',
        className,
      )}
    >
      <GiftIcon size={IconSize.Small} className="text-text-primary" />
      {showLabel && (
        <span className="font-bold text-text-primary typo-callout">
          {label}
        </span>
      )}
    </Button>
  );

  if (showLabel) {
    return railButton;
  }

  return (
    <Tooltip content={tooltip} side="right">
      {railButton}
    </Tooltip>
  );
});

export default GivebackGiftButton;
