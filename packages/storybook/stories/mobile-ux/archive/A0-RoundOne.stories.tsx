import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchiveNav, ChapterStatus, Page, PageHeader, Section, Status, Table } from '../kit';

const meta: Meta = {
  title: 'Mobile UX/Archive/Round one questions',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// The questions chapter 0 asked in round 1, with the answers recommended
// then. Every one has since been decided; the last column says how, and
// where the answer differs from the recommendation.
const questions = [
  {
    question: 'Does Squads keep a tab?',
    recommendation:
      'Yes. The bar is Home · Explore · Squads · Activity; the profile moved to the header avatar instead. Squad posts also appear inside the Following segment on Home. The You-tab arm is kept as the experiment alternative in chapter 3.',
  },
  {
    question: 'Docked bar or floating chrome?',
    recommendation:
      'Floating, built from three shapes (circle, capsule, our rectangle field) that shrink continuously with scroll, one layout on both stores. The production flat blur on iOS, the same pieces solid on Android where blur is slow and Instagram itself stayed docked and opaque. Chapter 3b has the system and live scrolling demos.',
  },
  {
    question: 'Does the post page keep the tab bar?',
    recommendation:
      'Yes. Both bars stay: the engagement bar sits above the tab cluster at rest and folds inline beside a single Home button while you read (the iOS 26 accessory model). Chapter 6.',
  },
  {
    question: 'Where do Create and the profile live?',
    recommendation:
      'Create is its own round button beside the tab bar, like the Search circle in Photos. The profile is the avatar in the top header, next to the streak; the bar keeps Squads. Chapter 3.',
  },
  {
    question: 'Where does Headlines live?',
    recommendation:
      'As a segment on Home (next to For you and Following) and a row in Explore. It keeps its channels, with the swipe fixed.',
  },
  {
    question: 'Menus as sheets, settings as pages?',
    recommendation:
      'Yes. Every three-dots menu becomes a grouped action sheet (the post menu drops from 20 rows to 7 visible), every drawer uses one sheet primitive with a grabber, and Settings, Feed settings and Squad Manage become pages under You instead of a left drawer and a modal. Chapter 4b lists all 27 fixes.',
  },
  {
    question: 'Do we kill the floating "+"?',
    recommendation:
      'Yes, the centre tab replaces it. Logged out it opens the signup sheet, exactly like Reddit.',
  },
  {
    question: 'Do we invest in the Android wrapper?',
    recommendation:
      'Yes, at least the back contract. Without it the system back gesture will exit the app from a post once Android 16 predictive back is enforced.',
  },
];

const decided: Record<string, string> = {
  "Does Squads keep a tab?": "Yes, in round 3: Home · Explore · Squads · Activity; the profile is the header avatar.",
  "Docked bar or floating chrome?": "Floating, in round 2; then round 4 removed the circles and capsules (one rounded rectangle) and the glass (one flat blur on both platforms, round 5).",
  "Does the post page keep the tab bar?": "Both bars show at rest; as you read the tab bar slides away and the action bar takes its slot (round 4). The fold beside a Home button was withdrawn.",
  "Where do Create and the profile live?": "Create is its own square beside the bar with the Material look (rounds 3 and 5), not a round button; the profile is the avatar in the brand row.",
  "Where does Headlines live?": "It is called Happening now (round 4): a Home segment with its channels in a menu on the segment (round 5), and a row on Explore.",
  "Menus as sheets, settings as pages?": "Yes, in round 4.",
  "Do we kill the floating \"+\"?": "Yes; it becomes the Create square beside the bar, not a centre tab (round 3), and it opens the composer directly (round 4).",
  "Do we invest in the Android wrapper?": "Yes: the back contract, and since round 5 also the in-app browser screen, edge to edge and the status-bar style (chapters 6b and 8)."
};

export const RoundOneQuestions: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Archive"
        title="The eight questions from round 1, the answers recommended then, and what was decided."
      >
        <p>
          Kept for the record. Nothing here is a spec; the decisions table in chapter 0
          is the source, and the chapters carry the decided designs.
        </p>
        <ArchiveNav />
      </PageHeader>
      <Status status={ChapterStatus.Reference} round="5">
        Archived from chapter 0 on 30 Sep 2026. Three recommendations were overturned: the round Create button, the fold beside a Home button, and Headlines as a name.
      </Status>
      <Section title="Questions and answers">
        <Table
          head={['Question', 'Recommended in round 1', 'Decided']}
          rows={questions.map((row) => [
            <span key={row.question} className="font-bold text-text-primary">
              {row.question}
            </span>,
            <span key={`${row.question}-r`} className="text-text-tertiary">{row.recommendation}</span>,
            <span key={`${row.question}-d`} className="font-bold text-text-primary">{decided[row.question]}</span>,
          ])}
        />
      </Section>
    </Page>
  ),
};
