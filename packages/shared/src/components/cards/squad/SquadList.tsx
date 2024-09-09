import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { Squad } from '../../../graphql/sources';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { Separator } from '../common';
import { largeNumberFormat } from '../../../lib';
import { CardLink } from '../Card';
import { SquadJoinButton } from '../../squads/SquadJoinButton';
import { Origin } from '../../../lib/log';
import { Image, ImageType } from '../../image/Image';

interface SquadListProps {
  squad: Squad;
  shouldShowCount?: boolean;
}

export const SquadList = ({
  squad,
  shouldShowCount = true,
}: SquadListProps): ReactElement => {
  const router = useRouter();
  const { image, name, permalink } = squad;

  return (
    <div className="relative flex flex-row items-center gap-4">
      <CardLink href={permalink} rel="noopener" title={name} />
      <Image
        className="size-14 rounded-full"
        src={image}
        alt={`${name} source`}
        type={ImageType.Squad}
      />
      <div className="flex w-0 flex-grow flex-col">
        <Typography type={TypographyType.Callout} bold truncate>
          {squad.name}
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          truncate
        >
          @{squad.handle}
          {shouldShowCount && <Separator />}
          {shouldShowCount && (
            <strong data-testid="squad-members-count">
              {largeNumberFormat(squad.membersCount)} members
            </strong>
          )}
        </Typography>
      </div>
      <SquadJoinButton
        className={{ button: '!btn-tertiaryFloat z-0' }}
        squad={squad}
        origin={Origin.SquadDirectory}
        onSuccess={() => router.push(permalink)}
        copy={{ join: 'Join', view: 'View' }}
        data-testid="squad-action"
        showViewSquad
      />
    </div>
  );
};
