import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { VIcon } from '../icons';
import type { IconProps } from '../Icon';

/**
 * The confirmation half of a copy control: the success checkmark, spun through
 * the upvote button's curve. Swap it in for the resting icon while the copy is
 * confirmed.
 */
export function CopyConfirmIcon({
  className,
  ...props
}: IconProps): ReactElement {
  return (
    <VIcon
      {...props}
      className={classNames(
        className,
        'animate-copy-confirm text-status-success motion-reduce:animate-none',
      )}
      secondary
    />
  );
}
