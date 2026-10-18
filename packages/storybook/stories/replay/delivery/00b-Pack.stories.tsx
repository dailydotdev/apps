import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useState } from 'react';
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
import { RarityTier, rarityRamp } from '../assets';
import { FrameStyles, FrameThumb } from '../frames';
import { byId } from '../catalog';
import { sampleData } from '../data';
import { HERO, HERO_CLAIM, Variant } from './mocks';
import { PhoneShell, ProductShell } from './product';
import {
  Binder,
  CardBack,
  DECK,
  FlipCard,
  FoilPack,
  PackBand,
  PackShare,
  PackStrip,
  PackStyles,
  PullToTear,
  RARE,
} from './pack';

const meta: Meta = {
  title: 'Replay delivery/00b. The pack, in the product',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The pack taken all the way into the product: Monday in the real feed, the band it opens into, the strip it becomes, the foil, the card backs, the share unit, the binder, and pull-to-tear on the phone.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

type Phase = 'sealed' | 'tearing' | 'band';

/** The whole Monday, live: tear the pack, flip the cards, post the pack. */
const MondayFlow = (): ReactElement => {
  const [phase, setPhase] = useState<Phase>('sealed');
  const [flipped, setFlipped] = useState<boolean[]>(DECK.map(() => false));

  const tear = () => {
    if (phase !== 'sealed') return;
    setPhase('tearing');
    window.setTimeout(() => setPhase('band'), 780);
  };
  const reset = () => {
    setPhase('sealed');
    setFlipped(DECK.map(() => false));
  };

  const sealedSlot = (
    <div className="relative flex h-full min-h-[21rem] flex-col items-center justify-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
      <PackStyles />
      <FoilPack tier={RarityTier.Emerald} tearing={phase === 'tearing'} onTear={tear} breathe={phase === 'sealed'} />
      <span className="text-center text-text-tertiary typo-caption1">
        Your week 37 is in.
        <br />
        Tear the strip.
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      <ProductShell
        count={5}
        slots={
          phase === 'band'
            ? [
                {
                  at: 0,
                  span: 3,
                  node: (
                    <PackBand
                      flipped={flipped}
                      onFlip={(index) => setFlipped((f) => f.map((v, i) => (i === index ? true : v)))}
                      onFlipAll={() => setFlipped(DECK.map(() => true))}
                    />
                  ),
                },
              ]
            : [{ at: 0, node: sealedSlot }]
        }
      />
      <div className="flex items-center gap-3 text-text-quaternary typo-caption1">
        <span>
          {phase === 'sealed' && 'Click the pack.'}
          {phase === 'tearing' && 'Tearing…'}
          {phase === 'band' && `${flipped.filter(Boolean).length} of 5 flipped. Click a card, or Flip all.`}
        </span>
        {phase !== 'sealed' && (
          <button type="button" onClick={reset} className="underline">
            reseal
          </button>
        )}
      </div>
    </div>
  );
};

export const InTheProduct: Story = {
  name: 'Monday, in the feed',
  render: () => (
    <Page>
      <PackStyles />
      <FrameStyles />
      <PageHeader eyebrow="Replay delivery · the pack" title="Monday: a sealed pack in slot one, and it opens into the band">
        <p>
          The pack and the chapter band were two concepts; here they are one
          object with two states. Sealed, it takes one slot and breathes. Torn,
          it becomes the band across the whole row, five cards face down, and
          each one flips. Everything around it is the real feed: the rail, the
          header with the streak and the bell, the tabs, the posts it competes
          with. Click the pack.
        </p>
      </PageHeader>

      <Section title="Live" description="The foil is Emerald because the rarest card inside is Emerald. The tear strip is the only affordance and it says what it does.">
        <MondayFlow />
      </Section>

      <Section title="What just happened, as a sequence">
        <Table
          head={['Moment', 'On screen', 'Why']}
          minWidth={60}
          rows={[
            ['Feed loads on Monday', 'A sealed pack in slot one, breathing slightly, foil coloured by the week\'s rarest card', 'It is not a post. Nobody scrolls past a sealed thing with their handle on it, and the foil already says something true about the week.'],
            ['Tear', 'The strip lifts off, the sleeve sinks, the slot widens to the full row', 'The person did it, so the reveal is theirs. Half a second, no skipping by accident (the Pokémon critique).'],
            ['Five backs', 'Cards dealt face down, the rare one already faintly glowing', 'Five is a set, which the single card never communicated. Face down keeps the curiosity gap for each card.'],
            ['Flip', 'Each tap turns one card; the rare card glows Emerald when it lands', 'One reveal per tap is the unboxing rhythm. Flip all exists for the impatient.'],
            ['All five', '"That was your week." Post the pack, or copy the best card', 'The share prompt arrives at the peak, with two sizes of share: the whole pack, or one card.'],
            ['Tomorrow', 'The band is gone; the strip above the feed carries the state', 'The feed goes back to being the feed. See the next section.'],
          ]}
        />
      </Section>
    </Page>
  ),
};

export const TheStrip: Story = {
  name: 'Tuesday onward: the strip',
  render: () => (
    <Page>
      <PackStyles />
      <FrameStyles />
      <PageHeader eyebrow="Replay delivery · the pack" title="The strip is the pack, folded">
        <p>
          The thin bar above the feed you liked, with the pack inside it. A
          mini pack at the left, the claim, and the state of the week: still
          sealed, half flipped, or all seen. One row, no slot, until Sunday.
          Monday&apos;s new pack replaces it.
        </p>
      </PageHeader>

      <Section title="In the product, Wednesday, three cards flipped">
        <ProductShell above={<PackStrip state="partial" revealed={3} />} count={6} />
      </Section>

      <Section title="The three states">
        <div className="flex flex-col gap-3">
          <Variant label="Sealed" note="They never tore it on Monday. The claim does the work the pack did; the mini pack keeps the foil, so the week's rarity still shows." width="100%">
            <PackStrip state="sealed" />
          </Variant>
          <Variant label="Partly flipped" note="They left after three. The dots say how many are left; the mini pack is open, so no foil." width="100%">
            <PackStrip state="partial" revealed={3} />
          </Variant>
          <Variant label="Done" note="All five seen. The only ask left is the share, and it is quiet." width="100%">
            <PackStrip state="done" />
          </Variant>
        </div>
      </Section>

      <Section title="Rules">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="One object, three sizes">
            <p className="text-text-tertiary typo-footnote">
              Slot pack on Monday, mini pack in the strip, icon pack in the band
              header and the binder. Same foil, same tear line, so the eye learns
              it once.
            </p>
          </Cell>
          <Cell label="The strip never grows">
            <p className="text-text-tertiary typo-footnote">
              Tapping it opens the band as an overlay or scrolls to it, but the
              strip itself stays one row. It is the only Replay element on the
              page from Tuesday.
            </p>
          </Cell>
          <Cell label="Dismiss, then archive">
            <p className="text-text-tertiary typo-footnote">
              Closing the strip removes it for the week. The pack is not lost: it
              sits in the binder under Profile, which is where Oura sends its
              weekly report when you swipe it away.
            </p>
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

export const UpClose: Story = {
  name: 'The pack, up close',
  render: () => {
    const [flipped, setFlipped] = useState(false);
    return (
      <Page>
        <PackStyles />
        <FrameStyles />
        <PageHeader eyebrow="Replay delivery · the pack" title="Foil, backs, and the flip">
          <p>
            The components the pack is made of, so they can be judged on their
            own. The foil is a rarity signal, the card back is the brand mark
            on a pattern, and the flip is the whole interaction.
          </p>
        </PageHeader>

        <Section
          title="The foil says how rare your week was"
          description="The pack takes the ramp of the rarest card inside. Bronze weeks are quiet purple; Emerald weeks shimmer. You know something about your week before you open it, which is the reason to open it."
        >
          <div className="flex flex-wrap items-end gap-8">
            {[RarityTier.Bronze, RarityTier.Silver, RarityTier.Gold, RarityTier.Emerald].map((tier) => (
              <Variant key={tier} label={`${tier[0].toUpperCase()}${tier.slice(1)} week`} note={tier === RarityTier.Emerald ? 'Holographic sweep. Under 1% of developers hold the rare card inside.' : tier === RarityTier.Gold ? 'Holographic sweep, gold edge.' : 'No sweep. Still a pack.'}>
                <FoilPack tier={tier} />
              </Variant>
            ))}
            <Variant label="No rare card" note="A staple-only week. The pack is still a pack; the label just says 5 cards.">
              <FoilPack tier={null} />
            </Variant>
          </div>
          <div className="flex flex-wrap items-end gap-8">
            <Variant label="Mini" note="The strip and the binder header.">
              <FoilPack size="mini" tier={RarityTier.Emerald} />
            </Variant>
            <Variant label="Icon" note="Inline, next to a label.">
              <FoilPack size="icon" tier={RarityTier.Emerald} />
            </Variant>
          </div>
        </Section>

        <Section title="The card back and the flip" description="Click the card.">
          <div className="flex flex-wrap items-start gap-8">
            <Variant label="Face down" note="Index, mark, week. The rare back carries the sweep before it is turned.">
              <div className="flex gap-4">
                <CardBack width={132} index={1} />
                <CardBack width={132} index={2} rare />
              </div>
            </Variant>
            <Variant label="The flip" note="Rotate on Y, 650ms, spring at the end. The rare card lands with an Emerald glow.">
              <FlipCard id={RARE} index={2} width={132} flipped={flipped} onFlip={() => setFlipped((v) => !v)} rare />
            </Variant>
            <Variant label="Front" note="The frame, unchanged. The pack never alters the card itself.">
              <FrameThumb width={132} candidate={byId(RARE)} data={sampleData[RARE]} />
            </Variant>
          </div>
        </Section>

        <Section title="Where the rarity comes from">
          <Table
            head={['Tier', 'Edge', 'Sweep', 'Earned when']}
            minWidth={56}
            rows={[RarityTier.Emerald, RarityTier.Gold, RarityTier.Silver, RarityTier.Bronze].map((tier) => [
              <span className="font-bold" style={{ color: rarityRamp[tier][0] }}>{tier[0].toUpperCase()}{tier.slice(1)}</span>,
              <span className="inline-block h-3 w-12 rounded-[999px]" style={{ background: `linear-gradient(90deg, ${rarityRamp[tier][0]}, ${rarityRamp[tier][1]})` }} />,
              tier === RarityTier.Emerald || tier === RarityTier.Gold ? 'yes' : 'no',
              tier === RarityTier.Emerald ? 'A card in the deck is held by under 1% of developers (achievement rarity, a top-1% standing)' : tier === RarityTier.Gold ? 'Under 5%' : tier === RarityTier.Silver ? 'Under 15%' : 'Everything else',
            ])}
          />
          <Callout tone={CalloutTone.Bad} title="Keep it honest">
            <p>
              The tiers reuse the achievement rarity ladder that already exists
              in the product, so an Emerald pack means what an Emerald badge
              means. If Emerald ever becomes common, the foil stops meaning
              anything, which is the Spotify &quot;top 0.5%&quot; failure in
              another costume.
            </p>
          </Callout>
        </Section>
      </Page>
    );
  },
};

export const ShareAndBinder: Story = {
  name: 'The pack as a share unit, and the binder',
  render: () => (
    <Page>
      <PackStyles />
      <FrameStyles />
      <PageHeader eyebrow="Replay delivery · the pack" title="Two sizes of share, and a place the packs go">
        <p>
          Once it is a pack, the week has a shape that can be posted whole.
          &quot;Post the pack&quot; renders the five cards fanned on the foil, at
          4:5, with the claim as the caption. And a pack that was opened should
          be kept: the binder is the archive, and it quietly makes next Monday
          something to look forward to.
        </p>
      </PageHeader>

      <Section title="Post the pack">
        <div className="flex flex-wrap items-start gap-8">
          <Variant label="The pack, 4:5" note="One image, five cards, the claim. Posts as a single picture on X and LinkedIn.">
            <PackShare />
          </Variant>
          <Variant label="One card, 4:5" note="The existing single-card export. Still there as Copy best card.">
            <FrameThumb width={272} aspect="4:5" candidate={HERO} data={sampleData[HERO.id]} />
          </Variant>
          <div className="flex max-w-[22rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Why a second share size">
              <p>
                A fanned pack is a screenshot of a moment, not a stat. It carries
                the identity card and the standing card together, which is the
                combination the research says travels, and it reads as a
                collection rather than a boast.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Both are server-rendered">
              <p>
                The same renderer that exports one card exports the fan. The
                Snapshot button on the cards pages does this in the browser for
                review; production does it once, at send time, and caches it.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section title="The binder" description="Profile · Replay. Every week that was opened, as its hero card with the week's foil colour as the edge. Next week sits at the top right, sealed, with the day it seals.">
        <Binder />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why keep them">
            <p>
              Dismiss then archive is what Oura does with its weekly report and
              it is table stakes. Beyond that, a row of weeks becomes a second
              thing to post: &quot;six weeks, two Gold, one Emerald&quot; is a
              streak that is about quality rather than attendance.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Neutral} title="Not a collection game">
            <p>
              No sets to complete, no trading, no duplicates. The binder only
              holds what the person actually earned, one per week, and a week
              that had no Replay is simply not there.
            </p>
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const Mobile: Story = {
  name: 'Mobile: pull to tear',
  render: () => (
    <Page>
      <PackStyles />
      <FrameStyles />
      <PageHeader eyebrow="Replay delivery · the pack" title="On the phone, you pull the pack down and let go">
        <p>
          The pull to reveal you liked, with the pack behind the feed instead
          of a card. Drag the feed down: the pack rises as you pull, the strip
          reads &quot;release to tear&quot; past the threshold, and letting go
          tears it and deals the five cards face down at the top of the feed.
          Drag it with the mouse.
        </p>
      </PageHeader>

      <Section title="Live">
        <div className="flex flex-wrap items-start gap-8">
          <PhoneFrame>
            <PhoneShell>
              <PullToTear />
            </PhoneShell>
          </PhoneFrame>
          <div className="flex max-w-[24rem] flex-col gap-4">
            <Callout tone={CalloutTone.Good} title="Why this works on a phone">
              <p>
                Pull-to-refresh was designed as a slingshot: tension, then
                release. Putting the pack behind it turns the gesture people
                already make on Monday morning into the tear, and the reveal is
                theirs. No slot, no banner, no interruption.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Discoverability">
              <p>
                The thin purple lip and &quot;week 37 is in&quot; are the only
                hint. Charm saying the claim once, then shrinking to a badge, is
                the second door for people who never pull. After Tuesday, the
                strip takes over here as well.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Neutral} title="Mechanics">
              <p>
                Threshold at 120 points of pull, capped at 190. Under the
                threshold it springs back. Past it, the tear runs 700ms and the
                feed drops to the top with the five backs in a horizontal row,
                each one flipping in place. The native refresh still works when
                there is no Replay waiting.
              </p>
            </Callout>
          </div>
        </div>
      </Section>
    </Page>
  ),
};

export const Wiring: Story = {
  name: 'Wiring it into the product',
  render: () => (
    <Page>
      <PageHeader eyebrow="Replay delivery · the pack" title="What it takes to ship the pack">
        <p>
          Every piece maps onto something the app already has, plus one
          renderer it does not. The list, surface by surface.
        </p>
      </PageHeader>
      <Section title="Surfaces and components">
        <Table
          head={['Surface', 'Component', 'Where it lives today', 'Notes']}
          minWidth={68}
          rows={[
            ['Desktop feed, Monday', 'FoilPack in slot one', <Mono>FeedItemType.Highlight</Mono>, 'A new item type at index 0. One slot, the card min-height rule from ArticleGrid so the row does not stretch.'],
            ['Desktop feed, after the tear', 'PackBand spanning the row', 'Grid item with column span', 'Same item, second state. Content wrapped absolute inset-0 so the intrinsic height cannot stretch the row (the CSS Grid feed gotcha).'],
            ['Desktop feed, Tuesday to Sunday', 'PackStrip', 'Feed header area, above the grid', 'One row. State from the same delivery record: sealed, partial (with the flip count), done.'],
            ['Mobile feed, Monday', 'PullToTear', 'The feed scroll container', 'Hooks the existing pull gesture; only arms when a Replay is waiting, otherwise native refresh.'],
            ['Mobile feed, after Tuesday', 'PackStrip, compact', 'Above the first post', 'Same component, narrower.'],
            ['Profile', 'Binder', 'A new Replay tab under Profile', 'Reads the delivery history. Also the place the notification and the email deep-link into once the week has passed.'],
            ['Share sheet', 'PackShare and the single card', 'The existing share flow', 'Both rendered server-side at send time; the per-user share code on the image link.'],
            ['Notification, push, email', 'The claim, the mini pack as the thumbnail', 'ReplayReady, see 02 and 04', 'The thumbnail is the pack when sealed, the hero card once opened.'],
          ]}
        />
      </Section>
      <Section title="Data the pack needs that a card did not">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="The rare tier">
            <p className="text-text-tertiary typo-footnote">
              Max rarity across the five cards, from the achievement ladder and
              the standing engine. Already computable at selection time.
            </p>
          </Cell>
          <Cell label="Per-card flipped state">
            <p className="text-text-tertiary typo-footnote">
              Five booleans on the delivery record, so the band, the strip and
              the phone agree on what was seen. Replaces the single resumeAtFrame.
            </p>
          </Cell>
          <Cell label="The band renderer">
            <p className="text-text-tertiary typo-footnote">
              The fan composite for Post the pack. The same server renderer as
              the single card, one more layout.
            </p>
          </Cell>
        </div>
      </Section>
      <Section title="Open questions">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="1 · Does the band stay open all Monday?">
            <p className="text-text-tertiary typo-footnote">
              My pick: yes, for the session it was torn in. Next session it is
              the strip, even on Monday. A row of five cards is a lot of feed to
              give up twice.
            </p>
          </Cell>
          <Cell label="2 · Flip all, or force one by one?">
            <p className="text-text-tertiary typo-footnote">
              My pick: offer Flip all, log how many use it. If most do, the
              one-by-one rhythm is ours, not theirs, and the band should deal
              them face up.
            </p>
          </Cell>
          <Cell label="3 · Foil on Bronze weeks?">
            <p className="text-text-tertiary typo-footnote">
              My pick: quiet purple, no sweep. A shimmer every week is a banner
              by week three. The sweep has to be rare to stay a signal.
            </p>
          </Cell>
          <Cell label="4 · Is Post the pack the default share?">
            <p className="text-text-tertiary typo-footnote">
              My pick: yes at the end of the band, single card everywhere else.
              Test which one gets posted more; my guess is the pack from the
              band and the card from the binder.
            </p>
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};
