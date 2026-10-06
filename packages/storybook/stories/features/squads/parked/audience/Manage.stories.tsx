import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SquadAudience as SquadAudienceData } from '@dailydotdev/shared/src/graphql/squadWelcomeAudience';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageAnalytics } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageAnalytics';
import { SquadAudience } from '@dailydotdev/shared/src/features/squads/components/analytics/SquadAudience';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { audience, Viewer, withApp, withSeed } from '../fixtures';
import { phone, tablet } from '../kit';

// The Audience section of Manage › Analytics, below Engagement. "Section"
// stories show it alone; "Page" stories show it in the real analytics page.

const AnalyticsPage = () => (
  <SquadManageLayout section={SquadManageSection.Analytics}>
    <SquadManageAnalytics />
  </SquadManageLayout>
);

const AudienceSection = ({ data }: { data: SquadAudienceData }) => (
  <div className="mx-auto max-w-[56rem] p-4 tablet:p-6">
    <SquadAudience audience={data} />
  </div>
);

const small: SquadAudienceData = {
  members: 64,
  newMembers: 12,
  isEnough: false,
  seniority: [],
  stack: [],
  companies: [],
};

const meta: Meta = {
  title: 'Verified Squads (parked)/2. Audience insights/Manage analytics',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** The full analytics page; Audience is the last section. */
export const Page: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => <AnalyticsPage />,
};

/** The section alone: two tiles and three breakdowns. */
export const Section: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => <AudienceSection data={audience} />,
};

/** Under 100 members: only the tiles, and why the rest is held back. */
export const SmallSquad: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => <AudienceSection data={small} />,
};

/** Enough members, but no company has 10 of its people here yet. */
export const NoCompanyYet: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => <AudienceSection data={{ ...audience, companies: [] }} />,
};

/** One row per list: a single bar fills its track (scaled to the biggest). */
export const OneRowEach: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => (
    <AudienceSection
      data={{
        ...audience,
        seniority: audience.seniority.slice(0, 1),
        stack: audience.stack.slice(0, 1),
        companies: audience.companies.slice(0, 1),
      }}
    />
  ),
};

/** The API's maximum, five rows, with long names. */
export const FiveRowsLongNames: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  render: () => (
    <AudienceSection
      data={{
        ...audience,
        seniority: [
          ...audience.seniority,
          { label: 'LESS_THAN_1_YEAR', share: 4 },
        ],
        stack: [
          { label: 'TypeScript', share: 46 },
          { label: 'Amazon Web Services (AWS)', share: 31 },
          { label: 'Kubernetes', share: 19 },
          { label: 'Google Cloud Platform', share: 12 },
          { label: 'PostgreSQL', share: 9 },
        ],
        companies: [
          { label: 'Shopify', share: 6 },
          { label: 'Microsoft', share: 5 },
          { label: 'JPMorgan Chase & Co.', share: 4 },
          { label: 'Atlassian', share: 3 },
          { label: 'Deutsche Telekom IT Solutions', share: 1 },
        ],
      }}
    />
  ),
};

export const SectionTablet: Story = {
  ...Section,
  name: 'Section · Tablet',
  globals: tablet,
};

export const SectionPhone: Story = {
  ...Section,
  name: 'Section · Phone',
  globals: phone,
};
