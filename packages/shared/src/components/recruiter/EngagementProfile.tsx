import type { ReactElement } from 'react';
import React from 'react';

import { RadixAccordion } from '../accordion';
import { FlexCol, FlexRow } from '../utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Chip } from '../cards/common/PostTags';
import { MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';
import { formatMonthYearOnly } from '../../lib/dateFormat';
import { formatKeyword } from '../../lib/strings';
import type {
  TopReaderBadge,
  OpportunityPreviewSquad,
} from '../../graphql/opportunities';
import { Image, ImageType } from '../image/Image';

export interface EngagementProfileData {
  topTags: string[];
  recentlyRead: TopReaderBadge[];
  activeSquads: OpportunityPreviewSquad[];
  lastActive?: string;
  profileSummary?: string;
}

export interface EngagementProfileProps {
  engagement: EngagementProfileData;
}

export const EngagementProfile = ({
  engagement,
}: EngagementProfileProps): ReactElement => {
  const description = (
    <FlexRow className="gap-6">
      <Typography
        type={TypographyType.Callout}
        className="flex-1"
        color={TypographyColor.Secondary}
      >
        Something here
      </Typography>
      <FlexCol className="flex-1">
        <FlexRow className="my-2 items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Top tags
          </Typography>
          {engagement.topTags.length > 0 &&
            engagement.topTags.map((t) => (
              <Chip style={{ marginTop: 0, marginBottom: 0 }} key={t}>
                #{t}
              </Chip>
            ))}
        </FlexRow>
        <FlexRow className="my-2 flex-wrap items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Top reader badges
          </Typography>
          {engagement.recentlyRead.length > 0 &&
            engagement.recentlyRead.map((badge) => (
              <Chip
                key={badge.keyword.value}
                className="gap-1.5"
                style={{ marginTop: 0, marginBottom: 0 }}
              >
                <MedalBadgeIcon size={IconSize.XSmall} secondary />
                <span>{formatKeyword(badge.keyword.value)}</span>
                <span className="text-text-quaternary">·</span>
                <span className="text-text-quaternary">
                  {formatMonthYearOnly(badge.issuedAt)}
                </span>
              </Chip>
            ))}
        </FlexRow>
        <FlexRow className="my-2 items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Active squad
          </Typography>
          {engagement.activeSquads.length > 0 &&
            engagement.activeSquads.map((squad) => (
              <Chip
                key={squad.id}
                className="gap-1.5"
                style={{ marginTop: 0, marginBottom: 0 }}
              >
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
    </FlexRow>
  );
  return (
    <RadixAccordion
      className="rounded-b-16 bg-surface-invert"
      items={[{ title: 'Engagement profile', description }]}
    />
  );
};
