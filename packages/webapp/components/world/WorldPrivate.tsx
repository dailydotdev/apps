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

/**
 * A world its owner has hidden.
 *
 * Nothing of it is drawn — not the map, not the timeline, not the crest. That is
 * the whole meaning of the switch: the crest is the piece built to travel, so
 * hiding a world is a real cost rather than a cosmetic toggle, and half-honouring
 * it here would be the same as not honouring it. The renderer is never handed a
 * model, so there is nothing standing behind this screen to be caught.
 *
 * It is stated rather than dressed up as an error. "Could not be loaded" would
 * be a lie about a decision somebody made deliberately.
 */
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
