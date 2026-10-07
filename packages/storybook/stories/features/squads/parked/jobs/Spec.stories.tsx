import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SQUAD_JOBS_MAX } from '../app/features/squads/components/manage/SquadManageJobsPerks';
import {
  Code,
  Decision,
  H1,
  H2,
  H3,
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
    <H1>Jobs</H1>
    <Lead>
      A public jobs board on a verified squad, like the jobs page of a company
      on LinkedIn: a Jobs tab anyone can browse, a page per role, and Apply on
      the company’s own site.
    </Lead>
    <StoryLinks
      links={[
        { label: 'Jobs tab', title: titles.jobsTab, story: 'Board' },
        { label: 'Role page', title: titles.jobsRole, story: 'Full' },
        { label: 'Manage › Jobs', title: titles.jobsManage, story: 'Roles' },
        { label: 'Add role', title: titles.jobsManage, story: 'AddRole' },
        {
          label: 'Responsive sheet',
          title: titles.jobsResponsive,
          story: 'AllWidths',
        },
      ]}
    />

    <H2>Who sees what</H2>
    <Table
      head={['Viewer', 'Jobs tab', 'Role page']}
      rows={[
        [
          'Anyone, signed in or not',
          'Shown when there is at least one role',
          'Full details and Apply',
        ],
        [
          'Editors (Edit permission)',
          'Shown even with no roles, as a nudge to add one',
          'Same',
        ],
      ]}
    />
    <P>
      Gated by <Code>features.jobs</Code>, which sales ops switch on per squad
      through the private route, next to <Code>verified</Code>. With the flag
      off the tab, the pages and Manage › Jobs are all gone.
    </P>

    <H2>On the squad page</H2>
    <List
      items={[
        'Tabs read Posts · Jobs · Perks, with no counts. From laptop (1020px) they sit over the feed; below laptop they join the Posts and About tabs.',
        <>
          The tab lives in the address (<Code>?tab=jobs</Code>) so Back from a
          role returns to it. Any other query (search, a modal) is kept.
        </>,
        'Heading “Open roles at <squad>”, then one row per role: logo, title, “<squad> · <location> · <type>”, salary if set, and when it was posted.',
        'Rows keep the order set in Manage. The newest role is added first.',
      ]}
    />

    <H2>The role page</H2>
    <List
      items={[
        <>
          <Code>/squads/&lt;handle&gt;/jobs/&lt;id&gt;</Code>, a squad sub-page
          like Products or Members: back arrow and title on top, details in the
          main column, the squad’s right column kept. The title is not repeated
          in the body.
        </>,
        'Summary: logo, squad name and seal, team and posted date, the about text, fact chips (location and type, salary), then Apply.',
        'Apply opens the company’s link in a new tab (rel noopener nofollow) and reads “Apply on <host>”.',
        '“What you’ll do” (the points) and “More roles at <squad>” (up to 3) follow when there are any.',
        'A removed role, or another squad’s role in this address, says “This role is no longer open.” A failed request offers Try again.',
      ]}
    />

    <H2>Manage › Jobs</H2>
    <P>Built exactly like Manage › Products, so admins already know it.</P>
    <List
      items={[
        `The list: Add in the header (gone at ${SQUAD_JOBS_MAX} roles), rows with logo, title, location and type, team and salary, up and down arrows to reorder, and a pencil to edit.`,
        'The form is its own page (/manage/jobs/new or /manage/jobs/<id>): back arrow, Save in the header, Remove role at the bottom when editing.',
      ]}
    />
    <Table
      head={['Field', 'Required', 'Limit', 'Notes']}
      rows={[
        ['Role title', 'Yes', '100', ''],
        ['Team', '', '40', 'Like Engineering or Design'],
        ['Location', 'Yes', '80', 'A city, or the region for remote roles'],
        ['Workplace', '', '', 'On-site (default), Hybrid, Remote'],
        [
          'Employment type',
          '',
          '',
          'Full-time (default), Part-time, Contract, Internship',
        ],
        ['Salary', '', '40', 'Free text, like $150K–$180K; hidden when empty'],
        ['About the role', '', '600', ''],
        [
          'What you’ll do',
          '',
          '5 points of 160',
          'Link-style “Add a point” lines',
        ],
        [
          'Link',
          'Yes',
          '500',
          'http or https with a real domain, same as the API',
        ],
      ]}
    />
    <H3>Fix when building</H3>
    <P>
      Saving with an empty title or location does nothing visible: the shared
      TextField never marks an empty field as invalid. Show a message under the
      field (or a toast) for empty required fields.
    </P>

    <H2>Decided in review</H2>
    <Decision>
      A public board, not daily.dev’s candidate matching: no match scores, no
      “for you”.
    </Decision>
    <Decision>
      No “See jobs” button in the header: the tab is the way in.
    </Decision>
    <Decision>No counts on the tabs and no filter chips on the list.</Decision>
    <Decision>
      “You’d work with” was dropped: the Team widget is right beside it.
    </Decision>

    <H2>Later, not built</H2>
    <List
      items={[
        'Job alerts (follow a squad’s roles): needs a notification type, a worker and an infra topic.',
        'Save a role.',
      ]}
    />

    <H2>API</H2>
    <Table
      head={['', 'Contract', 'Who']}
      rows={[
        [
          <Code key="1">squadJobs(sourceId)</Code>,
          'The roles in order; empty while the flag is off',
          'Anyone who can view the squad (replica)',
        ],
        [<Code key="2">squadJob(id)</Code>, 'One role, with sourceId', 'Same'],
        [
          <Code key="3">addSquadJob(sourceId, input)</Code>,
          'Adds it first',
          'Edit permission + jobs flag',
        ],
        [
          <Code key="4">updateSquadJob(id, input)</Code>,
          'Partial: only the fields sent change',
          'Same',
        ],
        [<Code key="5">removeSquadJob(id)</Code>, '', 'Same'],
        [
          <Code key="6">reorderSquadJobs(sourceId, ids)</Code>,
          'Returns the new order',
          'Same',
        ],
      ]}
    />
    <P>
      Table <Code>squad_job</Code> (sourceId, position, the fields above,
      createdAt). Add sets the defaults (on-site, full-time, no points); update
      never re-sends them.
    </P>

    <H2>Analytics events</H2>
    <Table
      head={['Event', 'When']}
      rows={[
        [
          <Code key="a">click squad job</Code>,
          'A row on the tab or under More roles',
        ],
        [<Code key="b">click squad job apply</Code>, 'Apply on the role page'],
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
              <Code key="1">graphql/squadJobsPerks.ts</Code>,
              <Code key="2">
                features/squads/components/jobs/SquadJobs.tsx, SquadDetail.tsx
              </Code>,
              <Code key="3">
                features/squads/hooks/useSquadJobs.ts, useSquadPageTabs.tsx
              </Code>,
              <Code key="4">
                features/squads/components/SquadPageLayout.tsx (tabs)
              </Code>,
              <Code key="5">
                features/squads/components/manage/SquadManageJobsPerks.tsx
              </Code>,
              <Code key="6">
                features/squads/lib/jobsPerks.ts, routes.ts, manage.tsx
              </Code>,
              <Code key="7">
                webapp/pages/squads/[handle]/jobs/[jobId].tsx, manage/jobs/*
              </Code>,
            ]}
          />,
        ],
        [
          'daily-api',
          <List
            key="api"
            items={[
              <Code key="1">src/entity/SquadJob.ts</Code>,
              <Code key="2">
                src/common/squadJobsPerks.ts, src/schema/squadJobsPerks.ts
              </Code>,
              <Code key="3">
                src/common/schema/squadFeatures.ts (job schemas, jobs flag)
              </Code>,
              <Code key="4">
                src/migration/1792000000000-SquadJobsPerks.ts
              </Code>,
              <Code key="5">__tests__/squadJobsPerks.ts</Code>,
            ]}
          />,
        ],
      ]}
    />
  </SpecPage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/3. Jobs/Spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const JobsSpec: StoryObj = {
  name: 'Spec',
  render: () => <Spec />,
};
