import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
  Table,
} from '../shell';
import { byId } from '../catalog';
import { sampleData } from '../data';
import { FrameStyles, FrameThumb } from '../frames';
import { FeedCard } from '../FeedCard';
import { DeliveryState } from '../ranking';
import {
  defaultBubbles,
  HeaderBar,
  MockFeed,
  PostCard,
  StoryTray,
} from '../FeedMocks';
import { Avatar } from '../people';
import { HERO, HERO_CLAIM, ME, Thumb, Variant, WEEK } from './mocks';

const meta: Meta = {
  title: 'Replay delivery/01. In the feed',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'How the weekly Replay enters the main feed: seven entry points, the states each one passes through during the week, and the one to ship.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

/* -------------------------------------------------------------------------- */
/* Entry points                                                                */
/* -------------------------------------------------------------------------- */

/** Slot one, two columns wide. The claim is the headline, the card is proof. */
const HeroSlot = ({ compact = false }: { compact?: boolean }): ReactElement => (
  <div
    className="col-span-2 flex items-stretch gap-5 overflow-hidden rounded-16 border border-border-subtlest-tertiary p-4"
    style={{
      background:
        'radial-gradient(120% 140% at 0% 0%, rgba(206,61,243,.16) 0%, transparent 55%), var(--theme-surface-float)',
    }}
  >
    <FrameStyles />
    <FrameThumb width={compact ? 96 : 128} candidate={HERO} data={sampleData[HERO.id]} />
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1">
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-2 text-text-quaternary typo-caption1">
          <Avatar person={ME} size={18} />
          Your Replay · {WEEK}
        </span>
        <span className="text-text-primary typo-title3">{HERO_CLAIM}</span>
        <span className="text-text-tertiary typo-footnote">
          Four more cards about your week. One of them is rarer than this one.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-12 bg-text-primary px-4 py-2 font-bold text-surface-invert typo-callout">
          Open your Replay
        </span>
        <span className="flex items-center gap-1.5 px-2">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className={
                dot === 0
                  ? 'h-1.5 w-4 rounded-[999px] bg-text-primary'
                  : 'h-1.5 w-1.5 rounded-[999px] bg-border-subtlest-secondary'
              }
            />
          ))}
        </span>
      </div>
    </div>
  </div>
);

/** A strip that quotes the claim instead of counting moments. */
const ClaimStrip = ({ seen = false }: { seen?: boolean }): ReactElement => (
  <div className="flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-3 py-2.5">
    <Thumb id={HERO.id} width={28} />
    <span className="flex flex-1 flex-col">
      <span className="font-bold text-text-primary typo-footnote">
        {seen ? 'Your Replay, week 37' : HERO_CLAIM}
      </span>
      <span className="text-text-quaternary typo-caption2">
        {seen ? '5 cards · seen Monday' : '5 cards about your week · 40 seconds'}
      </span>
    </span>
    <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">
      {seen ? 'Again' : 'Open'}
    </span>
  </div>
);

/** One card from inside the deck, dropped mid-feed as a teaser for the rest. */
const Teaser = (): ReactElement => {
  const tease = byId('persona.week');
  return (
    <div className="flex h-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
      <FrameStyles />
      <div className="flex items-center gap-2 text-text-quaternary typo-caption1">
        <Avatar person={ME} size={20} />
        From your Replay · 2 of 5
      </div>
      <div className="flex justify-center">
        <FrameThumb width={150} candidate={tease} data={sampleData[tease.id]} />
      </div>
      <span className="text-center font-bold text-text-primary typo-footnote">
        See the other four →
      </span>
    </div>
  );
};

/** First session of the week on a phone: a sheet, once, then never again. */
const MondaySheet = (): ReactElement => (
  <PhoneFrame>
    <div className="relative h-[34rem] overflow-hidden rounded-[1.75rem] bg-background-default">
      <div className="flex flex-col gap-3 p-3 opacity-40">
        <HeaderBar unread={false} />
        <PostCard index={0} />
        <PostCard index={1} />
      </div>
      <div className="absolute inset-0 bg-overlay-quaternary-onion" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 rounded-t-24 border-t border-border-subtlest-tertiary bg-background-default p-5 pt-3">
        <span className="h-1 w-10 rounded-[999px] bg-border-subtlest-secondary" />
        <Thumb id={HERO.id} width={132} />
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-text-primary typo-title3">{HERO_CLAIM}</span>
          <span className="text-text-tertiary typo-footnote">
            Your week 37 Replay. Five cards, forty seconds.
          </span>
        </div>
        <span className="w-full rounded-12 bg-text-primary py-2.5 text-center font-bold text-surface-invert typo-callout">
          Open
        </span>
        <span className="-mt-2 font-bold text-text-tertiary typo-callout">Later today</span>
      </div>
    </div>
  </PhoneFrame>
);

