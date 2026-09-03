import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Callout, CalloutTone, Page, PageHeader, Section, Table } from './shell';
import { milestones, offerList, offers } from './data';
import { RewardCardState } from './RewardCard';
import {
  Coupon,
  CouponLayout,
  CouponList,
  couponMeta,
  couponOrder,
} from './coupons';
import { SplitMoment } from './VariantSplit';

const meta: Meta = {
  title: 'Milestone Rewards/3. Coupon layouts',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const noop = () => undefined;

/** The right column of the Split popup is 360px wide. Judge them at that size. */
const PanelFrame = ({
  layout,
  children,
}: {
  layout: CouponLayout;
  children: React.ReactNode;
}): React.ReactElement => {
  const info = couponMeta[layout];

  return (
    <div className="flex w-[22.5rem] flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
          {info.number}
        </span>
        <span className="font-bold typo-callout">{info.name}</span>
      </div>
      <span className="min-h-[2.5rem] text-text-quaternary typo-caption1">
        {info.note}
      </span>
      {children}
    </div>
  );
};

export const AllTen: Story = {
  name: 'All ten',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="The right hand side"
        title="Ten ways to draw the coupon, with real logos and real photography"
      >
        <p>
          The gradient placeholder is gone. Every brand mark here is the
          brand&apos;s own icon, pulled into the repo, and the photo layouts use
          real photography rather than a coloured rectangle. A coupon that looks
          invented is a coupon nobody trusts enough to claim.
        </p>
        <p>
          All ten answer the same four questions in the same order: who is giving
          it, what is it, what is it worth, how do I take it. They differ only in
          how much they say around that, and every one of them ends in a single
          button.
        </p>
      </PageHeader>

      <Section
        title="At panel size"
        description="360px wide, which is what the right column of the Split popup gives them."
      >
        <div className="flex flex-wrap gap-10">
          {couponOrder.map((layout) => (
            <PanelFrame key={layout} layout={layout}>
              <Coupon
                offer={offers.disneyplus}
                layout={layout}
                onClaim={noop}
              />
            </PanelFrame>
          ))}
        </div>
      </Section>

      <Section
        title="The review"
        description="Scored on the thing that matters here: can a developer tell what they are being given, and what it costs them, in one glance."
      >
        <Table
          head={['Layout', 'Works', 'Fails', 'Verdict']}
          rows={[
            [
              <strong key="0">00 · List row</strong>,
              'One line, one small button, no card. Three of them stack in the height one card used to take.',
              'No room for a photo or a value pitch, so it leans entirely on the brand being recognisable.',
              'Ship. This is the shape when a day carries three or more gifts, which is all of them.',
            ],
            [
              <strong key="1">01 · App row</strong>,
              'Instantly legible, zero learning curve, and the value figure sits right next to the plan.',
              'One gift takes the whole panel, which is too much weight for a gift that did not earn the moment.',
              'Keep as the single-gift fallback.',
            ],
            [
              <strong key="2">02 · Ticket</strong>,
              'Reads as a voucher on sight. The notches make it feel like an object you were handed.',
              'Two panels and a tear line for one sentence of content. Tall, and the skeuomorphism fights our design system.',
              'Cut.',
            ],
            [
              <strong key="3">03 · Logo hero</strong>,
              'The brand mark at full size is the most convincing "this is real" signal we have.',
              'The brand wash gives partner colour a big surface, right next to our flame.',
              'Keep as a runner-up. Works when the offer is one word.',
            ],
            [
              <strong key="4">04 · Value first</strong>,
              '"3 MONTHS FREE" at mega size is the single most clickable thing in the set.',
              'The brand shrinks to a caption, which is exactly what a partner will not accept.',
              'Merge its typography into the winner rather than shipping it.',
            ],
            [
              <strong key="5">05 · Gift box</strong>,
              'The 3D artwork keeps the moment feeling like a present, and it is already ours.',
              'The gift box says nothing about what the gift is. Two beats to answer the only question that matters.',
              'Cut for the popup. Reuse it in the vault empty state.',
            ],
            [
              <strong key="6">06 · Wallet card</strong>,
              'Beautiful, and it makes the gift feel owned rather than advertised.',
              '176px of brand gradient next to a flame is a lot of noise, and the value gets lost in the corner.',
              'Cut.',
            ],
            [
              <strong key="7">07 · Photo hero</strong>,
              'Closest to the partner mock-up, and photography sells lifestyle offers well.',
              'Generic stock photography is the fastest way to look like an ad network. Only a few offers have real art.',
              'Only if the partner ships real per-offer imagery.',
            ],
            [
              <strong key="8">08 · Bullets</strong>,
              'Answers every objection: what you get, who it is for, what happens when it ends.',
              'Four blocks of text in a celebration. This is a pricing page, not a gift.',
              'Move the bullets to the claim sheet, where they belong.',
            ],
            [
              <strong key="9">09 · Code voucher</strong>,
              'Necessary when the partner gives a code rather than a link, and copy-to-clipboard is honest about it.',
              'Asks the user to manage a string. Every extra step between tap and gift costs claims.',
              'Keep as the fallback layout, not the default.',
            ],
            [
              <strong key="10">10 · Minimal</strong>,
              'Nothing to parse. Logo, sentence, button. The least busy thing possible.',
              'No value figure, so nothing tells you the gift is worth taking.',
              'Runner-up. One line short of being the winner.',
            ],
          ]}
        />
      </Section>

      <Section
        title="List mode, which is what actually ships"
        description="The programme hands over three or more gifts at a time, so the right side of the popup is a list, not a card. One line per gift, a small button on the end, and the disclosure once underneath. Past four rows the list scrolls inside itself instead of growing the popup."
      >
        <div className="flex flex-wrap gap-10">
          <div className="w-[22.5rem]">
            <CouponList
              withNote
              offers={[offers.disneyplus, offers.hulu, offers.notion]}
              onClaim={noop}
            />
          </div>
          <div className="w-[22.5rem]">
            <CouponList
              withNote
              offers={[
                offers.disneyplus,
                offers.hulu,
                offers.notion,
                offers.applemusic,
                offers.spotify,
                offers.nordvpn,
              ]}
              claimedIds={[offers.hulu.id]}
              onClaim={noop}
            />
          </div>
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why a list beats three cards">
            Three cards is three pitches competing with the flame. Three rows is
            a menu: the same information, a fifth of the height, and no single
            gift shouting louder than the streak that earned it.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Small buttons on purpose">
            Every row claims independently with a small button. Nothing on this
            side of the popup is bigger than the streak count on the other side.
          </Callout>
        </div>
      </Section>

      <Section
        title="If a day ever carries one gift"
        description="App row with the button pulled out and the value figure from 04. This is the single-gift fallback, not the default."
      >
        <div className="flex flex-wrap gap-10">
          <PanelFrame layout={CouponLayout.AppRow}>
            <Coupon
              offer={offers.disneyplus}
              layout={CouponLayout.AppRow}
              onClaim={noop}
            />
          </PanelFrame>
          <PanelFrame layout={CouponLayout.Minimal}>
            <Coupon
              offer={offers.disneyplus}
              layout={CouponLayout.Minimal}
              onClaim={noop}
            />
          </PanelFrame>
          <PanelFrame layout={CouponLayout.LogoHero}>
            <Coupon
              offer={offers.disneyplus}
              layout={CouponLayout.LogoHero}
              onClaim={noop}
            />
          </PanelFrame>
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the app row wins">
            It is the only layout where a developer needs no instructions. They
            have claimed something in this exact shape a hundred times, from the
            App Store to GitHub Student Pack, so the moment costs them no
            thinking at all.
          </Callout>
          <Callout tone={CalloutTone.Good} title="What it borrows">
            The value figure from 04 and the single full-width button from 10.
            Everything else the coupon used to carry, the terms, the expiry
            detail, the category controls, moves to the claim sheet.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="What we removed on purpose">
            The gradient cover, the second sponsor pill, the "not my thing" link
            and the expiry countdown. Four things competing for a decision that
            only needs one.
          </Callout>
          <Callout title="Disclosure survives the diet">
            One line, "Sponsored by Disney+", directly under the offer. It is
            the one element that cannot be cut in the name of simplicity.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const EveryBrand: Story = {
  name: 'Every brand, the winner',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Real logos"
        title="The winning layout across the whole catalogue"
      >
        <p>
          Each mark is the brand&apos;s own icon at 128px, stored in
          public/brand-logos. This is the test that matters for realism: ten
          different brands, no gradient, nothing invented, and each one still
          recognisable at 56px.
        </p>
      </PageHeader>

      <Section title="Catalogue">
        <div className="flex flex-wrap gap-8">
          {offerList.map((offer) => (
            <div key={offer.id} className="w-[22.5rem]">
              <Coupon
                offer={offer}
                layout={CouponLayout.AppRow}
                onClaim={noop}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="States"
        description="Idle, claiming and claimed, in the layout that ships."
      >
        <div className="flex flex-wrap gap-8">
          {[
            RewardCardState.Idle,
            RewardCardState.Claiming,
            RewardCardState.Claimed,
          ].map((state) => (
            <div key={state} className="w-[22.5rem]">
              <Coupon
                offer={offers.notion}
                layout={CouponLayout.AppRow}
                state={state}
              />
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

const InContext = (): React.ReactElement => {
  const [layout, setLayout] = useState(CouponLayout.AppRow);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {couponOrder.map((option) => (
          <Button
            key={option}
            size={ButtonSize.Small}
            variant={
              option === layout ? ButtonVariant.Primary : ButtonVariant.Secondary
            }
            onClick={() => setLayout(option)}
          >
            {couponMeta[option].number} {couponMeta[option].name}
          </Button>
        ))}
      </div>
      <SplitMoment
        milestone={milestones.month}
        offer={offers.disneyplus}
        couponLayout={layout}
        onOptOut={noop}
      />
    </div>
  );
};

export const InThePopup: Story = {
  name: 'In the popup',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Side by side with the flame"
        title="Every layout, dropped into the right half of the Split popup"
      >
        <p>
          The only test that counts. Switch layouts and watch how much the right
          side fights the left. The winner is the one where the flame still owns
          the moment and the gift still gets claimed.
        </p>
      </PageHeader>

      <Section title="Switch the layout">
        <InContext />
      </Section>
    </Page>
  ),
};
