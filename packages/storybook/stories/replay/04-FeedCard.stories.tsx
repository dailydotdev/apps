import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Page,
  PageHeader,
  Section,
} from './shell';
import { byId } from './catalog';
import { sampleData } from './data';
import { FeedCard } from './FeedCard';
import { DeliveryState } from './ranking';

const meta: Meta = {
  title: 'Replay/04. Feed card',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The entry point. Frame one rendered as a card, in every delivery state.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const HERO = byId('persona.week');

export const States: Story = {
  name: 'Every state',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="The card is frame one, not an ad for it">
        <p>
          Its face is whatever the engine ranked first, so it is different every
          week and different between two people on the same day. That is why it
          needs no headline explaining what Replay is: it opens with a true thing
          about the person looking at it.
        </p>
        <p>
          It goes in after the third post, the way{' '}
          <code>FeedItemType.Highlight</code> already enters the feed.
        </p>
      </PageHeader>

      <Section
        title="Grid variant"
        description="The default. Sits in the feed grid at one column."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="Available" note="First session of the week">
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Available}
              frameCount={8}
            />
          </Cell>
          <Cell label="Resumable" note="Left on frame five">
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Resumable}
              frameCount={8}
              resumeAtFrame={5}
            />
          </Cell>
        </div>
      </Section>

      <Section
        title="Collapsed and gone"
        description="A daily visitor must not be handed the same full-bleed card six days running. Once handled, it drops to a row for the rest of the week."
      >
        <div className="flex flex-col gap-6">
          <Cell label="Seen" note="Opened and finished earlier this week">
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Seen}
              frameCount={8}
            />
          </Cell>
          <Cell label="Dismissed" note="Nothing again until Monday">
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Dismissed}
              frameCount={8}
            />
          </Cell>
        </div>
      </Section>

      <Section
        title="List variant"
        description="For list feed layout and mobile."
      >
        <FeedCard
          candidate={HERO}
          data={sampleData[HERO.id]}
          state={DeliveryState.Available}
          frameCount={8}
          list
        />
      </Section>
    </Page>
  ),
};

export const Faces: Story = {
  name: 'The face changes every week',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="Four people, same Monday">
        <p>
          Same slot in the feed, four different cards, because each one is that
          person&apos;s top-ranked frame. This is what stops the card going blind
          after three weeks: there is no template face to learn to ignore.
        </p>
      </PageHeader>
      <Section title="Same slot, different weeks and different people">
        <div className="flex flex-wrap items-start gap-6">
          {['persona.week', 'crown.topReader', 'community.podium', 'tags.shift'].map(
            (id) => (
              <FeedCard
                key={id}
                candidate={byId(id)}
                data={sampleData[id]}
                state={DeliveryState.Available}
                frameCount={8}
              />
            ),
          )}
        </div>
      </Section>
      <Callout tone={CalloutTone.Good} title="The card is the whole acquisition funnel for this feature">
        Nobody goes looking for a recap. Open rate off this card decides
        everything downstream, and a card carrying a real fact outperforms a card
        carrying a promise.
      </Callout>
    </Page>
  ),
};

export const Flow: Story = {
  name: 'Open, dismiss, come back',
  render: () => {
    const Demo = (): React.ReactElement => {
      const [state, setState] = useState(DeliveryState.Available);

      return (
        <div className="flex flex-col gap-4">
          <FeedCard
            candidate={HERO}
            data={sampleData[HERO.id]}
            state={state}
            frameCount={8}
            resumeAtFrame={5}
            onOpen={() => setState(DeliveryState.Seen)}
            onDismiss={() => setState(DeliveryState.Dismissed)}
          />
          <button
            type="button"
            onClick={() => setState(DeliveryState.Available)}
            className="w-fit rounded-10 border border-border-subtlest-tertiary px-3 py-1.5 text-text-tertiary typo-footnote"
          >
            Reset to Monday
          </button>
        </div>
      );
    };

    return (
      <Page>
        <PageHeader eyebrow="Replay" title="The card across one week">
          <p>
            Open it and it collapses. Dismiss it and it is gone. Either way the
            state is keyed to the ISO week, so Monday brings it back and nothing
            in between does.
          </p>
        </PageHeader>
        <Section title="Interactive">
          <Demo />
        </Section>
      </Page>
    );
  },
};
