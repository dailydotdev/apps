import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { CopyIcon, VIcon } from '../icons';
import type { IconProps } from '../Icon';

/**
 * easeOutExpo — the curve the design-system dropdown animates on. It
 * decelerates into the target with no overshoot, which is what keeps a swap
 * from reading as a wobble.
 */
export const EASE_OUT_EXPO = 'ease-[cubic-bezier(0.16,1,0.3,1)]';

/**
 * A copy is a rare, deliberate moment, so the confirmation earns real motion.
 * Both glyphs share one grid cell so the label never shifts mid-swap, and the
 * transition collapses to an instant swap under `prefers-reduced-motion`.
 */
export const CopyStateIcon = ({
  copied,
  className,
  ...props
}: IconProps & { copied: boolean }): ReactElement => {
  const layer = classNames(
    className,
    'col-start-1 row-start-1 transition-[opacity,transform,filter] duration-200 motion-reduce:transition-none',
    EASE_OUT_EXPO,
  );

  return (
    <span className="inline-grid">
      <CopyIcon
        {...props}
        className={classNames(layer, copied && 'scale-50 opacity-0 blur-[2px]')}
      />
      <VIcon
        {...props}
        secondary
        className={classNames(
          layer,
          'text-status-success',
          !copied && 'scale-50 opacity-0 blur-[2px]',
        )}
      />
    </span>
  );
};
