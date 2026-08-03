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
  message?: string;
}

/**
 * Where a world does not stand: too little read for one, or a query that never
 * came back. Same frame as the boot screen, so arriving here is a sentence
 * changing rather than a screen being replaced.
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
        {message ??
          `${user.name} has not read enough yet for a world to stand on. Come back once there is some ground under it.`}
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
