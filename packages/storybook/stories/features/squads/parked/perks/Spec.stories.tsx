import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SQUAD_PERKS_MAX } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageJobsPerks';
import { SQUAD_PERK_CODES_BATCH } from '@dailydotdev/shared/src/features/squads/lib/jobsPerks';
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
    <H1>Member perks</H1>
    <Lead>
      Deals a verified squad gives its members: a Perks tab of shop-style cards
      anyone can see, and a page per perk where members get their code. A reason
      to join, and something to come back for.
    </Lead>
    <StoryLinks
      links={[
        { label: 'Perks tab', title: titles.perksTab, story: 'Member' },
        { label: 'Perk page', title: titles.perksPage, story: 'SharedCode' },
        { label: 'Visitor', title: titles.perksPage, story: 'Visitor' },
        {
          label: 'Manage › Member perks',
          title: titles.perksManage,
          story: 'Perks',
        },
        {
          label: 'Responsive sheet',
          title: titles.perksResponsive,
          story: 'AllWidths',
        },
      ]}
    />

    <H2>Who sees what</H2>
    <Table
      head={['Viewer', 'Perks tab', 'Perk page']}
      rows={[
        [
          'Visitor or signed out',
          'Cards with a lock; “Join the squad to unlock them”',
          'Everything but the code; “Join <squad> to unlock”',
        ],
        [
          'Member',
          'Cards with a check',
          'The code with Copy, or Get your code; Redeem',
        ],
        [
          'Editor',
          'Also sees ended perks; the tab shows with no perks, as a nudge',
          'Same as a member',
        ],
      ]}
    />
    <P>
      Gated by <Code>features.perks</Code>, switched on by sales ops through the
      private route. The code never leaves the API for a visitor.
    </P>

    <H2>Two kinds of code</H2>
    <Table
      head={['', 'Shared code', 'Unique codes']}
      rows={[
        [
          'What it is',
          'One code for every member',
          'One code per member, from a list the company uploads',
        ],
        [
          'Member sees',
          'The code at once, with Copy',
          '“Get your code”, then their own code',
        ],
        [
          'A claim is',
          'The first Copy (counted once)',
          'Get your code: takes the next free code',
        ],
        [
          'Runs out when',
          'The end date, or the claim limit',
          'No codes left, the end date or the claim limit',
        ],
      ]}
    />
    <P>
      A taken unique code is the member’s for good: it shows every time they
      come back. Two members claiming at once never get the same code (the perk
      row is locked, the next free code is taken with SKIP LOCKED).
    </P>

    <H2>On the squad page</H2>
    <List
      items={[
        'Posts · Jobs · Perks, no counts. Cards are 1 column on phone and 2 from tablet.',
        'A card: the product logo on a surface band, the value chip top left (like “3 months free”), lock or check top right, title, two lines of description, then “Ends <date> · <n> claimed”.',
        'Ended perks drop off the tab (editors still see them in Manage).',
      ]}
    />

    <H2>The perk page</H2>
    <List
      items={[
        <>
          <Code>/squads/&lt;handle&gt;/perks/&lt;id&gt;</Code>, a squad sub-page
          like Products: back arrow and title, the squad’s right column kept.
        </>,
        'Summary: logo, squad name and seal, “Member perk · <product>”, the description, fact chips (value, end date, claimed), then the actions.',
        'Actions: Join to unlock (visitor); the code with Copy, or Get your code (member); Redeem on <host> when there is a link.',
        'Sold out or ended: “Every code has been claimed, or the perk has ended.”',
        '“How to redeem” (numbered steps), “Fine print” (terms, plus “Offered by <squad>, not daily.dev” and the end date), “More perks from <squad>”.',
        'End dates are the end of the chosen day in UTC, so everyone sees the same date.',
      ]}
    />

    <H2>Manage › Member perks</H2>
    <List
      items={[
        `The list, like Manage › Products: Add in the header (gone at ${SQUAD_PERKS_MAX} perks), reorder arrows, edit pencil, and “<n> codes left” on unique-code perks.`,
        `Unique codes: paste one per line, or upload a CSV. Repeats and blanks are dropped; codes go up in batches of ${SQUAD_PERK_CODES_BATCH.toLocaleString(
          'en-US',
        )}. If adding the perk works but the codes fail, the editor lands on the perk’s edit page to retry.`,
      ]}
    />
    <Table
      head={['Field', 'Required', 'Limit', 'Notes']}
      rows={[
        ['Perk title', 'Yes', '80', ''],
        ['What members get', 'Yes', '30', 'The card chip, like 3 months free'],
        [
          'Product',
          '',
          '',
          'One of the squad’s products, for its logo and name',
        ],
        ['Description', '', '300', ''],
        ['Code', 'Yes for shared', '100', 'Shared (default) or unique'],
        ['Redeem link', '', '500', 'http or https with a real domain'],
        ['Ends on', '', '', 'Drops off the Perks tab after this day'],
        ['Claim limit', '', '', 'When reached, the perk shows as claimed'],
        ['How to redeem', '', '4 steps of 200', ''],
        ['Fine print', '', '5 lines of 200', ''],
      ]}
    />

    <H2>Decided in review</H2>
    <Decision>
      Perks get their own tab beside Jobs, with cards like a shop (Discord’s
      Server Shop was the reference), not a sidebar widget.
    </Decision>
    <Decision>“Members only” instead of blurred codes for visitors.</Decision>
    <Decision>
      Each perk opens a squad sub-page like Products, not a centred page like
      /tools.
    </Decision>

    <H2>Later, not built</H2>
    <List items={['Uploading a perk image (it uses the product’s logo).']} />

    <H2>API</H2>
    <Table
      head={['', 'Contract', 'Who']}
      rows={[
        [
          <Code key="1">squadPerks(sourceId)</Code>,
          'In order; ended ones for editors only',
          'Anyone who can view (replica)',
        ],
        [
          <Code key="2">squadPerk(id)</Code>,
          'code only for members who may take it',
          'Same',
        ],
        [
          <Code key="3">claimSquadPerk(id)</Code>,
          'Records the claim, returns the member’s code',
          'Members',
        ],
        [
          <Code key="4">addSquadPerk / updateSquadPerk / removeSquadPerk</Code>,
          'Update is partial',
          'Edit permission + perks flag',
        ],
        [<Code key="5">reorderSquadPerks(sourceId, ids)</Code>, '', 'Same'],
        [
          <Code key="6">addSquadPerkCodes(id, codes)</Code>,
          'Skips codes already there',
          'Same',
        ],
      ]}
    />
    <P>
      Tables <Code>squad_perk</Code>, <Code>squad_perk_claim</Code> (one per
      member and perk) and <Code>squad_perk_code</Code> (unique codes, with who
      took each).
    </P>

    <H2>Analytics events</H2>
    <Table
      head={['Event', 'When']}
      rows={[
        [
          <Code key="a">claim squad perk</Code>,
          'A claim the API accepted, once',
        ],
        [
          <Code key="b">click squad perk redeem</Code>,
          'Redeem on the perk page',
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
              <Code key="1">graphql/squadJobsPerks.ts</Code>,
              <Code key="2">
                features/squads/components/perks/SquadPerks.tsx
              </Code>,
              <Code key="3">features/squads/hooks/useSquadPerks.ts</Code>,
              <Code key="4">
                features/squads/components/manage/SquadManageJobsPerks.tsx
              </Code>,
              <Code key="5">features/squads/lib/jobsPerks.ts (+ spec)</Code>,
              <Code key="6">
                webapp/pages/squads/[handle]/perks/[perkId].tsx, manage/perks/*
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
                src/entity/SquadPerk.ts, SquadPerkClaim.ts, SquadPerkCode.ts
              </Code>,
              <Code key="2">
                src/common/squadJobsPerks.ts (claimSquadPerk)
              </Code>,
              <Code key="3">src/schema/squadJobsPerks.ts</Code>,
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
  title: 'Verified Squads (parked)/4. Member perks/Spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const MemberPerksSpec: StoryObj = {
  name: 'Spec',
  render: () => <Spec />,
};
