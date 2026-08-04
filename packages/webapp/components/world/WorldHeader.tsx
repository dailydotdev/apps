import type { ReactElement } from 'react';
import React, { memo } from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { WorldImmersiveToggle, WorldMark } from './WorldMark';
import { WorldSignupCta } from './WorldSignupCta';
import { WorldViewerAction } from './WorldViewerAction';
import type { WorldState } from './worldState';
import { worldCounts } from './worldState';

const WorldHeaderActions = memo(function WorldHeaderActions({
  user,
  unbuilt,
}: {
  user: PublicProfile;
  unbuilt?: boolean;
}): ReactElement {
  return (
    <>
      <WorldViewerAction user={user} block />
      {/* Nothing here on unbuilt ground: the one ask stands on the world. */}
      {!unbuilt && <WorldSignupCta compact />}
    </>
  );
});

interface WorldHeaderProps {
  user: PublicProfile;
  state: WorldState;
  /** Six realms of bare ground: every number is a zero and nothing is standing. */
  unbuilt?: boolean;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  onLeaveRealm: () => void;
}

/**
 * Below laptop the rail is gone — a world this size needs the screen more than
 * it needs a sidebar — so identity, the counters and the way out collapse into
 * one bar. The ranking does not come with them: it is a thing you read, and
 * there is nowhere to read it that is not on top of the map.
 */
export function WorldHeader({
  user,
  state,
  unbuilt,
  isImmersive,
  onToggleImmersive,
  onLeaveRealm,
}: WorldHeaderProps): ReactElement {
  const backIcon = <ArrowIcon className="-rotate-90" />;
  const backProps = {
    variant: ButtonVariant.Tertiary,
    size: ButtonSize.Small,
    icon: backIcon,
    className: 'flex-none',
  };

  return (
    <header
      data-world-overlay
      className="pointer-events-auto absolute inset-x-3 top-3 z-1 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3"
    >
      {/* Two rows, because one does not fit: the way back, the identity, the
          way out of the chrome and the mark already spend most of a phone, and
          a Follow squeezed in beside them leaves the name a few characters. */}
      <div className="flex items-center gap-3">
        {state.open ? (
          <Button
            {...backProps}
            type="button"
            aria-label="Back to the world"
            onClick={onLeaveRealm}
          />
        ) : (
          <Link href={`/${user.username || user.id}`} passHref>
            <Button {...backProps} tag="a" aria-label="Back to profile" />
          </Link>
        )}
        <ProfilePicture
          user={user}
          size={ProfileImageSize.Medium}
          nativeLazyLoading
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Typography type={TypographyType.Footnote} bold truncate>
            {state.open ? state.open.name : user.name}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            truncate
          >
            {/* Not the invitation: that stands on the world, once. This is the
                counters line saying what there is to count. */}
            {unbuilt ? 'Open ground' : worldCounts(state)}
          </Typography>
        </div>
        <WorldImmersiveToggle
          isImmersive={isImmersive}
          onToggleImmersive={onToggleImmersive}
        />
        <WorldMark />
      </div>
      {/* Behind a memo boundary, like the rail's header block: neither reads the
          day, and the engine pushes a new state object every frame of a replay. */}
      <WorldHeaderActions user={user} unbuilt={unbuilt} />
    </header>
  );
}
