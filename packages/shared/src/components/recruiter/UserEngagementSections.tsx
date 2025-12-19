import type { ReactElement } from 'react';
import React from 'react';

import { FlexCol, FlexRow } from '../utilities';
import { Typography, TypographyType } from '../typography/Typography';
import { Chip } from '../cards/common/PostTags';
import { MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';
import { formatMonthYearOnly } from '../../lib/dateFormat';
import { formatKeyword } from '../../lib/strings';
import { Image, ImageType } from '../image/Image';
import type { Squad } from '../../graphql/sources';
import type { TopReader } from '../badges/TopReaderBadge';

export interface UserEngagementSectionsProps {
  topTags?: string[];
  recentlyRead?: TopReader[];
  activeSquads?: Squad[];
  className?: string;
}

export const UserEngagementSections = ({
  topTags = [],
  recentlyRead = [],
  activeSquads = [],
  className,
}: UserEngagementSectionsProps): ReactElement => {
  return (
    <FlexCol className={className}>
      <FlexRow className="my-2 items-center gap-2">
        <Typography type={TypographyType.Footnote} bold>
          Top tags
        </Typography>
        {topTags.length > 0 &&
          topTags.map((t) => (
            <Chip className="!my-0" key={t}>
              #{t}
            </Chip>
          ))}
      </FlexRow>
      <FlexRow className="my-2 flex-wrap items-center gap-2">
        <Typography type={TypographyType.Footnote} bold>
          Top reader badges
        </Typography>
        {recentlyRead.length > 0 &&
          recentlyRead.map((badge) => (
            <Chip key={badge.keyword.value} className="!my-0 gap-1.5">
              <MedalBadgeIcon size={IconSize.XSmall} secondary />
              <span>{formatKeyword(badge.keyword.value)}</span>
              <span className="text-text-quaternary">·</span>
              <span className="text-text-quaternary">
                {formatMonthYearOnly(new Date(badge.issuedAt))}
              </span>
            </Chip>
          ))}
      </FlexRow>
      <FlexRow className="my-2 items-center gap-2">
        <Typography type={TypographyType.Footnote} bold>
          Active squad
        </Typography>
        {activeSquads.length > 0 &&
          activeSquads.map((squad) => (
            <Chip key={squad.id} className="!my-0 gap-1.5">
              <Image
                src={squad.image}
                alt={squad.name}
                type={ImageType.Squad}
                className="h-4 w-4 rounded-full object-cover"
                loading="lazy"
              />
              <span>{squad.name}</span>
            </Chip>
          ))}
      </FlexRow>
    </FlexCol>
  );
};
