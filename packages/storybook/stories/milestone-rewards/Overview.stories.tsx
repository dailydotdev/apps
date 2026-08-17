import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Callout, CalloutTone, Page, PageHeader, Section, Table } from './shell';
import { milestones, offers, sponsoredGiftArt } from './data';
import { SplitMoment } from './VariantSplit';

const meta: Meta = {
  title: 'Milestone Rewards/0. Overview',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const noop = () => undefined;

export const Overview: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Reading streak · sponsored gifts"
        title="A gift is what a streak deserves. An ad is what a streak gets sold for. The whole design is keeping those apart."
      >
        <p>
          The partnership gives us branded gifts to hand out when someone hits a
          reading streak milestone, and pays us a commission per claim. That is
          real revenue with no ad inventory and no extra ask of the user, landing
          on the one screen where they already feel good about us.
        </p>
        <p>
          Which is exactly the risk. Developers are the most ad-hostile audience
          on the internet, and a Disney+ upsell bolted onto a 30 day streak does
          not read as a reward. It reads as the day we started selling the
          streak. Everything here exists to make the gift feel earned: the flame
          stays ours, the brand stays in its box, and the celebration survives a
          user who closes the popup in the first second.
        </p>
      </PageHeader>

      <Section
        title="What changed after the first round"
        description="Three notes drove this version."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout title="Reading streak only">
            Quests, badges and anniversaries are gone. Every screen here is a
            streak day.
          </Callout>
          <Callout title="Wide, not tall">
            The popups are landscape, between 736 and 896 wide and under 510
            high. Celebration and gift sit side by side instead of stacking into
            a scroll.
          </Callout>
          <Callout title="Real artwork">
            The flame tiers and the gift box are the actual assets from the
            streak progression PR (#5613), with its ember burst and the rolling
            streak count.
          </Callout>
          <Callout title="The partner catalogue">
            Disney+, Hulu, Notion, Apple Music, Spotify, NordVPN, Uber One and
            the rest, each with its own logo, its own photography and its own
            offer sentence.
          </Callout>
          <Callout title="List mode on the right">
            Every day carries three or more gifts, so the right side is a list of
            single-line rows with a small button each, not one big card. Terms,
            expiry and preferences moved to the claim sheet.
          </Callout>
          <Callout title="A mobile shape">
            Portrait variant with a swipeable row of gifts and the same three
            beats the partner mock-up showed: pick, hand off, confirm.
          </Callout>
          <Callout title="Responsive by container">
            Below 44rem of available width the desktop popups collapse into the
            vertical layout themselves. Artwork and the streak count interpolate
            with the container rather than snapping.
          </Callout>
        </div>
      </Section>

      <Section
        title="The moment"
        description="Day 30, Inferno, in the Split variant. The left half is entirely ours: tier artwork, embers, the number, the week behind it. The partner never crosses the divider."
      >
        <SplitMoment
          milestone={milestones.month}
          offer={offers.disneyplus}
          gifts={[offers.disneyplus, offers.hulu, offers.notion]}
          onOptOut={noop}
        />
      </Section>

      <Section
        title="Four variants"
        description="Three desktop shapes and the phone. A compact ember band and a three-card picker were both drawn and cut: they put more weight on the offer than the streak could carry."
      >
        <Table
          head={['Variant', 'Size', 'What it is good at', 'What it costs']}
          rows={[
            [
              <strong key="a">1 · Split</strong>,
              '832 × 500',
              'The safe default. Big flame, one gift, one button, clean separation between the celebration and the brand.',
              'One gift, no choice. A bad match wastes the day.',
            ],
            [
              <strong key="d">2 · Flame ladder</strong>,
              '896 × 500',
              'Sells tomorrow as well as today. The gift becomes part of a progression rather than an ad slot.',
              'Busiest of the four, and it needs the tier ladder shipped first.',
            ],
            [
              <strong key="c">3 · Carousel</strong>,
              '832 × 700',
              "The partner mock-up's own shape: full cards with their photography, paged with arrows.",
              'Tallest of the set, one gift readable at a time, and the last card may never be seen.',
            ],
            [
              <strong key="e">4 · Mobile</strong>,
              '384 × 620',
              'The phone shape: win on top, gifts swipeable underneath, one small button per card.',
              'A carousel hides gifts two and three until you swipe.',
            ],
          ]}
        />
        <Callout tone={CalloutTone.Good} title="The recommendation">
          Ladder on the sponsored days, since it sells the next milestone as well
          as this one. Split is the fallback if the tier ladder from #5613 does
          not land in time, because it needs nothing but the day number and one
          flame. The phone gets the mobile shape either way.
        </Callout>
      </Section>

      <Section
        title="Five rules every variant is checked against"
        description="Where a rule and a claim-rate optimisation disagree, the rule wins. This feature is worth nothing if it costs the trust that makes people open daily.dev every morning."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="1. The flame is ours, the box is theirs">
            Tier artwork, embers and the streak count never share a surface with
            partner paint. One glance tells you which half of the screen was
            bought.
          </Callout>
          <Callout title="2. Say who is paying, every time">
            &quot;Sponsored by Disney+&quot; sits inside the coupon component
            itself, so no surface can render an offer without the disclosure
            coming with it, plus one plain line on how the money works.
          </Callout>
          <Callout title="3. Every partner writes its own offer">
            Disney+ discounts a monthly price, Hulu gives a trial, Notion gives
            months of a plan, Uber gives money off rides. No component templates
            that sentence, and category preferences let people mute the ones they
            do not want.
          </Callout>
          <Callout title="4. Nothing earned is ever destroyed">
            Closing moves the gift to the vault. That is what lets every popup be
            calm: no countdowns, no confirm-shaming, no gate on the X.
          </Callout>
          <Callout title="5. Four sponsored days a year, maximum">
            Days 7, 30, 90 and 365. Everything else on the ladder stays
            first-party Cores and perks.
          </Callout>
          <Callout tone={CalloutTone.Good} title="The framing is a gift, not an offer">
            &quot;Here&apos;s a little gift from us. Choose one of our partner
            offers below.&quot; We arranged it, the streak earned it, and the
            claim button stays white and quiet rather than shouting.
          </Callout>
        </div>
      </Section>

      <Section
        title="Copy voice"
        description="The wording carries most of the trust load, so it is specified rather than left to the surface."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Name the trade in one line">
            &quot;Partners pay daily.dev when a gift is claimed. That is what
            keeps the feed free.&quot; Plain, unhedged, always visible.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not dress it as generosity">
            &quot;We wanted to say thank you with a special surprise&quot; is the
            sentence that gets screenshotted next to the word
            &quot;affiliate&quot;.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Describe the gift concretely">
            &quot;3 months of the All Products Pack, free · $89 value&quot;, with
            the terms under the button rather than behind a link.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="No manufactured scarcity">
            No countdown timers, no &quot;3 left&quot;, no &quot;expires when you
            close this&quot;. Real expiry dates only, stated calmly.
          </Callout>
        </div>
      </Section>

      <Section
        title="What we measure"
        description="Claim rate alone will push this feature somewhere bad. It needs a counterweight on the same dashboard."
      >
        <Table
          head={['Metric', 'Reads as', 'Kill signal']}
          rows={[
            [
              'Claim rate per popup',
              'Is the inventory relevant',
              'Below 5% on dev-tool offers means the catalogue is wrong, not the popup',
            ],
            [
              'Streak continuation the day after a gift',
              'Did the gift damage the habit it was celebrating',
              'Any drop against the no-gift control',
            ],
            [
              'Opt-out rate',
              'Direct trust cost',
              'Above 3% of exposed users',
            ],
            [
              'Time before the popup is dismissed',
              'Are we making the celebration feel transactional',
              'Median falls sharply against control',
            ],
            [
              'Vault revisits without a prompt',
              'Do people treat these as theirs',
              'Near zero means the vault is a landfill, not a feature',
            ],
          ]}
        />
      </Section>

      <Section title="Open questions for the partner">
        <div className="flex items-start gap-6">
          <img
            src={sponsoredGiftArt}
            alt=""
            className="h-28 w-28 shrink-0 object-contain"
          />
          <div className="flex flex-col gap-3 text-text-tertiary typo-callout">
            <p>
              1. Can we filter inventory by category and rank developer-relevant
              brands first, or is the offer chosen on their side?
            </p>
            <p>
              2. What exactly is passed on the redirect, and can we commit
              publicly to &quot;no personal data leaves daily.dev&quot;?
            </p>
            <p>
              3. Can an offer be held for a user for a fixed window? The vault
              promises a gift stays claimable, and that breaks if inventory is
              first-come.
            </p>
            <p>
              4. Do we get claim confirmation back? Without it the vault cannot
              honestly say &quot;Active&quot;.
            </p>
            <p>
              5. Country coverage per offer, so we filter before display rather
              than apologising after the tap.
            </p>
          </div>
        </div>
      </Section>
    </Page>
  ),
};
