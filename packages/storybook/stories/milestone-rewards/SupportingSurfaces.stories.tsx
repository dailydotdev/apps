import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  FeedBackdrop,
  Page,
  PageHeader,
  Section,
} from './shell';
import { milestones, offers } from './data';
import { RewardCardState } from './RewardCard';
import type { VaultEntry } from './GiftVault';
import { GiftVault, VaultEmptyState } from './GiftVault';
import {
  FeedGiftCard,
  GiftToast,
  HeaderGiftEntry,
  StreakPanelGiftRow,
} from './QuietGift';

const meta: Meta = {
  title: 'Milestone Rewards/5. Supporting surfaces',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const entries: VaultEntry[] = [
  {
    offer: offers.disneyplus,
    state: RewardCardState.Idle,
    earnedFor: 'your day 30 streak',
  },
  {
    offer: offers.notion,
    state: RewardCardState.Idle,
    earnedFor: 'your day 7 streak',
  },
  {
    offer: offers.applemusic,
    state: RewardCardState.Claimed,
    earnedFor: 'your day 90 streak',
  },
  {
    offer: offers.audible,
    state: RewardCardState.Expired,
    earnedFor: 'a day 7 streak in June',
  },
];

export const SupportingSurfaces: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Everything that is not the popup"
        title="The vault is what lets the popup be calm"
      >
        <p>
          Every pushy pattern in reward programmes exists to solve one problem:
          the offer disappears when the popup closes, so the popup has to fight
          for the decision. Give the gift a permanent home and the fight is
          unnecessary. Closing costs nothing, expiry can be generous, and
          &quot;keep it for later&quot; stops being a euphemism for throwing it
          away.
        </p>
        <p>
          The toast is the other half of that: on a streak day with no sponsored
          gift, or for a user who has ignored two popups in a row, this is the
          entire announcement.
        </p>
      </PageHeader>

      <Section
        title="Gift vault"
        description="Grouped by what the user can act on. Every entry says which streak day earned it, because that is the part that makes it feel owned."
      >
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-[36rem] max-w-full">
            <GiftVault entries={entries} />
          </div>
          <div className="w-[26rem] max-w-full">
            <VaultEmptyState />
          </div>
        </div>
      </Section>

      <Section
        title="Toast"
        description="Bottom-left, over the feed, self-expiring. Names the streak day before it names the brand, and never takes the screen."
      >
        <div className="relative flex h-[380px] w-full items-end overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
          <FeedBackdrop />
          <GiftToast
            className="relative"
            milestone={milestones.week}
            offer={offers.duolingo}
          />
        </div>
      </Section>

      <Section
        title="Entry points"
        description="With the popup gone, these are the only voice the programme has. All three point at the same vault."
      >
        <div className="flex flex-wrap items-start gap-10">
          <Cell label="Header" note="Count badge, cleared on open">
            <HeaderGiftEntry count={2} />
          </Cell>
          <Cell label="Header, nothing waiting" note="No badge, no nag">
            <HeaderGiftEntry count={0} />
          </Cell>
          <Cell
            label="Streak panel row"
            note="Inside the sidebar streak popup, next to the streak that earned it"
          >
            <StreakPanelGiftRow offer={offers.disneyplus} />
          </Cell>
          <Cell label="In the feed" note="Pushes content down, dismissible for good">
            <div className="w-[30rem] max-w-full">
              <FeedGiftCard
                milestone={milestones.week}
                offer={offers.notion}
              />
            </div>
          </Cell>
        </div>
      </Section>

      <Section title="Rules for these surfaces">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Two ignores drop you here">
            After two popups passed on in a row, sponsored days become toast-only
            for 60 days. Not interested is an answer, and this is how the product
            hears it.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Expiry warns before it happens">
            Three days out, one notification. An expiry that arrives silently is
            worse than no vault at all.
          </Callout>
          <Callout title="Server-side ownership">
            The gift is written when the streak day fires, not when the user
            taps. Client-side persistence loses gifts on a device switch, which
            breaks the promise the whole design rests on.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Hide the badge when it is empty">
            A vault full of expired offers nobody wanted is a museum of our worst
            inventory decisions. No gifts waiting means no badge.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
