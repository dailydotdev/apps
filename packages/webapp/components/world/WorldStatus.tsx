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

interface WorldStatusProps {
  user: PublicProfile;
  /** A world that could not be built, or a query that did not come back. */
  message: string;
}

/**
 * Where a world does not stand at all: a query that never came back, or a model
 * the renderer refused. Same frame as the boot screen, so arriving here is a
 * sentence changing rather than a screen being replaced.
 *
 * A reader with nothing read does NOT come here — an empty world is a world
 * that has not been built yet, and that is a thing to show rather than a thing
 * to report (`WorldInvite`).
 */
export function WorldStatus({ user, message }: WorldStatusProps): ReactElement {
  return (
    <WorldStage>
      <WorldStageIdentity user={user} />

      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-sm"
      >
        {message}
      </Typography>

      {/* The panel is what normally carries the way out, and it is not rendered
          over a world that never stood up — so without this a reader who lands
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
