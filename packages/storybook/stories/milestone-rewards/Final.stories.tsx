import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
  Table,
} from './shell';
import type { Offer } from './data';
import { milestones, milestoneByDay, offers } from './data';
import { RewardCardState } from './RewardCard';
import { SplitMoment } from './VariantSplit';
import { LadderMoment } from './VariantLadder';
import { SpotlightMoment } from './VariantSpotlight';
import { ClaimSheet, ClaimStep } from './ClaimSheet';
import {
  BrokenMoment,
  FirstPartyMoment,
  FreezeMoment,
  NoOfferMoment,
  PopupStrip,
  StripTone,
} from './StreakPopups';
import { DeclineStyle } from './moment';

// The review group: only what we settled on, in the order a reviewer needs it.
// Everything exploratory lives in the numbered sections; nothing here is a
// candidate, it is the proposal.

const meta: Meta = {
  title: 'Milestone Rewards/Final review',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const noop = () => undefined;

const gifts: Offer[] = [
  offers.disneyplus,
  offers.hulu,
  offers.notion,
  offers.applemusic,
];

export const Decisions: Story = {
  name: '1 · What we decided',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Reading streak · sponsored gifts"
        title="Everything we settled on, and what is still open"
      >
        <p>
          A partner network gives us branded gifts to hand out on reading streak
          milestones and pays a commission per claim. The design work was about
          keeping the streak a celebration while that happens.
        </p>
      </PageHeader>

      <Section
        title="Settled"
        description="These came out of the review rounds and the screens in this group all follow them."
      >
        <Table
          head={['Decision', 'What it means in the UI']}
          rows={[
            [
              <strong key="a">Reading streak only</strong>,
              'No quests, badges or anniversaries. Every popup here is a streak day.',
            ],
            [
              <strong key="b">Four sponsored days a year</strong>,
              'Days 7, 30, 90 and 365. Everything else on the ladder stays first-party Cores and perks.',
            ],
            [
              <strong key="c">Three or more gifts, as a list</strong>,
              'Single-line rows, small Claim on each, disclosure once underneath. Not one big card.',
            ],
            [
              <strong key="d">The partner catalogue, verbatim</strong>,
              'Disney+, Hulu, Notion, Apple Music and the rest, each with its own logo and its own offer sentence. Nothing templated.',
            ],
            [
              <strong key="e">Gift framing</strong>,
              '"Here\'s a little gift from us" plus "Choose one of our partner offers below". We arranged it, the streak earned it.',
            ],
            [
              <strong key="f">White claim buttons, pink streak accent</strong>,
              'Plain primary button. The flame, tier chip and day strip use the app\'s streak pink.',
            ],
            [
              <strong key="g">One line of small print</strong>,
              '"Sponsored offers. No charge until a trial ends, cancel anytime." Terms and expiry live on the claim sheet.',
            ],
            [
              <strong key="h">Decline differs by platform</strong>,
              'Desktop ends after the fine print, because the X is the decline. Phone gets a full-width "No thanks".',
            ],
            [
              <strong key="i">Responsive by container</strong>,
              'Under 44rem of width the desktop popups become the vertical layout themselves. One component, not two.',
            ],
            [
              <strong key="j">Flame artwork from PR #5613</strong>,
              'Tier art, ember burst and the rolling count. A wrapped gift box on the ladder means an unrevealed daily.dev prize.',
            ],
          ]}
        />
      </Section>

      <Section
        title="Craft rules the screens follow"
        description="Applied from jakub.kr: restraint first, and every motion decision made on purpose rather than by default."
      >
        <Table
          head={['Rule', 'How it shows up here']}
          rows={[
            [
              <strong key="m1">Enter is opacity, blur and translateY</strong>,
              'One decelerating curve (0.16, 1, 0.3, 1) everywhere. No overshoot, no bounce, nothing that wobbles past its target.',
            ],
            [
              <strong key="m2">Nothing loops forever</strong>,
              'Embers run three passes then settle. The claim button glows twice then stops. The flame no longer breathes at rest: a celebration lands, it does not idle.',
            ],
            [
              <strong key="m3">Animate by frequency</strong>,
              'A sponsored day happens four times a year, so it earns artwork and a staged entrance. Row hovers and dots get 150 to 200ms of colour, nothing more.',
            ],
            [
              <strong key="m4">Press feedback at 0.96</strong>,
              'Carousel cards scale on press, never below 0.96, on a 150ms transition. Named properties only, never transition-all.',
            ],
            [
              <strong key="m5">Depth from layered shadow</strong>,
              'The popup sits on a hairline ring plus two soft shadows instead of a hard border, and brand logos carry an inset outline so they do not bleed into the surface.',
            ],
            [
              <strong key="m6">Type details</strong>,
              'Balanced headlines, pretty paragraphs, tabular numerals on every streak count so digits do not jitter as they roll in.',
            ],
            [
              <strong key="m7">Reduced motion is a real path</strong>,
              'Every keyframe collapses to 1ms and the particle systems switch off, leaving the same layout and the same information.',
            ],
          ]}
        />
      </Section>

      <Section title="Still open">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Which desktop shape ships">
            Ladder if the tier progression from #5613 lands first, Split if not.
            Both are in this group at final quality.
          </Callout>
          <Callout title="Vault storage">
            "Keep it for later" needs the gift written server-side when the day
            fires. Without it, closing loses the gift and the calm copy stops
            being true.
          </Callout>
          <Callout title="Five questions for the partner">
            Category filtering, what the redirect passes, whether an offer can be
            held for a user, claim confirmation, country coverage.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Not agreed, do not build">
            Countdown timers, confirm-shaming, gifts on a broken streak, and any
            gift before day 7 or account age 14 days.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const Popups: Story = {
  name: '2 · The popups',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Two desktop shapes and the phone, at real size"
      >
        <p>
          Same content, same copy, same list. Pick one desktop shape; the phone
          gets the spotlight carousel either way.
        </p>
      </PageHeader>

      <Section
        title="Split"
        description="The safe default. Needs nothing but the day number and one flame."
      >
        <SplitMoment
          milestone={milestones.month}
          offer={offers.disneyplus}
          gifts={gifts}
          onKeep={noop}
        />
      </Section>

      <Section
        title="Flame ladder"
        description="Sells the next milestone as well as this one. Needs the tier ladder shipped."
      >
        <LadderMoment
          milestone={milestones.month}
          offer={offers.disneyplus}
          gifts={gifts.slice(0, 3)}
          onKeep={noop}
        />
      </Section>

      <Section
        title="Spotlight, on the phone"
        description="One gift at a time, swipeable, single primary button."
      >
        <PhoneFrame>
          <SpotlightMoment
            milestone={milestones.month}
            gifts={gifts}
            onKeep={noop}
          />
        </PhoneFrame>
      </Section>
    </Page>
  ),
};

export const States: Story = {
  name: '3 · Every state',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Each state the gift moment can be in"
      >
        <p>
          Claiming and claimed are per row, so a list with one claimed gift still
          reads at a glance. The failure states are on the claim sheet, which is
          shared by every surface.
        </p>
      </PageHeader>

      <Section title="In the popup">
        <div className="flex flex-col gap-10">
          <Cell label="Idle" note="four gifts, nothing claimed">
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={gifts}
              onKeep={noop}
            />
          </Cell>
          <Cell label="Claiming" note="the row you tapped shows the loader">
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={gifts}
              state={RewardCardState.Claiming}
            />
          </Cell>
          <Cell label="Claimed" note="chip replaces the button, the rest stay live">
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={gifts}
              state={RewardCardState.Claimed}
              onKeep={noop}
            />
          </Cell>
          <Cell
            label="Decline, phone style"
            note="what the same popup shows under 44rem, or when forced"
          >
            <SplitMoment
              milestone={milestones.week}
              offer={offers.hulu}
              gifts={gifts.slice(0, 3)}
              decline={DeclineStyle.Button}
              onKeep={noop}
            />
          </Cell>
        </div>
      </Section>

      <Section
        title="On the claim sheet"
        description="One sheet for every surface: confirm, hand off, confirm again, and four ways it can fail."
      >
        <div className="grid items-start gap-8 laptop:grid-cols-3">
          <Cell label="Confirm">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Confirm} />
          </Cell>
          <Cell label="Redirecting">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Redirecting} />
          </Cell>
          <Cell label="Active">
            <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Active} />
          </Cell>
          <Cell label="Expired">
            <ClaimSheet offer={offers.hulu} step={ClaimStep.Expired} />
          </Cell>
          <Cell label="Wrong country">
            <ClaimSheet offer={offers.audible} step={ClaimStep.Unavailable} />
          </Cell>
          <Cell label="Partner pulled it">
            <ClaimSheet offer={offers.notion} step={ClaimStep.Withdrawn} />
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

