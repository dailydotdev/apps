import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page, Stage } from '../parts';
import { HeroInFeed } from './frame';
import { Shelf } from './shelf';
import { COLUMNS, DirectionNotes, w } from './directions';
import { BriefFrontPage, BriefNewsletter, BriefTimeline } from './briefing';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget exploration/7. Your briefing',
  parameters: { layout: 'fullscreen' },
};

export default meta;

/** The line that tells the reader the feed below is now for discovering. */
const DiscoverLabel = (): React.ReactElement => (
  <div className="flex items-baseline gap-3">
    <h3 className="font-bold text-text-primary typo-title3">Discover</h3>
    <span className="text-text-tertiary typo-callout">
      Everything beyond your briefing: new topics, new voices, the long tail.
    </span>
  </div>
);

export const Briefing: StoryObj = {
  name: '7. Your briefing',
  render: () => (
    <Page
      chapter="Widgets · 7"
      question="What if the top of the page told you what happened?"
      title="Your briefing on top, discovery below"
      goal="Split the page by intent. The hero summarizes the reader's own last 24 hours (their stack, their people, the one thing worth their time), so the feed underneath becomes the place to discover beyond it."
      metric="Share of visits that reach 'caught up', briefing clicks per visit, and feed depth after the briefing compared with today."
    >
      <p className="max-w-[56rem] text-text-tertiary typo-callout">
        Every line below is written from real posts in the 11 October snapshot,
        and every source chip opens the post it came from. The reader here
        follows #nodejs, #react, #dotnet, #postgres and #ai, and two squads.
      </p>
      <Case title="H1 · Front page">
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
            <BriefFrontPage />
          </HeroInFeed>
        </Stage>
        <DirectionNotes
          pitch="A front page written for one reader: a headline sentence, four lines from their stack with sources, and what happened around them."
          overflow="The briefing is the summary; anything beyond five lines is the feed's job, so it never grows."
          ads="A sponsored line can sit in the stack list as one labeled item, the way a newsletter carries a sponsor."
          risk="Summaries must be right. One wrong sentence on top of the page costs more trust than a wrong card in the feed."
        />
      </Case>
      <Case title="H2 · Newsletter">
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
            <BriefNewsletter />
          </HeroInFeed>
        </Stage>
        <DirectionNotes
          pitch="One paragraph with citations, the way an answer engine reads, that expands into the full briefing."
          overflow="Collapsed to three sentences; the rest opens on demand."
          ads="'Presented by' under the paragraph, one sponsor per edition."
          risk="A paragraph is slower to scan than a list, and it hides how much is there until it opens."
        />
      </Case>
      <Case title="H3 · Since you left">
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
            <BriefTimeline />
          </HeroInFeed>
        </Stage>
        <DirectionNotes
          pitch="What happened since the last visit, in time order, with lenses for your stack and your people."
          overflow="Time bounds it: one visit's worth, then the feed."
          ads="A sponsored item in time order, labeled."
          risk="The more often someone visits, the thinner it gets, so it needs a good 'nothing new' state."
        />
      </Case>
      <Case title="H4 · As the lead widget">
        <Stage columns={5}>
          <HeroInFeed columns={COLUMNS} feedLabel={<DiscoverLabel />}>
            <Shelf
              columns={COLUMNS}
              overflow="stack"
              widgets={[
                w('mybrief', 'l'),
                w('happening', 'm'),
                w('streak', 'm'),
                w('ad', 'm', { isLocked: true }),
              ]}
            />
          </HeroInFeed>
        </Stage>
        <DirectionNotes
          pitch="The briefing becomes the default lead widget of the widget hero, so the two ideas join: it takes the large slot, the reader's widgets fill the rest."
          overflow="Whatever the widget system chooses; the briefing is just one widget in it."
          ads="The reserved slot of the widget hero."
          risk="Squeezed to a widget, the briefing becomes a list of headlines again, losing what makes it a briefing."
        />
      </Case>
    </Page>
  ),
};
