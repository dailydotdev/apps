import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
} from './shell';
import { byId, handoffFrame } from './catalog';
import { sampleData } from './data';
import type { PlayerFrame } from './StoryPlayer';
import { StoryPlayer } from './StoryPlayer';

const meta: Meta = {
  title: 'Replay/03. Story viewer',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The tap-through player. Click the right two thirds to advance, the left third to go back, or use the arrow keys.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const framesFrom = (ids: string[]): PlayerFrame[] =>
  [...ids.map(byId), handoffFrame].map((candidate) => ({
    candidate,
    data: sampleData[candidate.id],
  }));

/** Maya's five, hero first, handoff last. No opener. */
const FULL = framesFrom([
  'crown.topReader',
  'rank.topicReader',
  'persona.week',
  'source.obscurity',
  'streak.moment',
]);

const THIN = framesFrom(['selectivity', 'tags.dominant']);

const Log = ({
  entries,
}: {
  entries: string[];
}): React.ReactElement => (
  <div className="flex min-h-[6rem] w-[18rem] flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <span className="font-bold text-text-primary typo-caption1">
      Share events
    </span>
    {entries.length === 0 ? (
      <span className="text-text-quaternary typo-caption2">
        Nothing shared yet. Every frame has its own button.
      </span>
    ) : (
      entries.map((entry) => (
        <span key={entry} className="font-mono text-text-tertiary typo-caption2">
          {entry}
        </span>
      ))
    )}
  </div>
);

const Playground = ({
  frames,
  autoAdvance,
  startAt,
}: {
  frames: PlayerFrame[];
  autoAdvance?: boolean;
  startAt?: number;
}): React.ReactElement => {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <PhoneFrame>
        <StoryPlayer
          frames={frames}
          autoAdvance={autoAdvance}
          startAt={startAt}
          onShare={(id, channel) =>
            setLog((entries) => [`${channel} · ${id}`, ...entries])
          }
        />
      </PhoneFrame>
      <Log entries={log} />
    </div>
  );
};

export const Viewer: Story = {
  name: 'Full week, five highlights',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="The story viewer">
        <p>
          No welcome card. Card one is a Tier S payload card with a real claim
          on it, because the welcome card was where the Log lost a third of its
          audience. The strongest card sits early, and the handoff closes. Tap
          the right two thirds to advance, the left third to go back, or use the
          arrow keys.
        </p>
      </PageHeader>

      <Section
        title="Interactive"
        description="This is the real player, running the real frame renderer."
      >
        <Playground frames={FULL} />
      </Section>

      <Section title="Two decisions that are doing the work">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Share is per frame">
            <p>
              A share step after the last frame only catches people who finished,
              and asks them to pick a favourite from memory. Every frame is
              authored to stand alone as an image, so every frame gets a button.
            </p>
            <p>
              This is the single highest-leverage decision in the spec, and it is
              the reason the frames are 9:16 rather than a scrolling page.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Sharing pays the sharer">
            <p>
              Duolingo rewards a shared Year in Review with a themed badge and it
              moved their share rate. We already have the infrastructure:
              achievements carry art, rarity and profile showcase.
            </p>
            <p>
              The reward is also next week&apos;s content. A Signal Boost
              achievement unlocked on Monday is a frame in the following
              week&apos;s recap.
            </p>
          </Callout>
        </div>
        <Callout tone={CalloutTone.Bad} title="What the viewer must not do">
          <p>
            No forced auto-advance on first open. A recap that moves on its own
            before someone has read the number is a slideshow they did not ask
            for, and the frame they wanted to share is already gone.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};

export const Autoplay: Story = {
  name: 'Auto-advance variant',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="Auto-advance, six seconds a frame">
        <p>
          The variant worth testing, not the default. It lifts completion and
          costs share rate, because sharing requires stopping. If it ships, it
          pauses on touch and stops permanently the first time someone taps back.
        </p>
      </PageHeader>
      <Section title="Interactive">
        <Playground frames={FULL} autoAdvance />
      </Section>
    </Page>
  ),
};

export const Thin: Story = {
  name: 'Thinnest possible week',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Replay"
        title="Two opens, and it still holds"
      >
        <p>
          Tom opened two posts all week. That is enough to say something true
          about him and how he compares, so the reduced deck deals two staples
          that read well on small numbers: what reached him against what he
          chose, and which topic won his week. Nothing about what he missed;
          that is the digest&apos;s job.
        </p>
      </PageHeader>
      <Section
        title="Interactive"
        description="Two staples that hold on two opens, then the handoff."
      >
        <Playground frames={THIN} />
      </Section>
      <Section title="Why this is the important story">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="Why the floor is one open" note="~24% of weekly actives">
            <p className="text-text-tertiary typo-footnote">
              Replay only says two things: what you did, and how that compares.
              Someone who scrolled and opened nothing has no first half, so
              there is nothing honest to compare. Content they missed is not a
              Replay card; the digest and the feed already do that.
            </p>
          </Cell>
          <Cell label="And who gets nothing" note="Zero activity">
            <p className="text-text-tertiary typo-footnote">
              No opens means no Replay and no feed card, impressions or not. That
              reverses the earlier &quot;always render&quot; rule on purpose: an
              empty recap is worse than none.
            </p>
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

export const Resumed: Story = {
  name: 'Resumed from card three',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="Picking up where they left off">
        <p>
          They opened the deck on Monday and left on card three. The feed card
          deep-links back here rather than restarting, because restarting is how
          you lose the second half of a deck twice.
        </p>
      </PageHeader>
      <Section title="Interactive">
        <Playground frames={FULL} startAt={2} />
      </Section>
    </Page>
  ),
};
