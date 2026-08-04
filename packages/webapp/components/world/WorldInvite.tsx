import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
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
import { WorldSignupCta } from './WorldSignupCta';

/**
 * Whose ground this is. Exported because the phone bar names the same state one
 * line under the identity, and two copies of the test is two chances to tell a
 * visitor that THEIR journey has just started.
 */
export const useIsOwnWorld = (user: PublicProfile): boolean => {
  const { user: viewer } = useAuthContext();

  return !!viewer && viewer.id === user.id;
};

/* The name is on screen above this everywhere it is used, so the line never
   repeats it. And it says what IS rather than what is missing: an empty world
   is the first day of one, not a world that failed to happen. */
export const unbuiltHeadline = (isOwn: boolean): string =>
  isOwn ? 'Your journey has just begun' : 'This journey has just begun';

interface WorldInviteProps {
  user: PublicProfile;
}

/**
 * The only thing on an unbuilt world that asks for anything, standing on the
 * world rather than in the rail.
 *
 * Both halves of that are deliberate. ONCE, because an invitation repeated on
 * six island labels and six rail rows stops reading as an invitation and starts
 * reading as an empty state apologising for itself — so the islands carry their
 * names, the rail lists the realms, and the ask is made here and nowhere else.
 * And ON THE WORLD, because the rail is where a reader goes to look something
 * up, and this is the one thing on the page nobody should have to look for.
 *
 * High on the world, over the sky the islands hang under: the camera is told to
 * leave that band clear (`PAD_UNBUILT_*`), so it never covers ground.
 */
export function WorldInvite({ user }: WorldInviteProps): ReactElement | null {
  const { user: viewer, isAuthReady } = useAuthContext();
  const isOwn = useIsOwnWorld(user);

  if (!isAuthReady) {
    return null;
  }

  return (
    <div
      data-world-overlay
      className="pointer-events-none absolute inset-x-3 top-32 z-2 flex justify-center laptop:inset-x-auto laptop:left-80 laptop:right-0 laptop:top-6"
    >
      <div className="pointer-events-auto flex w-full max-w-80 flex-col items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-3 text-center">
        <Typography type={TypographyType.Callout} bold>
          {unbuiltHeadline(isOwn)}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {isOwn
            ? 'Six realms of open ground. Every article you read raises a district on one of them.'
            : 'Six realms of open ground. Every article they read raises a district on one of them.'}
        </Typography>
        {/* A reader with no account is offered one where they stand. The compact
            card is a single button, which is what fits on a label. */}
        {!viewer ? (
          <WorldSignupCta compact />
        ) : (
          <Link
            href={isOwn ? '/' : `/world/${viewer.username || viewer.id}`}
            passHref
          >
            <Button
              tag="a"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              className="w-full"
            >
              {isOwn ? 'Read to build your world' : 'See your own world'}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