const Mobile = ({ children }: { children: ReactNode }): ReactElement => (
  <PhoneFrame>
    <div className="flex flex-col gap-3 rounded-[1.75rem] bg-background-default p-2">
      {children}
    </div>
  </PhoneFrame>
);

export const EntryPoints: Story = {
  name: 'Seven entry points',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="Where the week shows up in the feed">
        <p>
          The Replay exists to be opened on Monday and posted by Tuesday. The
          feed is where nearly everyone will meet it, so the entry point decides
          the open rate before any card is seen. Seven ways in, each rendered in
          a real feed, desktop and phone, with the claim from the hero card doing
          the work every time. None of them says &quot;your recap is ready&quot;.
        </p>
      </PageHeader>

      <Section
        title="A · The hero slot"
        description="Slot one, two columns wide on desktop, full width on a phone. The claim is the headline and the card is the proof. Highest open rate, highest cost: it displaces a post."
      >
        <MockFeed injected={<HeroSlot />} at={0} count={4} />
        <Mobile>
          <HeaderBar unread={false} />
          <div className="grid grid-cols-2 gap-3">
            <HeroSlot compact />
          </div>
          <PostCard index={0} />
        </Mobile>
      </Section>

      <Section
        title="B · A native card"
        description="One slot, shaped like a post. Sits at position three where the Highlight card sits today. The existing FeedCard, in its Monday state."
      >
        <MockFeed
          injected={
            <FeedCard
              candidate={HERO}
              data={sampleData[HERO.id]}
              state={DeliveryState.Available}
              frameCount={5}
            />
          }
          at={2}
          count={5}
        />
      </Section>

      <Section
        title="C · The claim strip"
        description="One row above the feed, no slot taken. Quotes the claim, offers Open. This is the shape the week decays into after Monday."
      >
        <MockFeed above={<ClaimStrip />} count={3} />
        <Mobile>
          <HeaderBar unread={false} />
          <ClaimStrip />
          <PostCard index={2} />
        </Mobile>
      </Section>

      <Section
        title="D · The tray"
        description="Apple Health rings above the feed. Each bubble is a card; the unseen ring is the affordance. Persistent for the week without ever taking a slot, and the only entry point that shows there is more than one thing inside."
      >
        <MockFeed above={<StoryTray bubbles={defaultBubbles} />} count={3} />
      </Section>

      <Section
        title="E · The bell only"
        description="No feed real estate at all. A dot on the Replay icon in the header, and the notification center row (02) does the rest. Cheapest, quietest, lowest open rate; the floor every other option is measured against."
      >
        <MockFeed above={<HeaderBar unread />} count={3} />
      </Section>

      <Section
        title="F · A card from inside, mid-feed"
        description="Not the entry card: the second card of the deck dropped at slot five as a teaser. The reader has already seen one insight and the other four are a tap away. Works on the day after Monday for people who scrolled past A."
      >
        <MockFeed injected={<Teaser />} at={4} count={6} />
      </Section>

      <Section
        title="G · The Monday sheet"
        description="First session of the week on a phone opens a bottom sheet with the hero card. Interrupts once, then the strip takes over. Highest open rate on mobile; the one to A/B against A, not to combine with it."
      >
        <div className="flex flex-wrap gap-6">
          <MondaySheet />
          <Callout tone={CalloutTone.Bad} title="Why it stays a test">
            <p>
              Interruptive surfaces convert on week one and get dismissed on
              reflex by week four. If it ships, it ships only for the first
              Replay a person ever gets, and the feed card carries every week
              after that.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="Side by side">
        <Table
          head={['Entry point', 'Feed cost', 'Interrupts', 'Shows the claim', 'Survives the week', 'Expected open rate']}
          minWidth={64}
          rows={[
            ['A · Hero slot', 'One slot, two columns', 'No', 'Yes', 'Monday only, then C', 'Highest of the non-interruptive'],
            ['B · Native card', 'One slot', 'No', 'Yes', 'Mon to Wed', 'High'],
            ['C · Claim strip', 'One row', 'No', 'Yes', 'All week', 'Medium'],
            ['D · Tray', 'One row', 'No', 'No, shows cards', 'All week', 'Medium, rises with habit'],
            ['E · Bell only', 'None', 'No', 'No', 'All week', 'Low'],
            ['F · Mid-feed teaser', 'One slot, day two', 'No', 'Shows a card', 'Tue to Thu', 'Medium'],
            ['G · Monday sheet', 'None', 'Yes, once', 'Yes', 'First session only', 'Highest, decays fast'],
          ]}
        />
      </Section>
    </Page>
  ),
};