export const StreakFamily: Story = {
  name: '4 · The rest of the streak popups',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Freeze, broken streak, first-party days: same shell, same rhythm"
      >
        <p>
          A user meets these within the same fortnight as a gift. Three different
          layouts would read as three different products, so they all use the
          celebration-left, one-decision-right structure with a single primary
          button and one line of small print.
        </p>
      </PageHeader>

      <Section
        title="A day with a first-party reward"
        description="Days 3, 5, 14, 21 and 60. No partner involved, and the copy says so plainly."
      >
        <FirstPartyMoment
          milestone={milestoneByDay(21)}
          onClaim={noop}
          onKeep={noop}
        />
      </Section>

      <Section
        title="Enable a streak freeze"
        description="The only popup in the family that asks for something, so it is the only one with a price in it. Reachable from the streak panel and offered as a strip elsewhere."
      >
        <FreezeMoment
          milestone={milestones.month}
          freezesOwned={0}
          onBuy={noop}
          onKeep={noop}
        />
      </Section>

      <Section
        title="The streak broke"
        description="No embers, no tier chip, no celebration. Restore is the primary action while it is still available; after that the popup switches to starting over."
      >
        <div className="flex flex-col gap-10">
          <Cell label="Restore available" note="within two days">
            <BrokenMoment lostDays={30} onRestore={noop} onKeep={noop} />
          </Cell>
          <Cell label="Too late to restore" note="the offer is gone, not hidden">
            <BrokenMoment lostDays={30} canRestore={false} onKeep={noop} />
          </Cell>
        </div>
      </Section>

      <Section
        title="A sponsored day with no matching offer"
        description="Muted categories, an unsupported country, or empty inventory. The day still gets answered with something of ours."
      >
        <NoOfferMoment
          milestone={milestones.week}
          onClaim={noop}
          onKeep={noop}
        />
      </Section>
    </Page>
  ),
};

