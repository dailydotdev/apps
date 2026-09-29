import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { DataTile } from '../../../../components/DataTile';
import { IconSize } from '../../../../components/Icon';
import {
  BookmarkIcon,
  ClickIcon,
  DiscussIcon,
  EyeIcon,
  MedalBadgeIcon,
  MergeIcon,
  ShareIcon,
  UpvoteIcon,
} from '../../../../components/icons';
import type { AnalyticsNumberList } from '../../../../components/analytics/common';
import { AnalyticsNumbersList } from '../../../../components/analytics/AnalyticsNumbersList';
import { CombinedImpressionsChart } from '../../../../components/analytics/CombinedImpressionsChart';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { useSquadPageContext } from '../../SquadPageContext';
import {
  SQUAD_ANALYTICS_HISTORY_DAYS,
  useSquadAnalytics,
} from '../../hooks/useSquadAnalytics';
import { SquadManageSection } from '../../lib/routes';
import { SquadManageSectionPanel } from './SquadManageLayout';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <Typography type={TypographyType.Body} bold tag={TypographyTag.H2}>
      {title}
    </Typography>
    {children}
  </section>
);

export const SquadManageAnalytics = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { analytics, impressions, hasImpressions } = useSquadAnalytics(squad);
  const engagement: AnalyticsNumberList = [
    { icon: <UpvoteIcon />, label: 'Upvotes', value: analytics?.upvotes ?? 0 },
    {
      icon: <MergeIcon />,
      label: 'Upvotes ratio',
      value: `${analytics?.upvotesRatio ?? 0}%`,
      tooltip: 'The percentage of upvotes out of total votes.',
    },
    {
      icon: <DiscussIcon />,
      label: 'Comments',
      value: analytics?.comments ?? 0,
    },
    {
      icon: <BookmarkIcon />,
      label: 'Bookmarks',
      value: analytics?.bookmarks ?? 0,
    },
    {
      icon: <MedalBadgeIcon secondary />,
      label: 'Awards',
      value: analytics?.awards ?? 0,
    },
    { icon: <ShareIcon />, label: 'Shares', value: analytics?.shares ?? 0 },
    { icon: <ClickIcon />, label: 'Clicks', value: analytics?.clicks ?? 0 },
  ];

  return (
    <SquadManageSectionPanel section={SquadManageSection.Analytics}>
      <div className="flex flex-col gap-6 px-4 py-6 tablet:px-6">
        <Section title="Discovery">
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            <DataTile
              label="Lifetime impressions"
              value={analytics?.impressions ?? 0}
              info="The total lifetime number of times posts from this squad were shown to developers across the platform"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
            <DataTile
              label="Lifetime reach"
              value={analytics?.reach ?? 0}
              info="The estimated lifetime number of unique developers who viewed posts from this squad"
              icon={
                <EyeIcon size={IconSize.Small} className="text-text-tertiary" />
              }
            />
          </div>
        </Section>
        <HorizontalSeparator />
        <Section
          title={`Impressions over time (last ${SQUAD_ANALYTICS_HISTORY_DAYS} days)`}
        >
          {hasImpressions ? (
            <CombinedImpressionsChart data={impressions} />
          ) : (
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
            >
              {`No impressions data in the last ${SQUAD_ANALYTICS_HISTORY_DAYS} days.`}
            </Typography>
          )}
        </Section>
        <HorizontalSeparator />
        <Section title="Engagement">
          <AnalyticsNumbersList data={engagement} />
        </Section>
      </div>
    </SquadManageSectionPanel>
  );
};