/* -------------------------------------------------------------------------- */
/* The week                                                                    */
/* -------------------------------------------------------------------------- */

export const TheWeek: Story = {
  name: 'How the week decays',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery" title="One Replay, seven days, four shapes">
        <p>
          The same Replay should not be handed to a daily visitor six days
          running at full size. It arrives loud on Monday and gets smaller every
          time it is ignored, until Sunday, when only the bell remembers it.
          Opening it at any point collapses it straight to the seen row.
        </p>
      </PageHeader>

      <Section title="Unopened, day by day">
        <div className="grid gap-6 tablet:grid-cols-2">
          <Variant label="Monday" note="The hero slot. Once per week, first session.">
            <MockFeed injected={<HeroSlot compact />} at={0} count={2} columns={2} />
          </Variant>
          <Variant label="Tuesday and Wednesday" note="The native card at slot three, or the teaser at slot five on the second day.">
            <MockFeed
              injected={
                <FeedCard candidate={HERO} data={sampleData[HERO.id]} state={DeliveryState.Available} frameCount={5} />
              }
              at={1}
              count={3}
              columns={2}
            />
          </Variant>
          <Variant label="Thursday to Saturday" note="The claim strip. No slot, one row.">
            <MockFeed above={<ClaimStrip />} count={2} columns={2} />
          </Variant>
          <Variant label="Sunday" note="Bell only. Monday's Replay replaces it.">
            <MockFeed above={<HeaderBar unread />} count={2} columns={2} />
          </Variant>
        </div>
      </Section>

      <Section title="After it was opened">
        <div className="flex flex-wrap items-start gap-6">
          <Variant label="Seen" note="A single row, all week. Nothing at full size again.">
            <FeedCard candidate={HERO} data={sampleData[HERO.id]} state={DeliveryState.Seen} frameCount={5} />
          </Variant>
          <Variant label="Left half way" note="Deep-links back to the card they stopped on.">
            <FeedCard candidate={HERO} data={sampleData[HERO.id]} state={DeliveryState.Resumable} frameCount={5} resumeAtFrame={3} />
          </Variant>
          <Variant label="Dismissed" note="Gone until Monday. The dismissal is the only signal the person gives us for free.">
            <FeedCard candidate={HERO} data={sampleData[HERO.id]} state={DeliveryState.Dismissed} frameCount={5} />
          </Variant>
        </div>
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="One surface at a time">
            <p className="text-text-tertiary typo-footnote">
              Never the hero slot and the strip together, never the tray and a
              card. The decay picks one shape per day; the notification center
              row (02) is the only thing that stays alongside it.
            </p>
          </Cell>
          <Cell label="The claim is the copy, everywhere">
            <p className="text-text-tertiary typo-footnote">
              Every shape quotes the hero card&apos;s standing line. &quot;Your
              week is ready&quot; and &quot;8 moments&quot; tell the reader
              nothing about themselves, which is the one thing Replay is for.
            </p>
          </Cell>
          <Cell label="Catch-up follows the same ladder">
            <p className="text-text-tertiary typo-footnote">
              Someone back after eleven days gets the catch-up Replay in the hero
              slot on their first session, whatever the weekday, then the same
              decay from there.
            </p>
          </Cell>
          <Cell label="Two dismissals in a row lowers the volume">
            <p className="text-text-tertiary typo-footnote">
              Dismiss Monday twice running and the following week starts at the
              strip, not the hero slot. Open it once and the ladder resets.
            </p>
          </Cell>
        </div>
        <Callout tone={CalloutTone.Good} title="The pick">
          <p>
            <Mono>A</Mono> on Monday, <Mono>B</Mono> for two days, <Mono>C</Mono>{' '}
            for the rest of the week, with <Mono>G</Mono> as the first-ever-Replay
            test on mobile. The tray is the right shape for a product that has
            several weekly stories; today it has one, so it waits.
          </p>
        </Callout>
      </Section>
    </Page>
  ),
};
