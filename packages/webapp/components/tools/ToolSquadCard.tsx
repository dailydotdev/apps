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
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Separator } from '@dailydotdev/shared/src/components/cards/common/common';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { ToolTopSquad } from '@dailydotdev/shared/src/graphql/user/userStack';

interface ToolSquadCardProps {
  squad: ToolTopSquad;
  onClick?: () => void;
}

export const ToolSquadCard = ({
  squad,
  onClick,
}: ToolSquadCardProps): ReactElement => (
  <Link href={`/squads/${squad.handle}`} passHref>
    <a
      href={`/squads/${squad.handle}`}
      onClick={onClick}
      className="flex h-full flex-col rounded-16 border border-border-subtlest-tertiary p-4 transition-colors hover:border-border-subtlest-secondary"
    >
      <Image
        src={squad.image}
        alt={`${squad.name} avatar`}
        type={ImageType.Squad}
        className="mb-3 size-16 rounded-full object-cover"
      />
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Body}
        bold
        truncate
      >
        {squad.name}
      </Typography>
      {squad.description && (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="multi-truncate line-clamp-2"
        >
          {squad.description}
        </Typography>
      )}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mt-auto pt-2"
        truncate
      >
        @{squad.handle} <Separator />
        <strong>{largeNumberFormat(squad.membersCount)} members</strong>
      </Typography>
    </a>
  </Link>
);
