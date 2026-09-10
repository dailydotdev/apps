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
import { milestones, milestoneByDay } from './data';
import {
  BrokenMoment,
  FirstPartyMoment,
  FreezeMoment,
  NoOfferMoment,
  PopupStrip,
  StripTone,
} from './StreakPopups';

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
              <strong key="e">Gift framing</strong>,
              '"Here\'s a little gift from us" plus "Choose one of our partner offers below". We arranged it, the streak earned it.',
            ],
            [
              <strong key="f">White claim buttons, pink streak accent</strong>,
              "Plain primary button. The flame, tier chip and day strip use the app's streak pink.",
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
          <Callout title="Vault storage">
            "Keep it for later" needs the gift written server-side when the day
            fires. Without it, closing loses the gift and the calm copy stops
            being true.
          </Callout>
          <Callout title="Five questions for the partner">
            Category filtering, what the redirect passes, whether an offer can
            be held for a user, claim confirmation, country coverage.
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

export const StreakFamily: Story = {
  name: '2 · The streak popups',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Freeze, broken streak, first-party days: same shell, same rhythm"
      >
        <p>
          A user meets these within the same fortnight as a gift. Three
          different layouts would read as three different products, so they all
          use the celebration-left, one-decision-right structure with a single
          primary button and one line of small print.
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
          onGetFreezes={noop}
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
            <BrokenMoment
              lostDays={30}
              onRestore={noop}
              onKeep={noop}
              onGetFreezes={noop}
            />
          </Cell>
          <Cell
            label="Too late to restore"
            note="the offer is gone, not hidden"
          >
            <BrokenMoment
              lostDays={30}
              canRestore={false}
              onKeep={noop}
              onGetFreezes={noop}
            />
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
  name: '2b · Broken streak, close up',
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
          Restore stays the primary action while it is available. Once the
          window closes the popup does not grey a dead button out, it changes
          what it offers: start again.
        </p>
      </PageHeader>

      <Section title="Within the restore window">
        <BrokenMoment
          lostDays={30}
          onRestore={noop}
          onKeep={noop}
          onGetFreezes={noop}
        />
      </Section>

      <Section title="After the window">
        <BrokenMoment
          lostDays={30}
          canRestore={false}
          onKeep={noop}
          onGetFreezes={noop}
        />
      </Section>

      <Section title="A short streak, same treatment">
        <BrokenMoment
          lostDays={5}
          price={80}
          onRestore={noop}
          onKeep={noop}
          onGetFreezes={noop}
        />
      </Section>

      <Section title="Why it is drawn this way">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Good}
            title="Same family, different weather"
          >
            Identical shell, identical rhythm, identical button hierarchy. Only
            the artwork and the background change, which is what makes the loss
            legible without a word of drama.
          </Callout>
          <Callout
            tone={CalloutTone.Good}
            title="The freeze strip earns its place here"
          >
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
  name: '3 · Every popup on a phone',
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
      </PageHeader>

      <Section title="The streak popups">
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="First-party day" note="day 21, Cores">
            <PhoneFrame>
              <FirstPartyMoment
                milestone={milestoneByDay(21)}
                onClaim={noop}
                onKeep={noop}
                onGetFreezes={noop}
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
              <BrokenMoment
                lostDays={30}
                onRestore={noop}
                onKeep={noop}
                onGetFreezes={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Broken, window closed">
            <PhoneFrame>
              <BrokenMoment
                lostDays={30}
                canRestore={false}
                onKeep={noop}
                onGetFreezes={noop}
              />
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
    </Page>
  ),
};

export const Strips: Story = {
  name: '4 · The strip inside the popup',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Final"
        title="Where a second message goes when the popup already has a decision"
      >
        <p>
          There is always something else worth saying: buy a freeze, the gifts
          are in your vault, you have Cores waiting. The strip is where those
          go. One line, one small secondary button, directly under the primary
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
          onGetFreezes={noop}
        />
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="One strip per popup">
            Two strips is a settings screen. If both a freeze and a vault
            message apply, the freeze wins on a streak day and the vault wins
            everywhere else.
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
            No background colour, no icon larger than the text, no two-line
            copy. The moment it starts shouting it competes with the thing it
            sits under.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
