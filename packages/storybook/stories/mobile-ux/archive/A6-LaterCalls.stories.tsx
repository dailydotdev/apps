import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArchiveNav,
  Cell,
  ChapterStatus,
  Page,
  PageHeader,
  PhoneRow,
  Section,
  Status,
  Table,
  Verdict,
  VerdictPill,
} from '../kit';
import { PostStill } from '../chrome';
import { LoginSheetPhone } from '../sheets';
import {
  ActivityScroll,
  AvatarSide,
  ExploreScroll,
  HomeScroll,
  NewSquadLook,
  SquadsScroll,
  newSquadLookNotes,
} from '../scrollPages';
import { StreakSheetStill } from '../settingsMocks';
import { barHomes } from '../browser';

const meta: Meta = {
  title: 'Mobile UX/Archive/Later calls',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const items: [string, string, string, string][] = [
  ['Post page with floating buttons that never hide', '9b (from 6)', 'Round 5: the post page follows the 4e rule, a solid block that hides', 'The one page that broke the rule; kept to show what changed.'],
  ['The round 1 login sheet before the sign-up screen', '9b (from 4b)', 'Round 5: production’s Sign up opens directly, two UI touches only', 'One more tap before the same choice; never in production.'],
  ['Avatar on the left, name beside it (A) and X’s centred layout (B)', '9c', 'Round 5: avatar right, name left, streak on Home only', 'Simulated on all four roots to answer the question; the decided row won.'],
  ['New squad looks 1 to 4 (filled chip, outline chip, plus square, plus and New)', '9c', 'Round 5: look 5, the New tile first in Your squads', 'All four put something next to the avatar; the tile keeps the row to name and avatar.'],
  ['Two bar placements for the reading drawer (docked everywhere; floating everywhere)', '6b', 'Round 5: one bar, never redrawn, the post page’s capsule inside the drawer card', 'Two bars for one post, or a floating card with a grabber; both lost to keeping the capsule as it is.'],
  ['The compact streak sheet (A)', '9d', 'Round 5: the layout v2 panel as a sheet (B), with the record day on top', 'A shorter sheet from the desktop popup; B keeps one streak surface across desktop and phone.'],
];

const roots = (avatar: AvatarSide) => [
  { name: 'Home', render: <HomeScroll avatar={avatar} /> },
  { name: 'Explore', render: <ExploreScroll avatar={avatar} /> },
  { name: 'Squads', render: <SquadsScroll avatar={avatar} /> },
  { name: 'Activity', render: <ActivityScroll avatar={avatar} /> },
];

const benchmarks: [string, string, string][] = [
  ['X', 'Your avatar top left on all five tabs; tapping it opens the account drawer from the left edge. Home centres the X logo; the other tabs centre a title or the search field.', 'One fixed anchor for “you”, the same on every root.'],
  ['Reddit', 'Avatar top left on the Home and Communities tabs, opening a drawer; the Create and Inbox tabs have their own headers.', 'Anchor on the browsing tabs only.'],
  ['YouTube', 'Avatar top right on Home and Subscriptions; hidden on Shorts; the You tab in the bar is the profile.', 'Right side, not every tab.'],
  ['Instagram, Threads', 'No avatar in the header; the profile tab is the avatar itself, bottom right.', 'The bar owns the profile.'],
  ['Slack', 'Avatar top left on Home only, opening the workspace switcher; other tabs have their own headers.', 'Left on the home tab, absent elsewhere.'],
];

export const LaterCalls: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive · chapters 9b, 9c, 9d"
        title="What the later calls set aside: the post page that never hid its buttons, the login sheet, the avatar on the left, four New squad looks, and the compact streak sheet."
      >
        <p>
          Nothing on this page is built from. Each item names the decision
          row that retired it. The live chapters keep only the decided
          designs.
        </p>
        <ArchiveNav />
      </PageHeader>
      <Status status={ChapterStatus.Reference} round="5">
        Collected on 30 Sep 2026 from chapters 9b, 9c and 9d after Tsahi’s
        decisions; nothing here changes a decision.
      </Status>

      <Section title="What is here and why" description="One row per archived item. Retired by quotes the decision row in a few words.">
        <Table
          head={['Item', 'Chapter it came from', 'Retired by', 'Why']}
          rows={items.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section title="Chapter 9b: the post page and the sign-up" description="The withdrawn post page top chrome and the round 1 sheet.">
        <PhoneRow>
          <Cell label="Floating buttons, never hiding (withdrawn)" verdict={Verdict.Skip} note="Back, share and menu floated over the article at every scroll position. The post page now hides them as one solid block like every page.">
            <PostStill p={1} />
          </Cell>
          <Cell label="Round 1: a sheet before the sign-up (withdrawn)" verdict={Verdict.Skip} note="Save this post: Sign up or Log in, then the same screen. Production opens the sign-up directly.">
            <LoginSheetPhone />
          </Cell>
        </PhoneRow>
      </Section>

      <Section title="Chapter 9c: the avatar on the left" description="A put the avatar in the leading slot with the name beside it; B was X’s centred layout. The decided row (name left, avatar right) won after this comparison.">
        <PhoneRow>
          {roots(AvatarSide.Left).map((root) => (
            <Cell key={`left-${root.name}`} label={`A · ${root.name}`} verdict={Verdict.Skip}>
              {root.render}
            </Cell>
          ))}
        </PhoneRow>
        <PhoneRow>
          {roots(AvatarSide.LeftCentered).map((root) => (
            <Cell key={`centered-${root.name}`} label={`B · ${root.name}`} verdict={Verdict.Skip}>
              {root.render}
            </Cell>
          ))}
        </PhoneRow>
        <Table
          head={['App', 'Placement', 'Reads as']}
          rows={benchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section title="Chapter 9c: New squad, the four looks set aside" description="Look 5 (the New tile first in Your squads) is decided; these four all put something next to the avatar.">
        <PhoneRow>
          {[NewSquadLook.Filled, NewSquadLook.Outline, NewSquadLook.IconSquare, NewSquadLook.IconChip].map((look, index) => (
            <Cell key={look} label={`${index + 1} · ${look}`} verdict={Verdict.Skip} note={newSquadLookNotes[look]}>
              <SquadsScroll action={look} />
            </Cell>
          ))}
        </PhoneRow>
      </Section>

      <Section title="Chapter 6b: the two bar placements set aside" description="Where the post page’s action bar goes when the article opens. C won: the capsule stays exactly as it is and the drawer card rises around it.">
        <Table
          head={['Option', 'What', 'For', 'Against', 'Verdict']}
          rows={barHomes.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
            <VerdictPill key={`${row[0]}-v`} verdict={row[4]} />,
          ])}
        />
      </Section>

      <Section title="Chapter 9d: the compact streak sheet" description="The desktop popup as a short sheet. Set aside for the layout v2 panel as a sheet, which keeps one streak surface across desktop and phone.">
        <PhoneRow>
          <Cell label="A · The compact sheet" verdict={Verdict.Skip} note="Current streak with the 3D fire, this week in production’s dots, longest, total and freezes as three cards, the reminder switch, Streak settings.">
            <StreakSheetStill />
          </Cell>
        </PhoneRow>
      </Section>
    </Page>
  ),
};
