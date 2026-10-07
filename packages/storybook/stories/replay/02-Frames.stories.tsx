import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useRef } from 'react';
import {
  Callout,
  CalloutTone,
  CategoryChip,
  Page,
  PageHeader,
  Section,
  StatusChip,
} from './shell';
import type { Candidate } from './catalog';
import {
  annualFlagships,
  byId,
  Cadence,
  Category,
  catalog,
  handoffFrame,
  FrameLayout,
} from './catalog';
import { DESIGN_WIDTH, FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';
import { CardActions } from './CardActions';

const meta: Meta = {
  title: 'Replay/02. Frames',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Every frame in the catalog, rendered. A dozen layouts carry all of them.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Tile = ({
  candidate,
  width = 258,
}: {
  candidate: Candidate;
  width?: number;
}): React.ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <figure ref={ref} className="flex flex-col gap-2">
      <FrameThumb
        width={width}
        candidate={candidate}
        data={sampleData[candidate.id]}
        windowLabel="W37"
      />
      <figcaption className="flex flex-col gap-1" style={{ width }}>
        <span className="break-all font-mono text-text-primary typo-caption1">
          {candidate.id}
        </span>
        <span className="flex flex-wrap items-center gap-1">
          <CategoryChip category={candidate.category} />
          <StatusChip status={candidate.status} />
        </span>
        <span className="text-text-quaternary typo-caption2">
          {candidate.layout}
        </span>
        <CardActions target={ref} filename={candidate.id} compact={width < 300} />
      </figcaption>
    </figure>
  );
};

const Grid = ({
  items,
}: {
  items: Candidate[];
}): React.ReactElement => (
  <div className="flex flex-wrap gap-6">
    {items.map((candidate) => (
      <Tile key={candidate.id} candidate={candidate} />
    ))}
  </div>
);

export const FullSize: Story = {
  name: 'At full size',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader eyebrow="Replay" title="Three frames at the size they ship">
        <p>
          Authored at {DESIGN_WIDTH}px wide and exported at three times that, so
          1080&times;1920. Everything else in this Storybook is the identical
          canvas scaled down, which is the only way a thumbnail is honest about
          what actually gets posted.
        </p>
        <p>
          Each one is a package rather than a caption: the claim, two or three
          supporting facts, where that puts them against everyone else, and a
          face. The standing block is the part that makes someone learn
          something they could not have worked out on their own.
        </p>
      </PageHeader>
      <Section
        title="Streak, crown and community"
        description="The streak frames carry the tier artwork and the streak's own colour. A streak is not a number, it is a named rung you climbed: day 30 is Inferno, and the name is the thing worth bragging about."
      >
        <div className="flex flex-wrap gap-8">
          {[
            'streak.moment',
            'rhythm.perfectWeek',
            'crown.topReader',
            'community.podium',
            'rank.topicReader',
            'handoff',
          ].map((id) => (
            <Tile key={id} candidate={byId(id)} width={DESIGN_WIDTH} />
          ))}
        </div>
      </Section>
    </Page>
  ),
};

export const AllFrames: Story = {
  name: 'Every frame, by category',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="Every frame in the catalog"
      >
        <p>
          These are share canvases, so they hold one fixed look and ignore the
          Storybook theme toggle: a frame is an image that gets exported and
          posted. Sizing runs on container queries, so the identical component is
          correct as a thumbnail here, at full size in the viewer, and at
          1080&times;1920 on export.
        </p>
        <p>
          A frame is a layout, a hue and data.{' '}
          {Object.keys(FrameLayout).length} layouts carry{' '}
          {catalog.length + annualFlagships.length + 1} frames, which is also how
          the shipped renderer should work: bespoke art per candidate does not
          survive a weekly cadence.
        </p>
      </PageHeader>

      {Object.values(Category).map((category) => {
        const items = catalog.filter(
          (candidate) =>
            candidate.category === category &&
            candidate.cadences.includes(Cadence.Weekly),
        );

        return (
          <Section
            key={category}
            title={`${category} · ${items.length}`}
            description={
              category === Category.Community
                ? 'The thinnest category and the most valuable. These are the only frames that put another developer in the picture, which is the only thing that turns reach into a loop.'
                : undefined
            }
          >
            <Grid items={items} />
          </Section>
        );
      })}

      <Section
        title="The handoff"
        description="Always last. The one card that asks for something, so it closes the deck. There is no opener any more: the welcome card was the measured leak."
      >
        <Grid items={[handoffFrame]} />
      </Section>
    </Page>
  ),
};

export const Layouts: Story = {
  name: 'Every layout',
  render: () => {
    const oneEach = Object.values(FrameLayout)
      .map((layout) =>
        [...catalog, handoffFrame].find(
          (candidate) => candidate.layout === layout,
        ),
      )
      .filter((candidate): candidate is Candidate => Boolean(candidate));

    return (
      <Page>
        <FrameStyles />
        <PageHeader eyebrow="Replay" title="One layout system, twelve shapes">
          <p>
            Each layout is a different way of making a number feel like
            something, and the choice is not decorative. A podium says you beat
            people. A ring says you were single-minded. A split says you are not
            who you think you are. A progress bar says you are not finished.
          </p>
        </PageHeader>
        <Section title="One example of each">
          <Grid items={oneEach} />
        </Section>
        <Callout tone={CalloutTone.Bad} title="Two layouts are now only for cut cards">
          <p>
            <code>progress</code> and <code>level</code> carry nudges and
            gamification stats, all of which measured too rare or too flat to
            share (weekly quests fire for 0.3%). They stay rendered here so the
            decision is reviewable, and the selector never picks them.
          </p>
        </Callout>
      </Page>
    );
  },
};

export const Annual: Story = {
  name: 'Annual flagships',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader eyebrow="Replay" title="The December edition">
        <p>
          Same engine, wider window, more ceremony. These four are catalog
          entries with <code>cadences: [&apos;annual&apos;]</code>, ported from
          the earlier viral-artifact work, and they are where the loop mechanics
          finally get spent.
        </p>
      </PageHeader>
      <Section title="Annual-only frames">
        <Grid items={annualFlagships} />
      </Section>
    </Page>
  ),
};
