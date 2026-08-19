import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  MaximizeIcon,
  MinimizeIcon,
} from '@dailydotdev/shared/src/components/icons';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';

interface WorldImmersiveToggleProps {
  isImmersive: boolean;
  onToggleImmersive: () => void;
  /**
   * Standing on the world on its own, once there is no chrome left to hold it:
   * top left, opposite the mark, because it is then the only way back.
   */
  floating?: boolean;
  className?: string;
}

/** Hides the panels so the world has the whole screen, and brings them back. */
export function WorldImmersiveToggle({
  isImmersive,
  onToggleImmersive,
  floating,
  className,
}: WorldImmersiveToggleProps): ReactElement {
  const button = (
    <Tooltip content={isImmersive ? 'Show the panels' : 'Hide the panels'}>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={isImmersive ? <MinimizeIcon /> : <MaximizeIcon />}
        onClick={onToggleImmersive}
        className={floating ? undefined : className}
      />
    </Tooltip>
  );

  if (!floating) {
    return button;
  }

  return (
    <div
      data-world-overlay
      className={classNames(
        'pointer-events-auto absolute left-3 top-3 z-2 flex items-center',
        // p-1 around a 32px button is 40px tall: the same plate the mark makes
        // out of a 20px logo and py-2.5, so the two line up across the top.
        'rounded-16 border border-border-subtlest-tertiary bg-background-default p-1',
        className,
      )}
    >
      {button}
    </div>
  );
}

/**
 * The signature on the frame. A page built to be screenshotted from should not
 * leave one unsigned, so the mark outlives every panel, floating top right
 * wherever there is no bar to ride in.
 *
 * The plate's padding is deliberately lopsided so that it LOOKS even. LogoText
 * draws into a 77-wide viewBox but its ink stops at 69: the last eight units
 * are reserved for the Plus star, which this logo never sets. At `h-5` that
 * viewBox scales 1:1, so the element carries ~8px of dead space on its right
 * that no amount of equal padding can balance out.
 */
export function WorldMark({
  floating,
  insetRight,
}: {
  floating?: boolean;
  /**
   * The district feed is standing on the right edge, so the mark steps aside
   * rather than sitting on its header. Laptop only: below that the feed is a
   * sheet along the bottom and this corner is clear.
   */
  insetRight?: boolean;
}): ReactElement {
  return (
    <div
      {...(floating && { 'data-world-overlay': true })}
      className={classNames(
        'flex flex-none items-center',
        floating &&
          'pointer-events-auto absolute right-3 top-3 z-2 rounded-16 border border-border-subtlest-tertiary bg-background-default py-2.5 pl-3 pr-1',
        floating && insetRight && 'laptop:right-[21rem]',
      )}
    >
      <Logo
        position={LogoPosition.Initial}
        logoClassName={{ container: 'h-5' }}
      />
    </div>
  );
}
