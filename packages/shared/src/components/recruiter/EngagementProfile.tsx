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

export interface EngagementProfileData {
  topTags: string[];
  recentlyRead: string[];
  activeSquads: string[];
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
        <FlexRow className="items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Top tags
          </Typography>
          {engagement.topTags.length > 0 &&
            engagement.topTags.map((t) => <Chip key={t}>#{t}</Chip>)}
        </FlexRow>
        <FlexRow className="items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Recently read
          </Typography>
          {engagement.recentlyRead.length > 0 &&
            engagement.recentlyRead.map((t) => <Chip key={t}>#{t}</Chip>)}
        </FlexRow>
        <FlexRow className="items-center gap-2">
          <Typography type={TypographyType.Footnote} bold>
            Active squad
          </Typography>
          {engagement.activeSquads.length > 0 &&
            engagement.activeSquads.map((t) => <Chip key={t}>#{t}</Chip>)}
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
