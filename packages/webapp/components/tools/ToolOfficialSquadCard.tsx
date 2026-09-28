import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { SquadActionButton } from '@dailydotdev/shared/src/components/squads/SquadActionButton';
import { ButtonSize } from '@dailydotdev/shared/src/components/buttons/common';
import { VerifiedSquadBadge } from '@dailydotdev/shared/src/features/squads/components/VerifiedSquad';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import type { ToolOfficialSource } from '@dailydotdev/shared/src/graphql/tools';

interface ToolOfficialSquadCardProps {
  source: ToolOfficialSource;
  onClick: () => void;
}

export const ToolOfficialSquadCard = ({
  source,
  onClick,
}: ToolOfficialSquadCardProps): ReactElement => {
  const { squad } = useSquad({ handle: source.handle });

  return (
    <div className="relative flex w-full max-w-[30rem] items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3 text-left transition-colors hover:border-border-subtlest-secondary">
      <Link href={source.permalink} passHref>
        <a
          href={source.permalink}
          onClick={onClick}
          aria-label={`${source.name} official squad`}
          className="absolute inset-0 rounded-16"
        />
      </Link>
      <Image
        src={source.image}
        alt={`${source.name} avatar`}
        type={ImageType.Squad}
        className="size-12 shrink-0 rounded-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1">
          <Typography type={TypographyType.Callout} bold truncate>
            {source.name}
          </Typography>
          <VerifiedSquadBadge />
        </div>
        {source.description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Secondary}
            truncate
          >
            {source.description}
          </Typography>
        )}
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          truncate
        >
          Official squad <Separator />
          {largeNumberFormat(squad?.membersCount ?? source.membersCount)}{' '}
          members
        </Typography>
      </div>
      <div className="relative flex min-w-18 shrink-0 justify-end">
        {squad && !squad.currentMember && (
          <SquadActionButton
            squad={squad}
            origin={Origin.ToolPage}
            size={ButtonSize.Small}
            copy={{ join: 'Join' }}
            alwaysShow
          />
        )}
      </div>
    </div>
  );
};
