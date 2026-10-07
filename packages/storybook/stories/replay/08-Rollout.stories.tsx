import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { catalog, Status } from './catalog';

const meta: Meta = {
  title: 'Replay/08. Rollout',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'How this ships, what it is called, and the decisions still open.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const shipsNow = catalog.filter(
  (candidate) => candidate.status === Status.Now,
).length;

export const Rollout: Story = {
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay" title="Four phases, and the first needs no backend">
        <p>
          {shipsNow} of {catalog.length} candidates read fields that already
          exist and already accept an arbitrary window, so a real weekly recap
          can ship before daily-api changes anything.
        </p>
      </PageHeader>

      <Section title="Phases">
        <Table
          head={['Phase', 'What ships', 'Notes']}
          minWidth={60}
          rows={[
            [
              <span className="font-bold text-text-primary">P0</span>,
              'This Storybook.',
              'Catalog, engine, every frame, the viewer, the card, the delivery rules. Everything here runs the real selector, so the arguing happens before the building.',
            ],
            [
              <span className="font-bold text-text-primary">P1</span>,
              'Weekly recap, computed on the client.',
              <>
                Ships-now candidates only, behind a <Mono>weekly_recap</Mono>{' '}
                flag defaulting to <Mono>false</Mono>. Never default an
                experiment flag to true: the default is the control value.
              </>,
            ],
            [
              <span className="font-bold text-text-primary">P2</span>,
              'Server-side engine.',
              <>
                A <Mono>recap(window:)</Mono> root field plus a window-snapshot
                table. Ranking moves off the client, the API-gated candidates
                unlock, and availability joins <Mono>SHELL_STATE_QUERY</Mono>{' '}
                rather than becoming a new shell query.
              </>,
            ],
            [
              <span className="font-bold text-text-primary">P3</span>,
              'Delivery and cadence two.',
              'Monday notification and email. December turns on the annual window with the flagship frames. No new engine.',
            ],
          ]}
        />
      </Section>

      <Section
        title="How P1 fetches without hurting the feed"
        description="The recap needs four or five queries. None of them may touch the critical path."
      >
        <Table
          head={['Rule', 'Why']}
          minWidth={48}
          rows={[
            [
              'Queries fire when the card enters the viewport, never on feed paint',
              'The feed and the post query stay on the paint-blocking path. A recap is not worth a millisecond of feed render.',
            ],
            [
              <>
                Batched through <Mono>gqlBatchRequest</Mono>
              </>,
              'Four separate round trips for a card most people scroll past is not defensible. Batching coalesces them into one POST behind the existing flag.',
            ],
            [
              'Availability is one boolean, computed locally',
              'Whether a recap exists this week is an ISO-week comparison against a stored key. It needs no network at all, so the card can decide whether to render before anything is fetched.',
            ],
            [
              'Nothing fetches for logged-out users',
              'The whole feature is authenticated. Gate on it before anything else runs.',
            ],
          ]}
        />
      </Section>

      <Section title="The name">
        <Callout title="Replay is a placeholder that avoids two real collisions">
          <p>
            <Mono>Highlight</Mono> is taken: <Mono>graphql/highlights.ts</Mono>,{' '}
            <Mono>FeedItemType.Highlight</Mono> and the{' '}
            <Mono>/highlights</Mono> page are editorial post headlines.{' '}
            <Mono>Spotlight</Mono> is taken too: <Mono>graphql/spotlight.ts</Mono>{' '}
            is the command palette. Neither can name this feature without making
            both harder to talk about.
          </p>
          <p>
            Alternates worth considering: Rewind, Your Week, or just the week
            number.
          </p>
        </Callout>
      </Section>

      <Section title="Still open">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Neutral} title="Does Plus change anything?">
            <p>
              A higher cap, a different frame set, or nothing at all. My instinct
              is nothing: a recap that is visibly worse because you did not pay
              is a bad first impression of Plus, and the whole point is that the
              artifact leaves the app.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Neutral} title="How hard do we push the community frames?">
            <p>
              Three of the five Community candidates are API-blocked, and they
              are the only ones that buy a loop rather than reach. If the
              connection graph is not coming, the weekly recap is a retention
              feature with a share rate, and we should size expectations that
              way.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Neutral} title="Feed impressions per user">
            <p>
              Powers <Mono>selectivity</Mono>, the one card that turns a
              bare read count into a choice the person made. Smaller gap than
              it was: the content cards it also fed are out of scope now.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Neutral} title="Who writes the copy?">
            <p>
              Every frame line in the catalog is written to ship, not to
              illustrate. They are mine, and they should get a proper pass from
              whoever owns voice before P1.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="What would make me wrong">
        <Callout tone={CalloutTone.Bad} title="The honest risk">
          <p>
            A weekly solo recap has neither of the two things that make this
            category work: it has no time scarcity, and until the community
            frames unblock, it has nobody else in the picture. The category
            anchors, novelty decay and per-frame sharing are all attempts to
            compensate for that, and they are unproven.
          </p>
          <p>
            The number that will tell us early is week-four open rate. If people
            who opened week one are not opening week four, the catalog is too
            thin to sustain a weekly cadence and the right move is to slow it to
            monthly rather than add more frames.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};
