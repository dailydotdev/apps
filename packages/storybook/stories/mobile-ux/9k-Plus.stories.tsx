import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Status,
  Table,
  Verdict,
} from './kit';
import { PlusCheckoutStill } from './openCallMocks';
import { YouScroll } from './scrollPages';
import {
  HomePlusScroll,
  PlusLook,
  PlusState,
  YouPlusRowSpecimens,
  plusCases,
  plusLookNotes,
  plusRules,
  plusStateNotes,
} from './plusMocks';

const meta: Meta = {
  title: 'Mobile UX/9k. Plus on Home',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const today: [string, string][] = [
  ['UpgradeToPlus', 'A Bacon primary button with the DevPlus glyph and “Upgrade to Plus” (short copy on small screens, the sale label during a sale). Returns null for members. Fires UpgradeSubscription with a target per placement. On phones today it lives in the profile menu, not in a header.'],
  ['PlusMobileEntryBanner', 'The gradient card under the For you tab behind plus_entry_mobile (off): lead-in, description, CTA, Close; fires ClickPlusFeature and MarketingCtaDismiss.'],
  ['The logo’s Plus mark', 'HeaderLogo passes isPlus to Logo, which draws a Plus mark on the wordmark for members. It is the member indicator that already exists.'],
  ['PlusUserBadge', 'The Plus glyph next to a member’s name, with “Plus member since” in a tooltip. Used on profiles and in lists, not in headers.'],
  ['The states', 'usePlusSubscription: isPlus, status (active, cancelled, expired, none) and provider (Paddle, Apple StoreKit); Manage goes to Paddle’s portal or App Store subscriptions. usePlusSale: whether a sale runs and its label. Gifts: GiftReceivedPlusModal on the next visit.'],
  ['The You page', 'Decided in 9b: daily.dev Plus is the first row behind the avatar.'],
];

export const Plus: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s ask, 1 Oct: a Plus button on Home and an indicator for members"
        title="One quiet door on Home for free members, between the streak and the avatar; the Plus mark on the logo for members; the You row carrying the state. Four looks for the door, six states, ten cases. Decided: the icon square."
      >
        <p>
          Everything here is built from what the app has: UpgradeToPlus,
          the logo’s Plus mark, the subscription states, the sale, the You
          row decided in 9b. No new state, no new data, no flag (9j). The
          question is only where the door sits on Home and how a member is
          shown.
        </p>
        <ChapterNav current="9k" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi, 1 Oct 2026: the door is the icon square, placed
        between the streak and the avatar. The indicator is the logo’s Plus
        mark, as recommended; the states, cases and rules follow.
      </Status>

      <Goal
        goal="A free member can reach Plus from Home in one tap without the row getting louder, and a member sees they are Plus without a second mark."
        metric="Plus page opens from Home per free member; no drop in avatar taps; upgrade rate from the Home door read after the step ships."
      />

      <Section title="What exists today" description="Six things, so nothing is reinvented.">
        <Table
          head={['Thing', 'Today']}
          rows={today.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
      </Section>

      <Section
        title="The door: four looks"
        description="A free member on Home. Scroll each: the door is part of the brand row and hides with it. Decided: the icon square, between the streak and the avatar."
      >
        <PhoneRow>
          <Cell label="1 · The icon square" verdict={Verdict.Ship} note={plusLookNotes[PlusLook.Square]}>
            <HomePlusScroll look={PlusLook.Square} />
          </Cell>
          <Cell label="2 · The chip" verdict={Verdict.Skip} note={plusLookNotes[PlusLook.Chip]}>
            <HomePlusScroll look={PlusLook.Chip} />
          </Cell>
          <Cell label="3 · The banner under the segments" verdict={Verdict.Skip} note={plusLookNotes[PlusLook.Banner]}>
            <HomePlusScroll look={PlusLook.Banner} />
          </Cell>
          <Cell label="4 · Nothing on Home, the You row only" verdict={Verdict.Skip} note={plusLookNotes[PlusLook.YouOnly]}>
            <HomePlusScroll look={PlusLook.YouOnly} />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the square">
            9c allowed at most one quiet thing between the logo and the
            avatar, the avatar’s size, never a filled button. Tsahi asked for
            a door on Home, so the row takes a second thing; the square is the
            only look that stays quiet while doing it. It is the top-button
            material and size every other control uses, in the Plus colour so
            it reads as Plus without a word. During a sale the chip would
            show the label; the square does not, and the You row and the
            banner do.
          </Callout>
          <Callout title="What the others cost">
            The chip is production’s button and the clearest, but it is a
            filled block beside the streak and the avatar: three marks on one
            line. The banner is content and dismissable, which is why it is
            a promotion, not a door. Nothing on Home is what 9b decided and
            what Tsahi asked to go beyond.
          </Callout>
        </div>
      </Section>

      <Section
        title="The indicator: the six states"
        description="The square look through the states the app has. Members lose the door and gain the mark on the logo, exactly as HeaderLogo draws it today."
      >
        <PhoneRow>
          {[PlusState.Free, PlusState.Member, PlusState.Cancelled].map((state) => (
            <Cell key={state} label={state} verdict={Verdict.Ship} note={plusStateNotes[state]}>
              <HomePlusScroll look={PlusLook.Square} state={state} />
            </Cell>
          ))}
        </PhoneRow>
        <PhoneRow>
          {[PlusState.Expired, PlusState.Organization].map((state) => (
            <Cell key={state} label={state} verdict={Verdict.Ship} note={plusStateNotes[state]}>
              <HomePlusScroll look={PlusLook.Square} state={state} />
            </Cell>
          ))}
          <Cell label="sale (the chip, for comparison)" verdict={Verdict.Skip} note={plusStateNotes[PlusState.Sale]}>
            <HomePlusScroll look={PlusLook.Chip} state={PlusState.Sale} />
          </Cell>
        </PhoneRow>
        <Callout tone={CalloutTone.Good} title="Why the logo’s mark and not a badge on the avatar">
          The mark exists, members know it from the desktop header, and it
          sits where the brand is. A badge on the avatar would be a second
          mark for the same fact and would collide with the rounded-square
          avatar’s corner. One indicator, already shipped.
        </Callout>
      </Section>

      <Section
        title="The You row, per state"
        description="The first row behind the avatar carries the state: Upgrade, Manage, Renew, Ends on, Through the organization. Home never says which."
      >
        <div className="flex flex-wrap items-start gap-8">
          <YouPlusRowSpecimens />
          <Cell label="You, a free member" note="The row as decided in 9b, first in the list.">
            <YouScroll />
          </Cell>
          <Cell label="The Plus page" note="Where the door leads: the no-shell class from 9b. PlusIOS with StoreKit inside the iOS wrapper, the web checkout elsewhere.">
            <PlusCheckoutStill />
          </Cell>
        </div>
      </Section>

      <Section title="Every case" description="Who, what shows on Home, what marks them, and where it leads.">
        <Table
          head={['Case', 'The door', 'The indicator', 'Also']}
          rows={plusCases.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
          ])}
        />
      </Section>

      <Section title="The rules" description="Six lines.">
        <Table
          head={['Rule', 'Detail']}
          rows={plusRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Quote>One quiet door on Home, the mark on the logo, the state in the You row.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9k" />
      </Section>
    </Page>
  ),
};
