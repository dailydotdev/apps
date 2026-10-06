import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Code,
  H1,
  H2,
  Lead,
  List,
  P,
  SpecPage,
  StoryLinks,
  Table,
} from './kit';
import { titles } from './titles';

const pr = (repo: string, number: number) => (
  <a
    href={`https://github.com/dailydotdev/${repo}/pull/${number}`}
    target="_blank"
    rel="noreferrer"
    className="font-bold text-text-link underline"
  >
    {`${repo}#${number}`}
  </a>
);

const ReadMe = () => (
  <SpecPage>
    <H1>Verified Squads: parked features</H1>
    <Lead>
      Four paid features for Verified Company Squads, built and reviewed in
      October 2026, then parked until a customer asks for them. Everything here
      renders the real components; the specs say what each one does, what was
      decided and where its code is.
    </Lead>

    <H2>What is here</H2>
    <Table
      head={['Feature', 'Turned on by', 'Original PRs (closed)', 'Start with']}
      rows={[
        [
          'Welcome pop-up',
          <Code key="f">features.verified</Code>,
          <span key="p" className="flex flex-wrap gap-2">
            {pr('apps', 6804)} {pr('daily-api', 4361)}
          </span>,
          <StoryLinks
            key="s"
            links={[
              {
                label: 'Spec',
                title: titles.welcomeSpec,
                story: 'WelcomePopupSpec',
              },
            ]}
          />,
        ],
        [
          'Audience insights',
          <Code key="f">features.verified</Code>,
          <span key="p" className="flex flex-wrap gap-2">
            {pr('apps', 6804)} {pr('daily-api', 4361)}
          </span>,
          <StoryLinks
            key="s"
            links={[
              {
                label: 'Spec',
                title: titles.audienceSpec,
                story: 'AudienceInsightsSpec',
              },
            ]}
          />,
        ],
        [
          'Jobs',
          <Code key="f">features.jobs</Code>,
          <span key="p" className="flex flex-wrap gap-2">
            {pr('apps', 6803)} {pr('daily-api', 4360)}
          </span>,
          <StoryLinks
            key="s"
            links={[
              { label: 'Spec', title: titles.jobsSpec, story: 'JobsSpec' },
            ]}
          />,
        ],
        [
          'Member perks',
          <Code key="f">features.perks</Code>,
          <span key="p" className="flex flex-wrap gap-2">
            {pr('apps', 6803)} {pr('daily-api', 4360)}
          </span>,
          <StoryLinks
            key="s"
            links={[
              {
                label: 'Spec',
                title: titles.perksSpec,
                story: 'MemberPerksSpec',
              },
            ]}
          />,
        ],
      ]}
    />
    <P>
      Already live, for context: brand colour, header button, the verified seal
      and Featured (PR 1, apps#6795 and daily-api#4358).
    </P>

    <H2>Where the code is</H2>
    <Table
      head={['Repo', 'Branch', 'What it holds']}
      rows={[
        [
          'apps',
          <Code key="b">verified-squad-parked-features-dailydotdev</Code>,
          'All four features on top of main, and this Storybook',
        ],
        [
          'daily-api',
          <Code key="b">squad-parked-features-dailydotdev</Code>,
          'All four features on top of main, migrations 1792000000000 and 1792000000001',
        ],
      ]}
    />
    <P>
      The original four branches are kept too (
      <Code>squad-welcome-audience-dailydotdev</Code>,{' '}
      <Code>squad-jobs-perks-dailydotdev</Code> in both repos), one PR each.
    </P>

    <H2>When a customer asks: the checklist</H2>
    <List
      items={[
        'Read the feature’s Spec page here, and check the “Decided in review” notes before changing anything.',
        'Branch from main and bring over that feature’s files (each Spec lists them). Files shared by features: apps lib/log.ts, features/squads/lib/manage.tsx, lib/routes.ts, manage/SquadManagePage.tsx; daily-api src/graphql.ts, src/common/schema/squadFeatures.ts.',
        'Check the migration timestamp is still the newest in daily-api/src/migration and renumber if main has caught up (it already happened once).',
        'API first: merge and deploy the daily-api PR, then the apps PR. The apps side reads every new field through its own query, so the squad page never breaks while the API is a deploy behind.',
        'Sales ops switch the flag on for the customer’s squad (private route), next to verified.',
        'Jobs and perks: once the API is live everywhere, move the jobs/perks flags into the squad fragment and delete squadJobsPerksFeaturesQueryOptions (it is only a deploy bridge).',
        'Re-shoot the Responsive sheet for the feature and compare.',
      ]}
    />

    <H2>Tests that come with it</H2>
    <Table
      head={['Repo', 'Run']}
      rows={[
        [
          'daily-api',
          <Code key="a">
            __tests__/squadWelcomeAudience.ts, __tests__/squadJobsPerks.ts
          </Code>,
        ],
        [
          'apps',
          <Code key="b">
            features/squads/lib/(welcome|jobsPerks|links).spec.ts,
            SquadPageLayout.spec.tsx, SquadAudienceBreakdown.spec.tsx
          </Code>,
        ],
      ]}
    />

    <H2>Rules every parked feature follows</H2>
    <List
      items={[
        'Verified squads only, and each feature behind its own flag.',
        'New data never goes into the squad fragment: a separate query per feature.',
        'Manage sections show only to people with Edit permission (Analytics: ViewAnalytics).',
        'Links are checked like the API checks them: http or https, a real domain, 500 characters.',
        'The brand colour paints only the header wash and the header button; everything here uses daily.dev colours.',
        'Never a match score, never a list of members: aggregates and public information only.',
      ]}
    />

    <H2>How this Storybook works</H2>
    <List
      items={[
        'One CodeRabbit squad with every flag on, seen as a visitor, a member or an admin. Every query is seeded (fixtures.tsx), so nothing calls the API.',
        'Each feature has Spec, its screens (every state that matters), and Responsive: the main screens at phone 390px, tablet 834px and desktop 1280px side by side.',
        'Stories named “· Phone” and “· Tablet” open in that viewport.',
      ]}
    />
  </SpecPage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/Read me first',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const ReadMeFirst: StoryObj = {
  name: 'Read me first',
  render: () => <ReadMe />,
};
