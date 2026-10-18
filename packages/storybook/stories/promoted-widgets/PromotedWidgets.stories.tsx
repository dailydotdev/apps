import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { Case, Page } from '../hero-cover/parts';
import type { WidgetKind } from '../hero-cover/widgets/catalog';
import {
  widgetCatalog,
  WidgetContent,
  WidgetSurface,
} from '../hero-cover/widgets/catalog';
import { isCardWidget } from '../hero-cover/widgets/production';
import {
  PromotedAgents,
  PromotedBrief,
  PromotedBriefing,
  PromotedContinue,
  PromotedDigest,
  PromotedHappening,
  PromotedMessages,
  PromotedNotifications,
  PromotedPodcast,
  PromotedReadingList,
  PromotedSquad,
  PromotedStreak,
  PromotedTopStory,
  PromotedTrending,
} from './promoted';

const meta: Meta = {
  title: 'Promoted Widgets/Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Entry = {
  kind: WidgetKind;
  how: string;
  Promoted: () => ReactElement;
  /** The promoted version is a production card that brings its own frame. */
  isBare?: boolean;
};

const entries: Entry[] = [
  {
    kind: 'featured',
    how: 'A boosted post takes the top story, in the card’s production “Promoted by” treatment.',
    Promoted: PromotedTopStory,
    isBare: true,
  },
  {
    kind: 'happening',
    how: 'One paid headline among the real ones, third, never first.',
    Promoted: PromotedHappening,
  },
  {
    kind: 'agents',
    how: 'A tool vendor’s own release note, slotted second among the agent updates.',
    Promoted: PromotedAgents,
  },
  {
    kind: 'notifications',
    how: 'An invite from a brand, shaped like any other notification and never counted in the badge.',
    Promoted: PromotedNotifications,
  },
  {
    kind: 'dms',
    how: 'A verified brand message pinned above the inbox, like a sponsored thread.',
    Promoted: PromotedMessages,
  },
  {
    kind: 'squads',
    how: 'A brand post pinned at the top of the squad’s list.',
    Promoted: PromotedSquad,
  },
  {
    kind: 'bookmarks',
    how: 'A suggested save between the reader’s own: one tap adds it to the list.',
    Promoted: PromotedReadingList,
  },
  {
    kind: 'mybrief',
    how: 'The brief is presented by a sponsor in the header, with one sponsored line in the list.',
    Promoted: PromotedBrief,
  },
  {
    kind: 'briefing',
    how: 'Presented by a sponsor, with one paid item after the must-knows.',
    Promoted: PromotedBriefing,
  },
  {
    kind: 'podcast',
    how: 'Episode sponsorship: a chip under the title and the host read marked on the timeline.',
    Promoted: PromotedPodcast,
  },
  {
    kind: 'trending',
    how: 'A promoted tag in the ticker, with the brand’s logo where the chart would be.',
    Promoted: PromotedTrending,
  },
  {
    kind: 'continue',
    how: 'The finish line is where intent peaks: one paid “read next” under the progress.',
    Promoted: PromotedContinue,
  },
  {
    kind: 'streak',
    how: 'A sponsored quest: the brand pays for one of today’s goals and its prize.',
    Promoted: PromotedStreak,
  },
  {
    kind: 'digest',
    how: 'A boosted post leads the digest, in the same production treatment as the top story.',
    Promoted: PromotedDigest,
    isBare: true,
  },
];

const Cell = ({
  label,
  isBare,
  children,
}: {
  label: string;
  isBare?: boolean;
  children: ReactElement;
}): ReactElement => (
  <figure className="flex flex-col gap-2">
    <figcaption className="text-text-tertiary typo-footnote">
      {label}
    </figcaption>
    <div className="flex h-[27.5rem] w-[17.25rem]">
      <WidgetSurface className="flex-1" isBare={isBare}>
        {children}
      </WidgetSurface>
    </div>
  </figure>
);

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => (
    <Page
      chapter="Promoted"
      question="How does paid content live inside a widget?"
      title="Promoted widgets"
      goal="Show, widget by widget, how a brand’s content sits inside the reader’s own widgets: one paid item that keeps the widget’s shape, marked the same way everywhere."
      metric="Promoted revenue per hero view, with widget clicks and removals held flat against the unpromoted widget."
    >
      <Case
        title="The rules"
        note="One paid item per widget at most, never in the first slot of a list. It takes the list’s own shape, sits on a faint surface, and carries the brand’s logo with “Promoted by”, the same words the feed’s boosted cards use. Badges and counts never include it. Whole-widget sponsorships say “presented by” in the header instead."
      >
        <span />
      </Case>
      {entries.map(({ kind, how, Promoted, isBare }) => (
        <Case key={kind} title={widgetCatalog[kind].name} note={how}>
          <div className="flex flex-wrap items-end gap-8">
            <Cell label="Today" isBare={isCardWidget(kind, 'm')}>
              <WidgetContent kind={kind} size="m" />
            </Cell>
            <Cell label="Promoted" isBare={isBare}>
              <Promoted />
            </Cell>
          </div>
        </Case>
      ))}
    </Page>
  ),
};
