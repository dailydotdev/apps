import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { format } from 'date-fns';
import {
  Callout,
  CalloutTone,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { Mode } from './catalog';
import type { DeliveryInput } from './ranking';
import {
  CATCH_UP_MAX_DAYS,
  DeliveryState,
  resolveDelivery,
} from './ranking';

const meta: Meta = {
  title: 'Replay/05. Delivery and cadence',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'When the recap appears, what window it covers, and what happens when someone disappears for a fortnight.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

// Week 37 of 2026 runs Monday 7 September to Sunday 13 September.
const at = (day: number, hour = 9): Date =>
  new Date(2026, 8, day, hour, 0, 0);

interface Scenario {
  title: string;
  note: string;
  input: DeliveryInput;
}

const scenarios: Scenario[] = [
  {
    title: 'Monday, daily visitor',
    note: 'The intended path. Generated at 00:00 in their timezone, opened the same morning.',
    input: { now: at(7), lastVisitAt: at(6), handledWeek: null },
  },
  {
    title: 'Tuesday, missed Monday',
    note: 'They did not open the app on Monday. They get the identical recap, unchanged, on Tuesday.',
    input: { now: at(8), lastVisitAt: at(6), handledWeek: null },
  },
  {
    title: 'Saturday, first session of the week',
    note: 'Still the same recap. It is claimable for the whole week, so a weekend-only reader is never skipped.',
    input: { now: at(12), lastVisitAt: at(5), handledWeek: null },
  },
  {
    title: 'Wednesday, already watched it',
    note: 'Opened Monday and finished. Collapses to a row for the rest of the week.',
    input: { now: at(9), lastVisitAt: at(8), handledWeek: '2026-W37' },
  },
  {
    title: 'Wednesday, left part-way',
    note: 'Opened Monday, stopped on frame five. The card deep-links back rather than restarting.',
    input: {
      now: at(9),
      lastVisitAt: at(8),
      handledWeek: '2026-W37',
      resumeAtFrame: 5,
    },
  },
  {
    title: 'Wednesday, dismissed it',
    note: 'Explicitly closed. Nothing again until the next Monday, never a re-prompt.',
    input: {
      now: at(9),
      lastVisitAt: at(8),
      handledWeek: '2026-W37',
      dismissed: true,
    },
  },
  {
    title: 'Back after eleven days',
    note: 'The window stops being the ISO week. It runs from their last visit, and the copy names the absence.',
    input: { now: at(9), lastVisitAt: new Date(2026, 7, 29, 9), handledWeek: null },
  },
  {
    title: 'Back after forty days',
    note: 'Capped at 28 days, so a lapsed account does not receive an accidental mini-annual.',
    input: { now: at(9), lastVisitAt: new Date(2026, 6, 31, 9), handledWeek: null },
  },
  {
    title: 'Brand new account',
    note: 'No previous session at all. Weekly mode, and the guaranteed frames carry the whole recap.',
    input: { now: at(9), lastVisitAt: null, handledWeek: null },
  },
];

const stateClass: Record<DeliveryState, string> = {
  [DeliveryState.Available]: 'text-accent-avocado-default',
  [DeliveryState.Resumable]: 'text-accent-cheese-default',
  [DeliveryState.Seen]: 'text-text-tertiary',
  [DeliveryState.Dismissed]: 'text-text-quaternary',
};

export const Delivery: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Replay"
        title="Generated on a schedule, delivered on arrival"
      >
        <p>
          Generation is push and delivery is pull. The recap for the week that
          just closed is built Monday at 00:00 in the user&apos;s own timezone,
          then sits claimable for seven days. Whoever opens the app on Monday
          sees it on Monday; whoever opens it on Saturday sees the same thing on
          Saturday.
        </p>
        <p>
          Everything is deduped against one key, the ISO week, so a person who
          visits every day is interrupted exactly once.
        </p>
      </PageHeader>

      <Section
        title="Every scenario, run through the real resolver"
        description="These rows are computed by resolveDelivery, not written by hand."
      >
        <Table
          head={['Scenario', 'State', 'Mode', 'Window covered', 'Why']}
          minWidth={72}
          rows={scenarios.map(({ title, note, input }) => {
            const delivery = resolveDelivery(input);

            return [
              <span className="flex flex-col gap-1">
                <span className="font-bold text-text-primary">{title}</span>
                <span className="text-text-quaternary typo-caption2">
                  {note}
                </span>
              </span>,
              <span
                className={`font-bold ${stateClass[delivery.state]}`}
              >
                {delivery.state}
              </span>,
              <Mono>{delivery.mode}</Mono>,
              <span className="whitespace-nowrap font-mono typo-caption2">
                {format(delivery.window.after, 'd MMM')} to{' '}
                {format(delivery.window.before, 'd MMM')}
              </span>,
              delivery.reason,
            ];
          })}
        />
      </Section>

      <Section title="The three rules underneath">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Once per week, not once on Monday">
            <p>
              The card appears on the first session inside the ISO week,
              whichever day that is, and never again that week once handled.
              Missing Monday costs nobody their recap.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Absence changes the window, not just the copy">
            <p>
              Past <Mono>7</Mono> days away the recap switches to catch-up mode
              and reports the gap itself. Handing someone who vanished for eleven
              days a recap of a week they were not here for is worse than not
              sending one.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Never two recaps at once">
            <p>
              A person away for three weeks does not get three recaps queued up.
              One catch-up recap, capped at {CATCH_UP_MAX_DAYS} days, covering
              the whole absence.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="Catch-up mode swaps in different frames"
        description="Two catalog entries are catch-up only, and they exist to name the absence honestly rather than paper over it."
      >
        <Table
          head={['id', 'What it says', 'Why it only fires here']}
          minWidth={52}
          rows={[
            [
              <Mono>away.missed</Mono>,
              '"Eleven days. The feed kept going." 214 posts in their tags.',
              'Turns an absence into a reason to scroll rather than a guilt trip. Needs the feed-impressions gap.',
            ],
            [
              <Mono>away.streakLost</Mono>,
              '"Your 22-day streak ended on the 4th." Best is still 31, recoverable this week.',
              'They already know. Saying it first, with the recovery path attached, is better than pretending the streak page will break the news.',
            ],
          ]}
        />
        <Callout title="Where this goes next">
          Delivery is in-app for P1. P3 adds the Monday notification and email,
          and RiseUp is the model worth copying there: they push the personalised
          snapshot into WhatsApp rather than waiting for someone to open an app
          tab. The recap is a better push notification than anything else we
          send.
        </Callout>
      </Section>

      <Section title="Cadence two, same machine">
        <Table
          head={['', 'Weekly', 'Annual']}
          minWidth={44}
          rows={[
            ['Mode', <Mono>{Mode.Weekly} / {Mode.CatchUp}</Mono>, <Mono>annual</Mono>],
            ['Key', '2026-W37', '2026'],
            ['Generated', 'Monday 00:00, user timezone', 'First week of December'],
            ['Claimable for', '7 days', 'The rest of December'],
            ['Cap', '8 frames plus closer', '12 frames plus closer'],
          ]}
        />
      </Section>
    </Page>
  ),
};
