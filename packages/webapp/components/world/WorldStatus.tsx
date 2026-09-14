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
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { WorldStage, WorldStageIdentity } from './WorldBoot';
import type { WorldBootFailureKind } from './worldBootFailure';

interface WorldStatusProps {
  user: PublicProfile;
  failureKind?: WorldBootFailureKind;
}

/* One line, chosen by kind rather than appended to. A browser that cannot
   render 3D is not a world that loads if you wait a moment, and "try again"
   is the half a reader would act on, so for that kind it has to be replaced
   rather than qualified. */
const lineFor = (failureKind?: WorldBootFailureKind): string =>
  failureKind === 'unsupported'
    ? "This browser can't render 3D worlds."
    : 'This world could not be loaded right now. Try again in a moment.';

/**
 * Where a world does not stand at all: a query that never came back, a model the
 * renderer refused, or a browser with no renderer to refuse it. Same frame as
 * the boot screen, so arriving here is a sentence changing rather than a screen
 * being replaced.
 *
 * The reason is deliberately not on screen: it belongs to three.js or to the
 * network and is not written for a reader. What the kind changes is the one
 * thing a reader could act on, which is why there is no retry line on the
 * browser that will never render this at all.
 *
 * A reader with nothing read does NOT come here: an empty world is a world
 * that has not been built yet, and that is a thing to show rather than a thing
 * to report (`WorldInvite`).
 */
export function WorldStatus({
  user,
  failureKind,
}: WorldStatusProps): ReactElement {
  return (
    <WorldStage>
      <WorldStageIdentity user={user} />

      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-sm"
      >
        {lineFor(failureKind)}
      </Typography>

      {/* The panel is what normally carries the way out, and it is not rendered
          over a world that never stood up, so without this a reader who lands
          on an empty one has nowhere to go. */}
      <Link href={`/${user.username || user.id}`} passHref>
        <Button
          tag="a"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
        >
          Back to profile
        </Button>
      </Link>
    </WorldStage>
  );
}
