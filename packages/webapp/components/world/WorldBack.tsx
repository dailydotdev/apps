import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

interface WorldBackProps {
  user: PublicProfile;
  /** Inside a realm the way out is one level up, not off the world entirely. */
  isInRealm: boolean;
  onLeaveRealm: () => void;
}

/**
 * The way out, and the whole of the chrome a phone gets besides the mark.
 *
 * Below laptop there is no rail and no bar. A world this size needs the screen
 * more than it needs anything written over it: the ranking, the stats, the name
 * and the counters are all things you read for a while, and the strip a phone
 * can spare makes them unreadable and the world smaller at the same time. So
 * the only thing left is the one control you cannot do without, standing in a
 * corner opposite the mark — the same plate, the same height, so the two read
 * as one line across the top of the world rather than as two stray buttons.
 */
export function WorldBack({
  user,
  isInRealm,
  onLeaveRealm,
}: WorldBackProps): ReactElement {
  const props = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
    icon: <ArrowIcon className="-rotate-90" />,
  };

  return (
    <div
      data-world-overlay
      className="pointer-events-auto absolute left-3 top-3 z-2 flex items-center rounded-16 border border-border-subtlest-tertiary bg-background-default p-1"
    >
      {isInRealm ? (
        <Button
          {...props}
          type="button"
          aria-label="Back to the world"
          onClick={onLeaveRealm}
        />
      ) : (
        <Link href={`/${user.username || user.id}`} passHref>
          <Button {...props} tag="a" aria-label="Back to profile" />
        </Link>
      )}
    </div>
  );
}
