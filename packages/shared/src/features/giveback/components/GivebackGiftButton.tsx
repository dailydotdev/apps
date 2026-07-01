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

  const button = (
    <Button
      ref={ref}
      type="button"
      variant={isRail ? ButtonVariant.Tertiary : ButtonVariant.Float}
      size={isRail ? ButtonSize.Small : ButtonSize.Medium}
      onClick={onClick}
      aria-label={tooltip}
      className={classNames(
        'relative transition-transform duration-150 ease-out active:scale-90',
        isRail && showLabel && '!justify-start gap-3',
        className,
      )}
    >
      <GiftIcon
        size={isRail ? IconSize.Small : IconSize.Medium}
        className="text-text-primary"
      />
      {isRail && showLabel && (
        <span className="font-bold text-text-primary typo-callout">
          {label}
        </span>
      )}
    </Button>
  );

  if (isRail && showLabel) {
    return button;
  }

  return (
    <Tooltip content={tooltip} side={isRail ? 'right' : 'bottom'}>
      {button}
    </Tooltip>
  );
});

export default GivebackGiftButton;
