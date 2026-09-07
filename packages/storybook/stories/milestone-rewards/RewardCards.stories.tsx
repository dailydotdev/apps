import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout, CalloutTone, Cell, Page, PageHeader, Section } from './shell';
import { offerList, offers } from './data';
import { RewardCard, RewardCardState, RewardCardVariant } from './RewardCard';

const meta: Meta = {
  title: 'Milestone Rewards/6. Card variants (band, tiles, rows)',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const annotations = [
  [
    'Sponsor line',
    'Names the brand and the word sponsored, on the cover, before anything else is read. Not a footnote.',
  ],
  [
    'Value pill',
    'What the gift is worth in money. Vague generosity is what makes an offer feel like bait.',
  ],
  [
    'Offer headline',
    'The concrete thing you get: duration, plan, price. Written by us from the partner feed, never lifted as ad copy.',
  ],
  [
    'Brand paint',
    'Partner colour lives inside the cover only. It never bleeds into the milestone half of the screen.',
  ],
  [
    'Expiry',
    '"Yours for 14 days" is a real window, stated calmly. No countdown, no urgency theatre.',
  ],
  [
    'Not my thing',
    'One tap to mute the category for 90 days. The control that turns a feed of offers into a feed of perks.',
  ],
];

export const Anatomy: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="The primitive"
        title="One card, three shapes. Every gift on every surface is this component."
      >
        <p>
          The card carries the disclosure, so a gift cannot appear anywhere in
          the product without saying who paid for it. That is a deliberate
          structural choice rather than a copy guideline: there is no way to
          render an offer here without the sponsor line coming with it.
        </p>
      </PageHeader>

      <Section title="Anatomy">
        <div className="flex flex-wrap items-start gap-10">
          <RewardCard
            offer={offers.disneyplus}
            variant={RewardCardVariant.Hero}
            className="w-[22rem]"
            onNotForMe={() => undefined}
          />
          <ol className="flex max-w-[38rem] flex-col gap-4">
            {annotations.map(([label, detail]) => (
              <li key={label} className="flex flex-col">
                <span className="font-bold typo-callout">{label}</span>
                <span className="text-text-tertiary typo-footnote">
                  {detail}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section
        title="Shapes"
        description="Banner for the wide popups, tile when the user is picking between three, row for the vault and inline placements. Hero is the portrait shape, kept for narrow surfaces and mobile."
      >
        <div className="flex flex-col gap-8">
          <Cell
            label="Banner"
            note="Landscape. The shape the Ember band popup uses."
          >
            <div className="max-w-[40rem]">
              <RewardCard
                offer={offers.notion}
                variant={RewardCardVariant.Banner}
                onNotForMe={() => undefined}
              />
            </div>
          </Cell>
          <div className="grid items-start gap-8 laptop:grid-cols-3">
            <Cell label="Hero" note="Portrait. Mobile drawer and narrow columns.">
              <RewardCard
                offer={offers.applemusic}
                variant={RewardCardVariant.Hero}
                onNotForMe={() => undefined}
              />
            </Cell>
            <Cell label="Tile" note="Side by side, three across">
              <RewardCard
                offer={offers.hulu}
                variant={RewardCardVariant.Tile}
              />
            </Cell>
            <Cell label="Row" note="Vault lists, feed placements, sidebar">
              <RewardCard offer={offers.nordvpn} variant={RewardCardVariant.Row} />
            </Cell>
          </div>
        </div>
      </Section>

      <Section
        title="States"
        description="Claiming shows a sweep across the cover so the wait reads as the gift being prepared rather than a page hanging."
      >
        <div className="grid items-start gap-8 tablet:grid-cols-2 laptop:grid-cols-3">
          {[
            { label: 'Idle', note: 'default', state: RewardCardState.Idle },
            {
              label: 'Selected',
              note: 'chosen in the picker',
              state: RewardCardState.Selected,
            },
            {
              label: 'Claiming',
              note: 'hand-off in flight',
              state: RewardCardState.Claiming,
            },
            {
              label: 'Claimed',
              note: 'active on the partner side',
              state: RewardCardState.Claimed,
            },
            {
              label: 'Expired',
              note: 'kept as a record, greyed',
              state: RewardCardState.Expired,
            },
            {
              label: 'Plus only',
              note: 'negotiated Plus perk, not sponsored inventory',
              state: RewardCardState.PlusOnly,
            },
          ].map(({ label, note, state }) => (
            <Cell key={label} label={label} note={note}>
              <RewardCard
                offer={offers.spotify}
                variant={RewardCardVariant.Hero}
                state={state}
              />
            </Cell>
          ))}
        </div>
      </Section>

      <Section
        title="Row states"
        description="The vault renders these all day, so they have to survive being stacked."
      >
        <div className="flex max-w-[34rem] flex-col gap-3">
          {[
            RewardCardState.Idle,
            RewardCardState.Claiming,
            RewardCardState.Claimed,
            RewardCardState.Expired,
          ].map((state) => (
            <RewardCard
              key={state}
              offer={offers.uber}
              variant={RewardCardVariant.Row}
              state={state}
              claimLabel="Claim"
            />
          ))}
        </div>
      </Section>

      <Section
        title="The catalogue"
        description="Every partner writes its own offer, so the same component has to carry a price cut, a free trial, months of a plan and money off rides without any of them looking templated."
      >
        <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-4">
          {offerList.map((offer) => (
            <Cell key={offer.id} label={offer.brand} note={offer.category}>
              <RewardCard offer={offer} variant={RewardCardVariant.Tile} />
            </Cell>
          ))}
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Let the partner speak">
            &quot;Disney+ for $4.99/mo for 3 months&quot; and &quot;30 days free
            trial on Hulu&quot; are different sentences on purpose. Rewriting
            them into one house format makes every gift look like the same ad.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not template the value">
            Some offers are worth a dollar figure, some are a percentage, some
            are a trial with no price at all. Forcing a &quot;$X value&quot; onto
            all of them invents numbers we cannot stand behind.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
