import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
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

interface WorldPrivateProps {
  user: PublicProfile;
}

/** Renderer is never handed a model for a hidden world — nothing (map, timeline, crest) is drawn, so there's nothing behind this screen to leak. */
export function WorldPrivate({ user }: WorldPrivateProps): ReactElement {
  const { user: viewer } = useAuthContext();

  return (
    <WorldStage>
      <WorldStageIdentity user={user} />

      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-sm"
      >
        This world is private. {user.name} has kept it to themselves.
      </Typography>

      <div className="flex flex-wrap items-center justify-center gap-2">
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
        {!!viewer && (
          <Link href={`/world/${viewer.username || viewer.id}`} passHref>
            <Button
              tag="a"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
            >
              See your own world
            </Button>
          </Link>
        )}
      </div>
    </WorldStage>
  );
}
