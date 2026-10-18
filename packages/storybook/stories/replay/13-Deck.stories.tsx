import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
  Callout,
  CalloutTone,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { byId, handoffFrame } from './catalog';
import { sampleData } from './data';
import { FrameStyles } from './frames';
import type { DeckCard } from './CardDeck';
import { CardDeck } from './CardDeck';

const meta: Meta = {
  title: 'Replay/13. The deck',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Six ways to consume five cards, the one I would ship, and a working prototype of it.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const CARDS: DeckCard[] = [
  byId('crown.topReader'),
  byId('rank.topicReader'),
  byId('persona.week'),
  byId('source.obscurity'),
  byId('streak.moment'),
  handoffFrame,
].map((candidate) => ({ candidate, data: sampleData[candidate.id] }));

const Playground = (): React.ReactElement => {
  const [log, setLog] = useState<string[]>([]);
  const [top, setTop] = useState<string>(CARDS[0].candidate.id);

  return (
    <div className="flex flex-wrap items-start gap-8">
      <CardDeck
        cards={CARDS}
        onTop={setTop}
        onShare={(id, channel) =>
          setLog((entries) => [`${channel} · ${id}`, ...entries].slice(0, 6))
        }
      />
      <div className="flex w-[19rem] flex-col gap-4">
        <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <span className="font-bold text-text-primary typo-caption1">
            On top
          </span>
          <span className="font-mono text-text-tertiary typo-caption2">
            {top}
          </span>
        </div>
        <div className="flex min-h-[7rem] flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <span className="font-bold text-text-primary typo-caption1">
            Share events
          </span>
          {log.length === 0 ? (
            <span className="text-text-quaternary typo-caption2">
              Nothing yet. Whatever is on top is what shares.
            </span>
          ) : (
            log.map((entry) => (
              <span
                key={entry}
                className="font-mono text-text-tertiary typo-caption2"
              >
                {entry}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const Deck: Story = {
  name: 'The deck',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay"
        title="A deck you hold, not a slideshow you sit through"
      >
        <p>
          Drag the top card in either direction and let go. Arrow keys work too:
          right sends the top card to the back, left brings the last one
          forward.
        </p>
        <p>
          Card one is a Tier S payload card, never a welcome: the Log lost a
          third of its audience on the welcome card. The two cards peeking out
          behind say there is more without saying what, which is the cheapest
          curiosity there is.
        </p>
      </PageHeader>

      <Section title="Interactive">
        <Playground />
      </Section>

      <Section title="The one thing this does not copy from Tinder">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="A swipe there is a judgement">
            <p>
              Left and right mean no and yes, and the card is gone either way.
              That grammar is doing real work in a dating app and none at all
              here: there is no decision to make about your own week.
            </p>
            <p>
              Worse, it asks someone to throw away their own Top Reader badge.
              The gesture would read as discarding an achievement.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Here it goes to the back">
            <p>
              Same drag, same weight, same satisfying throw — and the card
              rejoins the bottom of the deck. Nothing is ever lost, you can keep
              going round, and there is no dead end at the last card.
            </p>
            <p>
              It also removes the accidental-dismissal problem entirely, which
              is the most common complaint about swipe interfaces.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="Six ways to consume five cards"
        description="I looked at all of them before picking. The trade is always between ceremony and control."
      >
        <Table
          head={['Pattern', 'What it gets right', 'Why it is not the answer']}
          minWidth={70}
          rows={[
            [
              <span className="font-bold text-text-primary">
                Tap-through story
              </span>,
              'Universally understood, fast, full-bleed drama, and it is what Wrapped trained everyone on.',
              'No sense of a collection. One card at a time with nothing visible behind it is a slideshow, and going back is awkward.',
            ],
            [
              <span className="font-bold text-text-primary">
                Swipe deck, Tinder grammar
              </span>,
              'The most tactile option, and the "pack of cards" feeling is exactly right.',
              'The gesture means judgement, and there is nothing to judge. Cards vanish, which is wrong for someone’s own achievements.',
            ],
            [
              <span className="font-bold text-accent-avocado-default">
                Deck that cycles
              </span>,
              'All the tactility, the peek behind as a built-in curiosity gap, and nothing is ever destroyed.',
              <span className="text-accent-avocado-default">
                This is the recommendation.
              </span>,
            ],
            [
              <span className="font-bold text-text-primary">
                Horizontal carousel
              </span>,
              'Peeking edges show there is more, scrolls with a mouse, trivially reversible.',
              'Cards shrink to fit side by side, which costs the thing that makes them worth sharing: they stop looking like posters.',
            ],
            [
              <span className="font-bold text-text-primary">
                Vertical scroll of cards
              </span>,
              'Zero learning curve, native to a feed app, share button always adjacent.',
              'No ceremony at all. It reads as a settings page about yourself.',
            ],
            [
              <span className="font-bold text-text-primary">
                Spread, all cards at once
              </span>,
              'The only layout where you can compare and choose what to post.',
              'Poor as a first impression: seven small cards at once has no sequence and no build.',
            ],
          ]}
        />
      </Section>

      <Section
        title="What I would actually ship"
        description="Not one pattern. Two, and a way between them."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="1. Deck, by default">
            <p>
              Opens on the deck. Drag or tap through, peek behind, nothing
              destroyed. It carries the ceremony and the sense of a collection
              at the same time.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="2. Spread, on demand">
            <p>
              Tap the counter and the deck fans into a grid of every card. This
              is the missing half of a story: it is the only view where someone
              can compare and pick the one worth posting.
            </p>
            <p>
              Sharing is the whole point of the initiative, and a story never
              lets you choose.
            </p>
          </Callout>
          <Callout title="3. Never auto-advance">
            <p>
              A deck that moves on its own is a slideshow wearing a costume. The
              hand stays on the user, in both modes.
            </p>
          </Callout>
        </div>
        <Callout tone={CalloutTone.Bad} title="What I am not sure about">
          <p>
            Drag is a discovery problem on desktop, where nobody expects to pick
            a card up with a mouse. The hint line and the arrow-key support
            cover it here, but if this ships, the deck needs the tap zones from
            the story viewer as well, doing the same job for people who never
            try dragging.
          </p>
          <p>
            The honest test is completion rate against the tap-through story.
            Tactility is a real benefit and added friction is a real cost, and I
            do not know which wins.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};
