import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ArrowIcon, InfoIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { WorldShare } from './WorldShare';

interface WorldBackProps {
  user: PublicProfile;
  /** Inside a realm the way out is one level up, not off the world entirely. */
  isInRealm: boolean;
  /** What the owner calls the place, if they have named it. */
  worldName?: string;
  isOwn: boolean;
  /** False on a world its owner has hidden: the link would open on a wall. */
  canShare: boolean;
  onLeaveRealm: () => void;
  onOpenGuide: () => void;
}

/**
 * The way out, and the whole of the chrome a phone gets besides the mark.
 *
 * Below laptop there is no rail and no bar. A world this size needs the screen
 * more than it needs anything written over it: the ranking, the stats, the name
 * and the counters are all things you read for a while, and the strip a phone
 * can spare makes them unreadable and the world smaller at the same time. So
 * what is left is the way out and the way to pass it on, standing in a corner
 * opposite the mark — the same plate, the same height, so the two read as one
 * line across the top of the world rather than as stray buttons.
 *
 * Share earns the second slot because a phone is where it is worth most: it is
 * the one control here that opens the native sheet rather than a clipboard.
 *
 * And the guide earns the third, because everything the rail was carrying that
 * explained the place carried it on a laptop only. A phone had the map and no
 * way at all to find out what it was, which is the wrong way round: a shared
 * link is how most people meet this page, and it mostly opens on a phone.
 */
export function WorldBack({
  user,
  isInRealm,
  worldName,
  isOwn,
  canShare,
  onLeaveRealm,
  onOpenGuide,
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
          aria-label="Back to world view"
          onClick={onLeaveRealm}
        />
      ) : (
        <Link href={`/${user.username || user.id}`} passHref>
          <Button {...props} tag="a" aria-label="Back to profile" />
        </Link>
      )}
      {canShare && (
        <WorldShare user={user} worldName={worldName} isOwn={isOwn} />
      )}
      <Button
        {...props}
        type="button"
        icon={<InfoIcon />}
        aria-label="How this world works"
        onClick={onOpenGuide}
      />
    </div>
  );
}
