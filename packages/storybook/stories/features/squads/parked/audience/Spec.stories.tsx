import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SQUAD_AUDIENCE_MIN_COMPANY,
  SQUAD_AUDIENCE_MIN_MEMBERS,
} from '../app/graphql/squadWelcomeAudience';
import {
  Code,
  Decision,
  H1,
  H2,
  Lead,
  List,
  P,
  SpecPage,
  StoryLinks,
  Table,
} from '../kit';
import { titles } from '../titles';

const Spec = () => (
  <SpecPage>
    <H1>Audience insights</H1>
    <Lead>
      Who a verified squad’s members are, in aggregate: how senior they are,
      what they build with and where they work. A new Audience section at the
      end of Manage › Analytics.
    </Lead>
    <StoryLinks
      links={[
        {
          label: 'In the analytics page',
          title: titles.audienceManage,
          story: 'Page',
        },
        { label: 'Section', title: titles.audienceManage, story: 'Section' },
        {
          label: 'Small squad',
          title: titles.audienceManage,
          story: 'SmallSquad',
        },
        {
          label: 'Responsive sheet',
          title: titles.audienceResponsive,
          story: 'AllWidths',
        },
      ]}
    />

    <H2>Who sees it</H2>
    <List
      items={[
        'People who can see the squad’s analytics (ViewAnalytics permission), on a verified squad only.',
        'Manage › Analytics, after Engagement. The section is left out entirely while its query has no data, so the page works before the API ships.',
      ]}
    />

    <H2>What it shows</H2>
    <Table
      head={['Block', 'From', 'Notes']}
      rows={[
        ['Members', 'Squad membership', 'Everyone in the squad today'],
        ['New members', 'Membership date', 'Joined in the last 30 days'],
        [
          'Seniority',
          'Experience level on the profile',
          'Labels from getRecruiterExperienceLevelLabel',
        ],
        ['Their stack', 'The profile stack (user_stack)', ''],
        ['Companies they work at', 'Verified work email (user_company)', ''],
      ]}
    />
    <P>
      Each breakdown is up to 5 rows, ordered by share. A share is the percent
      of all members, so rows don’t add up to 100.
    </P>

    <H2>Privacy floor</H2>
    <List
      items={[
        `Under ${SQUAD_AUDIENCE_MIN_MEMBERS} members, only the two tiles show; the breakdowns say why they are held back.`,
        `A row needs ${SQUAD_AUDIENCE_MIN_COMPANY} or more members behind it, in every breakdown. That keeps a company from being shown for one or two people.`,
        'Rows that round to 0% are dropped.',
        'Never names, never a list of members: aggregates only.',
      ]}
    />

    <H2>Design</H2>
    <Table
      head={['Part', 'Spec']}
      rows={[
        [
          'Row',
          'Label (Callout) and the bold share on one line, the bar under it',
        ],
        [
          'Bar',
          <>
            <Code>h-2 rounded-max</Code>, track <Code>bg-surface-float</Code>,
            fill <Code>bg-accent-cabbage-default</Code>
          </>,
        ],
        [
          'Scale',
          'Relative to the biggest row in the list, so the top row fills its track',
        ],
        [
          'Layout',
          'Tiles 1 column on phone, 2 from tablet. Breakdowns stack, 3 columns from laptop',
        ],
      ]}
    />
    <Decision>
      Label-and-share row with the bar underneath, just rounded. A poll-results
      style (bar behind the text) was tried and rejected.
    </Decision>
    <Decision>
      Use <Code>rounded-max</Code>, not <Code>rounded-full</Code>: in this
      Tailwind config <Code>rounded-full</Code> is 100%, which draws an ellipse
      on a wide bar. The shared ProgressBar meter renders lens-shaped at this
      height, so the bar is two plain spans.
    </Decision>
    <Decision>No region breakdown.</Decision>

    <H2>Not included, on purpose</H2>
    <List
      items={[
        'Page visitors and header-button clicks: the API cannot query them today.',
      ]}
    />

    <H2>API</H2>
    <Table
      head={['', 'Contract', 'Who']}
      rows={[
        [
          <Code key="q">squadAudience(sourceId)</Code>,
          'members, newMembers, isEnough, seniority, stack, companies: [{ label, share }]',
          'ViewAnalytics on a verified squad; read from the replica',
        ],
      ]}
    />

    <H2>Where the code is</H2>
    <Table
      head={['Repo', 'Files']}
      rows={[
        [
          'apps',
          <List
            key="apps"
            items={[
              <Code key="1">
                graphql/squadWelcomeAudience.ts (squadAudienceQueryOptions)
              </Code>,
              <Code key="2">
                features/squads/components/analytics/SquadAudience.tsx
              </Code>,
              <Code key="3">
                features/squads/components/analytics/SquadAudienceBreakdown.tsx
                (+ spec)
              </Code>,
              <Code key="4">
                features/squads/components/manage/SquadManageAnalytics.tsx
              </Code>,
            ]}
          />,
        ],
        [
          'daily-api',
          <List
            key="api"
            items={[
              <Code key="1">
                src/common/squadWelcomeAudience.ts (getSquadAudience)
              </Code>,
              <Code key="2">src/schema/squadWelcomeAudience.ts</Code>,
              <Code key="3">__tests__/squadWelcomeAudience.ts</Code>,
            ]}
          />,
        ],
      ]}
    />
  </SpecPage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/2. Audience insights/Spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const AudienceInsightsSpec: StoryObj = {
  name: 'Spec',
  render: () => <Spec />,
};
