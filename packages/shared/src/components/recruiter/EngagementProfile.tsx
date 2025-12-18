import type { ReactElement } from 'react';
import React from 'react';

import { RadixAccordion } from '../accordion';
import { FlexRow } from '../utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import type { Squad } from '../../graphql/sources';
import type { TopReader } from '../badges/TopReaderBadge';
import { UserEngagementSections } from './UserEngagementSections';

export interface EngagementProfileData {
  topTags: string[];
  recentlyRead: TopReader[];
  activeSquads: Squad[];
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
        {engagement.profileSummary}
      </Typography>
      <UserEngagementSections
        topTags={engagement.topTags}
        recentlyRead={engagement.recentlyRead}
        activeSquads={engagement.activeSquads}
        className="flex-1"
      />
    </FlexRow>
  );
  return (
    <RadixAccordion
      className="rounded-b-16 bg-surface-invert"
      items={[{ title: 'Engagement profile', description }]}
    />
  );
};
