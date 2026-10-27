import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Case, Page, Stage } from './parts';
import {
  Adaptive,
  DirectionNotes,
  OursAndYours,
  Rail,
  COLUMNS,
} from './widgets/directions';
import { HeroInFeed } from './widgets/frame';
import { BriefFrontPage, BriefNewsletter } from './widgets/briefing';
import {
  FinalHomeScreen,
  PhoneAdaptive,
  PhoneBriefing,
  PhoneHomeScreen,
  PhoneOursAndYours,
  PhoneRail,
  StackDemo,
} from './widgets/finals';

const meta: Meta = {
  title: 'Hero Cover/Archive/Finals (V2 direction)',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const DiscoverLabel = (): ReactElement => (
  <div className="flex items-baseline gap-3">
    <h3 className="font-bold text-text-primary typo-title3">Discover</h3>
    <span className="text-text-tertiary typo-callout">
      Everything beyond your briefing: new topics, new voices, the long tail.
    </span>
  </div>
);

/** Desktop on top; the phone beside its notes underneath. */
const Final = ({
  title,
  verdict,
  note,
  desktop,
  phone,
  notes,
}: {
  title: string;
  verdict: string;
  note?: string;
  desktop: ReactNode;
  phone: ReactNode;
  notes: ReactNode;
}): ReactElement => (
  <Case title={title} note={note}>
    <span className="self-start rounded-8 bg-surface-float px-2 py-1 font-bold text-text-secondary typo-caption1">
      {verdict}
    </span>
    <Stage columns={5}>{desktop}</Stage>
    <div className="flex flex-col gap-8 laptop:flex-row laptop:items-start">
      {phone}
      <div className="min-w-0 flex-1 pt-2">{notes}</div>
    </div>
  </Case>
);

const decisions: [string, string][] = [
  [
    'V1',
    'D · Rail, decided with Ido: one horizontal row of widgets, our ad slot locked second. See Hero Cover / V1 Rail.',
  ],
  ['V2', 'A · Home Screen with per-widget stacks, as the next step.'],
  ['Sizes', 'Three: Small, Tall, Large. The wide size is gone.'],
  [
    'Kept',
    'H · Your briefing as its own hero (front page or newsletter), and as a widget.',
  ],
  ['Parked', 'C · Ours + Yours and G · Adaptive.'],
  ['Dropped', 'E · Spaces and F · Sponsored skins.'],
  [
    'Dropped',
    'The briefing as a since-you-left timeline: a good title, not the design.',
  ],
];

export const Finals: StoryObj = {
  name: 'Finals (V2 direction)',
  render: () => (
    <Page
      chapter="Finals"
      question="Which hero do we build?"
      title="Hero cover: the finals"
      goal="The directions that survived review, each on a real five-column feed and on a phone, so the team can compare them side by side and pick one."
      metric="Hero engagement per visit and return visits, with ad revenue per visit held flat. The pick goes to an A/B test against today's hero."
    >
      <Case title="Where we landed">
        <ul className="flex max-w-[56rem] flex-col gap-2">
          {decisions.map(([verdict, text]) => (
            <li key={text} className="flex items-baseline gap-3 typo-callout">
              <span className="w-16 shrink-0 font-bold text-text-tertiary typo-caption1 uppercase tracking-wider">
                {verdict}
              </span>
              <span className="text-text-secondary">{text}</span>
            </li>
          ))}
        </ul>
      </Case>

      <Case
        title="Stacks: flip a widget in place"
        note="Apple's Smart Stack, polished for a pointer. Scroll, swipe or use the arrow keys over a stack to flip it; the dots on the right edge wake on hover and after each flip, then fade. Try it on both stacks."
      >
        <StackDemo />
      </Case>

      <Final
        title="A · Home Screen"
        verdict="Lead direction"
        note="Press Customize: widgets jiggle, the minus removes, the size badge resizes, drag to reorder. The lead slot stacks the top story with your briefing; Happening Now and Notifications are stacks too. Scroll or swipe over a stack to flip it. Page two holds the overflow."
        desktop={<FinalHomeScreen />}
        phone={<PhoneHomeScreen />}
        notes={
          <DirectionNotes
            pitch="The hero is the reader's home screen: widgets in four sizes on the feed's columns, edited in place, with stacks for widgets that share a slot."
            overflow="Stacks first (drop a widget onto another), pages second. The phone uses two-column pages."
            ads="A Sponsored widget pinned by daily.dev: fixed, labeled, not removable, and gone with Plus."
            risk="Page two is rarely seen, so stacks have to carry most of the overflow."
          />
        }
      />

      <Final
        title="C · Ours + Yours"
        verdict="Kept"
        note="Press Customize: our zone dims and locks, yours jiggles."
        desktop={<OursAndYours />}
        phone={<PhoneOursAndYours />}
        notes={
          <DirectionNotes
            pitch="The editorial zone stays ours (top story and ad); a smaller dock is the reader's to fill."
            overflow="A hard limit on the reader's dock, shown as spots used."
            ads="Inside our zone, fixed and predictable, sold like a masthead. On phones the ad returns to the feed."
            risk="The reader owns little of the row, so it can feel like customization in name only."
          />
        }
      />

      <Final
        title="G · Adaptive"
        verdict="Kept"
        note="Switch the time of day: the system rearranges around what the reader pinned."
        desktop={<Adaptive />}
        phone={<PhoneAdaptive />}
        notes={
          <DirectionNotes
            pitch="The reader pins what must stay; the system arranges the rest for the moment: the brief in the morning, agents in the afternoon, the podcast in the evening."
            overflow="None to manage: the system picks what fits now."
            ads="The ad competes for the flexible slots by relevance, with a frequency cap."
            risk="If the reader cannot predict where things are, it stops feeling like theirs."
          />
        }
      />

      <Final
        title="H · Your briefing"
        verdict="Kept, a different kind of hero"
        note="Not widgets at all: the hero summarizes the reader's last 24 hours from their own feed, and the feed below becomes Discover. Two forms we like: the front page and the newsletter. It also lives as a widget, stacked under the top story in A."
        desktop={
          <div className="flex flex-col gap-10">
            <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
              <BriefFrontPage />
            </HeroInFeed>
            <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
              <BriefNewsletter />
            </HeroInFeed>
          </div>
        }
        phone={<PhoneBriefing />}
        notes={
          <DirectionNotes
            pitch="Front page: a headline sentence, lines from the reader's stack with sources, what happened around them, one thing worth their time. Newsletter: the same as one cited paragraph that expands."
            overflow="It is a summary, so it never grows: five lines, then the feed."
            ads="One labeled sponsored line, the way a newsletter carries a sponsor."
            risk="Summaries must be right; a wrong sentence on top of the page costs more trust than a wrong card."
          />
        }
      />

      <Final
        title="D · Rail"
        verdict="Maybe"
        note="Scroll the row sideways."
        desktop={<Rail />}
        phone={<PhoneRail />}
        notes={
          <DirectionNotes
            pitch="One horizontal rail of widgets in mixed sizes, curated first screen, more to the side."
            overflow="Unlimited: the rail scrolls."
            ads="A Sponsored widget at a fixed early position in the rail."
            risk="Sideways scrolling on desktop is easy to miss."
          />
        }
      />
    </Page>
  ),
};
