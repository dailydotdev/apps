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
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { CardLink } from '../Card';
import { SquadJoinButton } from '../../squads/SquadJoinButton';
import { Origin } from '../../../lib/log';

interface SquadListProps {
  squad: Squad;
  isUserSquad?: boolean;
}

export const SquadList = ({
  squad,
  isUserSquad,
}: SquadListProps): ReactElement => {
  const router = useRouter();
  const { image, name, permalink } = squad;

  return (
    <div className="relative flex flex-row items-center gap-4">
      <CardLink href={permalink} rel="noopener" title={name} />
      <img
        className="size-14 rounded-full"
        src={image}
        alt={`${name} source`}
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
          {!isUserSquad && <Separator />}
          {!isUserSquad && (
            <strong data-testid="squad-members-count">
              {largeNumberFormat(squad.membersCount)}
            </strong>
          )}
        </Typography>
      </div>
      {isUserSquad ? (
        <ArrowIcon
          data-testid="squad-list-arrow-icon"
          className="ml-auto rotate-90 text-text-tertiary"
          size={IconSize.Small}
        />
      ) : (
        <SquadJoinButton
          className={{ button: '!btn-tertiaryFloat z-0' }}
          squad={squad}
          origin={Origin.SquadDirectory}
          onSuccess={() => router.push(permalink)}
          joinText="Join"
          data-testid="squad-action"
        />
      )}
    </div>
  );
};