export const BrokenStreak: Story = {
  name: '4b · Broken streak, close up',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="The streak ended, drawn with the shattered flame from #5613"
      >
        <p>
          The artwork is Tomer&apos;s recover cover: the same 3D flame as the
          tier badges, broken apart. It carries the moment on its own, so this
          panel drops the embers, the tier chip and the ring of light, and the
          background cools from fire to ash.
        </p>
        <p>
          Restore stays the primary action while it is available. Once the window
          closes the popup does not grey a dead button out, it changes what it
          offers: start again.
        </p>
      </PageHeader>

      <Section title="Within the restore window">
        <BrokenMoment lostDays={30} onRestore={noop} onKeep={noop} />
      </Section>

      <Section title="After the window">
        <BrokenMoment lostDays={30} canRestore={false} onKeep={noop} />
      </Section>

      <Section title="A short streak, same treatment">
        <BrokenMoment lostDays={5} price={80} onRestore={noop} onKeep={noop} />
      </Section>

      <Section title="Why it is drawn this way">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Same family, different weather">
            Identical shell, identical rhythm, identical button hierarchy. Only
            the artwork and the background change, which is what makes the loss
            legible without a word of drama.
          </Callout>
          <Callout tone={CalloutTone.Good} title="The freeze strip earns its place here">
            This is the one moment where the freeze upsell is genuinely useful
            rather than opportunistic, because the user just felt the problem it
            solves.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="No embers, no celebration">
            The tier chip, the ember burst and the ring of light all belong to
            days that went well.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="No guilt copy">
            &quot;You lost it&quot; and &quot;Do not let it happen again&quot;
            are out. The line is what happened and what can be done about it.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const Mobile: Story = {
  name: '5 · Every popup on a phone',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="The same components at phone width, nothing rebuilt"
      >
        <p>
          Each popup below is the identical component from the sections above,
          given 384px instead of 832. Under 44rem of width the container query
          turns the two columns into one, centres the celebration panel, drops
          the week strip and swaps the decline for a full-width button, because
          the corner X is out of thumb reach.
        </p>
        <p>
          The one purpose-built phone layout is the spotlight carousel, which
          exists because a list of four gifts and a swipeable stack are genuinely
          different interactions, not different CSS.
        </p>
      </PageHeader>

      <Section title="Gift days">
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="Split, collapsed" note="four gifts as rows">
            <PhoneFrame>
              <SplitMoment
                milestone={milestones.month}
                offer={offers.disneyplus}
                gifts={gifts}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Ladder, collapsed" note="gifts first, rail underneath">
            <PhoneFrame>
              <LadderMoment
                milestone={milestones.month}
                offer={offers.disneyplus}
                gifts={gifts.slice(0, 3)}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Spotlight" note="built for the phone, swipeable">
            <PhoneFrame>
              <SpotlightMoment
                milestone={milestones.month}
                gifts={gifts}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
        </div>
      </Section>

      <Section title="The rest of the family">
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="First-party day" note="day 21, Cores">
            <PhoneFrame>
              <FirstPartyMoment
                milestone={milestoneByDay(21)}
                onClaim={noop}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Freeze" note="two packs, one row each">
            <PhoneFrame>
              <FreezeMoment
                milestone={milestones.month}
                onBuy={noop}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Broken, restorable">
            <PhoneFrame>
              <BrokenMoment lostDays={30} onRestore={noop} onKeep={noop} />
            </PhoneFrame>
          </Cell>
          <Cell label="Broken, window closed">
            <PhoneFrame>
              <BrokenMoment lostDays={30} canRestore={false} onKeep={noop} />
            </PhoneFrame>
          </Cell>
          <Cell label="No matching offer">
            <PhoneFrame>
              <NoOfferMoment
                milestone={milestones.week}
                onClaim={noop}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
        </div>
      </Section>

      <Section
        title="Claim, on a phone"
        description="The claim sheet is already narrow, so it needs no collapse: it is the same sheet the desktop uses."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="Confirm">
            <PhoneFrame>
              <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Confirm} />
            </PhoneFrame>
          </Cell>
          <Cell label="Active">
            <PhoneFrame>
              <ClaimSheet offer={offers.disneyplus} step={ClaimStep.Active} />
            </PhoneFrame>
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

export const Strips: Story = {
  name: '6 · The strip inside the popup',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Where a second message goes when the popup already has a decision"
      >
        <p>
          There is always something else worth saying: buy a freeze, the gifts
          are in your vault, you have Cores waiting. The strip is where those go.
          One line, one small secondary button, directly under the primary
          action, never above it.
        </p>
      </PageHeader>

      <Section
        title="The three we need"
        description="Same component, three tones. Anything that does not fit in one line does not belong in a popup."
      >
        <div className="flex max-w-[34rem] flex-col gap-3">
          <PopupStrip tone={StripTone.Freeze} action="Get one">
            A streak freeze covers a day you miss.
          </PopupStrip>
          <PopupStrip tone={StripTone.Vault} action="Open">
            Two more gifts are waiting in your vault.
          </PopupStrip>
          <PopupStrip tone={StripTone.Cores} action="Claim">
            You have 50 unclaimed Cores from day 21.
          </PopupStrip>
        </div>
      </Section>

      <Section
        title="In place"
        description="Under the primary button, above the decline. It reads as a footnote with an action, which is exactly what it is."
      >
        <FirstPartyMoment
          milestone={milestoneByDay(21)}
          onClaim={noop}
          onKeep={noop}
        />
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="One strip per popup">
            Two strips is a settings screen. If both a freeze and a vault message
            apply, the freeze wins on a streak day and the vault wins everywhere
            else.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Never on the gift moment">
            The sponsored popup already carries a partner decision. A second ask
            next to it is what turns a gift into a funnel.
          </Callout>
          <Callout title="Secondary button, always">
            The strip button is XSmall and secondary. If it needs to be bigger
            than that, it is not a strip, it is the popup.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Not a banner">
            No background colour, no icon larger than the text, no two-line copy.
            The moment it starts shouting it competes with the thing it sits
            under.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
