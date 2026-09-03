import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { UpvoteIcon } from '../icons';
import type { IconProps } from '../Icon';

/**
 * The confirmation half of a copy control: the same filled arrow and spin the
 * upvote button uses, so the gesture that means "that worked" looks the same
 * everywhere. Swap it in for the resting icon while the copy is confirmed.
 */
export function CopyConfirmIcon({
  className,
  ...props
}: IconProps): ReactElement {
  return (
    <UpvoteIcon
      {...props}
      className={classNames(
        className,
        'animate-copy-confirm text-accent-avocado-default motion-reduce:animate-none',
      )}
      secondary
    />
  );
}
