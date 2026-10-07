import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { linkTo } from '@storybook/addon-links';
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
import { MockFeed, PostCard } from '../FeedMocks';
import {
  ChapterBand,
  ConceptStyles,
  InlineDeck,
  Inspiration,
  LiveStanding,
  MascotHint,
  Masthead,
  PackOpening,
  PullToReveal,
  SealedEnvelope,
  StampedPost,
} from './concepts';
import { Variant } from './mocks';

const meta: Meta = {
  title: 'Replay delivery/00. Feed concepts',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Nine ways the week could arrive in the feed that are not a card in a slot, each borrowed from a product that made a personal moment feel like an event.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Concepts: Story = {
  name: 'Nine concepts',
  render: () => (
    <Page>
      <ConceptStyles />
      <PageHeader eyebrow="Replay delivery" title="The week should arrive, not appear">
        <p>
          A card in a slot is what every feed does with everything, so it reads
          as one more post. The products that made a personal recap into a
          ritual gave it a shape of its own: something sealed, something that
          moves, something that was building all week. Nine concepts, each
          rendered in the feed, several of them live. Click the pack, the seal,
          the deck and the dog. Sources for every borrowed pattern are in{' '}
          <Mono>plans/weekly-recap/research/feed-entry-points.md</Mono>.
        </p>
      </PageHeader>

      <Section
        title="1 · The pack"
        description="Five cards arrive as a sealed foil pack in slot one. Tear the strip and they fan out, hero in front, the rare one called out. The deck already is a deck; this makes it physical."
      >
        <MockFeed injected={<PackOpening />} at={0} count={3} />
        <div className="flex flex-wrap items-start gap-4">
          <Inspiration>Pokémon TCG Pocket: flip, swipe the seal, cards spill out one by one</Inspiration>
          <Inspiration>Duolingo&apos;s reward chest: each tap wiggles it, then it opens</Inspiration>
        </div>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              Unboxing is one of the most filmed interactions on the internet,
              and pack openings specifically are a genre. The tear is a second
              of anticipation the person controls, the fan is the reward, and
              &quot;rare pull&quot; gives the achievement card a stage without a
              separate notification. It also stops being a post: nobody scrolls
              past a sealed thing with their name on it.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              Gacha connotations. The foil has to read as a wrapped gift, not a
              loot box: no randomness, no currency, the same five cards whether
              they tear it or not. Two lessons from the Pokémon critique: the
              tear affordance must be obvious (theirs was not), and a stray tap
              must never skip the reveal. The quiet foil variant below is the
              version for people who find the shimmer too much.
            </p>
          </Callout>
        </div>
        <div className="flex flex-wrap gap-6">
          <Variant label="Sealed, quiet foil" note="Dark foil, no shimmer. Same tear." width="21rem">
            <PackOpening quiet />
          </Variant>
          <Variant label="Already open" note="Tuesday. The fan stays as the entry, the CTA reads Open." width="21rem">
            <PackOpening initial="open" />
          </Variant>
        </div>
      </Section>

      <Section
        title="2 · The sealed envelope"
        description="A letter addressed to them, a wax seal with the mark, and the hero card slides out when the seal breaks. Same anticipation as the pack, none of the gaming vocabulary."
      >
        <MockFeed injected={<SealedEnvelope />} at={0} count={3} />
        <Inspiration>Year in Monzo, pinned to the top of Home while it is live, then removed · a letter, generally</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              Mail addressed to you is the oldest personalization there is. The
              seal is a single tap with an obvious result, it reads as premium
              rather than playful, and it survives being screenshotted closed:
              &quot;week 37 is in&quot; on a sealed envelope is a post on its own.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              Slower than the pack and less repeatable: a wax seal every Monday
              wears thin faster than a pack, which has the rare pull to vary it.
              Best for the annual Replay, or the first one a person ever gets.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="3 · Charm, peeking"
        description="No slot, no banner. Charm walks in at the bottom of the phone, says the claim, offers the rest. Ignored, it shrinks to a badge that waits all week; the bob is the only motion on the page."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PhoneFrame>
            <MascotHint />
          </PhoneFrame>
          <PhoneFrame>
            <MascotHint minimized />
          </PhoneFrame>
          <div className="flex max-w-[22rem] flex-col gap-4">
            <Inspiration>Duolingo&apos;s widget: Duo&apos;s expression changes through the day until you act · Clippy, honestly</Inspiration>
            <Callout tone={CalloutTone.Good} title="Why it works">
              <p>
                A character can say &quot;top 2%&quot; to you in a way a banner
                cannot: it is somebody telling you, not the interface announcing
                it. Charm already exists and already carries emotional moments in
                the product, so this costs no new vocabulary. And it takes zero
                feed real estate on the surface where real estate is scarcest.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Risk">
              <p>
                Mascots wear out their welcome if they talk too often. Charm
                speaks once a week, about this, and never about anything else.
                Borrow Duo&apos;s widget trick for the badge: the expression
                changes from Monday to Wednesday, then stops escalating.
                Desktop gets the badge, not the speech.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        title="4 · The chapter band"
        description="The feed gets a chapter break. Between last week's posts and this week's, a full-width band with the five cards laid out like a filmstrip, hero first. Editorial, not promotional; it belongs to the timeline."
      >
        <MockFeed injected={<ChapterBand />} at={3} count={6} />
        <Inspiration>Instagram&apos;s &quot;You&apos;re all caught up&quot; divider · Google Photos Memories row · Apple Music Replay&apos;s shelf (buried at the bottom of Home, which is the warning)</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              It answers the question a Monday feed raises anyway: where did
              last week go? Showing five cards at once says there is a set, not
              one card, which the single-slot card never managed. And it does
              not interrupt: it sits in the scroll where the week boundary is.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
              <p>
                Needs the full width, so on a phone it becomes a horizontal
                carousel, which people scroll past faster than they scroll
                through. Works best on desktop and in the extension, where the
                grid is wide and the Monday session is long.
              </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="5 · The masthead"
        description="On Monday the top of the feed becomes the Replay: the claim at poster size, the cards floating in, the brand artwork behind. Scroll and it collapses to a thin bar that stays until opened."
      >
        <MockFeed above={<Masthead />} count={3} />
        <MockFeed above={<Masthead collapsed />} count={3} />
        <Inspiration>Spotify Wrapped&apos;s pill at the top of Home that opens a hub · Reddit Recap&apos;s feed banner · Steam Replay&apos;s storefront banner</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              It is the only concept that makes Monday look different from
              Tuesday before anything is read. The collapse is the decay we
              wanted, done with one component instead of four, and the bar is a
              week-long entry that costs a single row.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              A takeover is what marketing does, and readers know it. The
              artwork and the poster type have to stay on the product side of
              that line, and it should only ever be full height once per week.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="6 · The live standing"
        description="The recap stops being a surprise and becomes a resolution. A small module in the rail shows your standing in your top topic all week, live. Sunday night it counts down; Monday it seals into the Replay. The week becomes something you watch."
      >
        <div className="flex flex-wrap items-start gap-6">
          <LiveStanding state="live" />
          <LiveStanding state="sealing" />
          <LiveStanding state="sealed" />
        </div>
        <Inspiration>WHOOP&apos;s assessment that lands every Monday · Strava&apos;s weekly snapshot at the top of the feed · Duolingo&apos;s league that closes Sunday night</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              Duolingo&apos;s leagues drive a quarter more lessons because the
              standing is visible and the deadline is Sunday. A live standing
              turns the Replay into the end of a story the person was already
              in, so Monday&apos;s open is not a decision, it is finding out how it
              ended. It also gives the rail a reason to exist on a Wednesday.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              Needs the weekly aggregate job running daily rather than once on
              Monday, and a rule for people whose standing falls during the
              week: the module shows the best topic they are climbing in, never
              one they are sliding down.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="7 · The inline deck"
        description="The deck sits at the top of the feed as a physical stack and you flip through it right there, no viewer, no modal. Five taps, and it collapses to a row with the share button on it."
      >
        <MockFeed above={<InlineDeck />} count={3} />
        <Inspiration>Tinder&apos;s stack · the CardDeck already in this Storybook</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              Zero transition cost. The person never leaves the feed, so the
              first card is seen by everyone who sees the feed, which is the
              whole audience. Completion is five taps in place, and the share
              button arrives exactly when they are done.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              Cards at 144 pixels wide lose the detail the frames were built
              for, and sharing from a small stack is a smaller moment than
              sharing from a full-screen deck. Best as the mobile shape of the
              hero slot, with a tap-to-enlarge.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="8 · Pull to reveal"
        description="On Monday the feed hides the Replay above its own top edge. A sliver shows; pull down and the card comes with it; release to open. The refresh gesture people already make, once a week, hands them the week."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PhoneFrame>
            <PullToReveal />
          </PhoneFrame>
          <PhoneFrame>
            <PullToReveal pulled />
          </PhoneFrame>
          <div className="flex max-w-[22rem] flex-col gap-4">
            <Inspiration>Tweetie&apos;s original pull-to-refresh, built as slingshot anticipation · Instagram&apos;s over-pull confetti easter egg</Inspiration>
            <Callout tone={CalloutTone.Good} title="Why it works">
              <p>
                Delight through a gesture that is already a habit, and the
                only concept where the person physically pulls the week into
                view. Costs nothing in the feed and reads as a secret.
              </p>
            </Callout>
            <Callout tone={CalloutTone.Bad} title="Risk">
              <p>
                Secrets are missed. Alone it will be found by a minority; paired
                with Charm&apos;s hint it is a nice second door. Mobile only.
              </p>
            </Callout>
          </div>
        </div>
      </Section>

      <Section
        title="9 · The stamped post"
        description="Strava prints a goal banner on the activity that completed it. Here the post that tipped you into the top 2% carries the claim as a ribbon, in the feed, where it happened. The Replay is one tap behind it. The only concept that ties the standing to a thing the person actually read."
      >
        <MockFeed injected={<StampedPost />} at={1} count={5} />
        <Inspiration>Strava&apos;s goal-completion banner on the activity card · GitHub&apos;s contribution graph as identity</Inspiration>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why it works">
            <p>
              Ownership with a cause. &quot;Top 2%&quot; on a banner is a claim;
              &quot;this post put you in the top 2%&quot; is a story with a
              beginning. It also gives the standing a home in the feed after
              Monday without a slot of its own, because the post was going to be
              there anyway.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Risk">
            <p>
              Needs a real tipping item, which the aggregate job can name for
              rank cards and cannot for archetypes. Works for standing weeks,
              not for every week; a second door, not the front one.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="What the research says" description="Ten patterns ranked for transferability, from the briefing. The two anti-patterns are the ones to design against.">
        <Table
          head={['Pattern', 'From', 'Concept here', 'Risk']}
          minWidth={64}
          rows={[
            ['A small persistent entry that opens a hub', 'Spotify Wrapped pill', '5 · masthead, collapsed', 'Banner-blind by week three; rotate the copy'],
            ['The milestone stamped on the content that caused it', 'Strava goal banner', '9 · stamped post', 'Needs a real triggering item'],
            ['Tear to open, cards spill out', 'Pokémon TCG Pocket', '1 · the pack', 'Obvious affordance; no accidental skip'],
            ['A rarity tier on the last card', 'Reddit Recap Superpower', 'The rare pull in 1', 'Inflated rarity kills it'],
            ['The archetype as a second share moment', 'Duolingo learner style, Spotify Clubs', 'persona.week, always in the deck', 'Horoscope labels'],
            ['Dismiss, then archive', 'Oura weekly report', 'Every concept: Profile > Replay keeps it', 'None'],
            ['A mascot whose state decays', 'Duolingo widget', '3 · Charm', 'Stop escalating after day three'],
            ['Share for a visible reward', 'Duolingo badge, PlayStation avatar', 'The handoff', 'Cheap-feeling rewards'],
            ['A divider with a payload at the natural pause', 'Instagram caught-up', '4 · chapter band', 'Only heavy readers reach it'],
            ['A fixed arrival day', 'WHOOP Monday, Apple Music Sunday', 'Monday, always', 'Thin week, thin recap: send nothing instead'],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Do not hijack the scroll">
            <p>
              Apple removed the Memories carousel from the top of Photos after
              users rejected a horizontal swipe where they expected a vertical
              one. The chapter band stays a vertical, in-flow element on phones,
              never a swipe row.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not bury it">
            <p>
              Apple Music Replay sits at the bottom of Home, and every December a
              how-to article has to explain where it is. Whatever ships, it is
              above the first post on Monday.
            </p>
          </Callout>
        </div>
      </Section>

      <Section title="Side by side">
        <Table
          head={['Concept', 'Feed cost', 'Motion', 'Shows the set', 'Repeats weekly', 'Best surface', 'Verdict']}
          minWidth={72}
          rows={[
            ['1 · The pack', 'One slot, Monday', 'Tear, fan', 'Yes, five cards', 'Yes, rare pull varies it', 'All', 'Ship as the Monday entry'],
            ['2 · The envelope', 'One slot', 'Seal, slide', 'Hero only', 'Wears thin', 'All', 'Annual and first-ever Replay'],
            ['3 · Charm', 'None', 'Bob', 'No, says the claim', 'Yes, once a week', 'Mobile', 'Ship as the mobile hint'],
            ['4 · The chapter band', 'One row, wide', 'None', 'Yes, filmstrip', 'Yes', 'Desktop, extension', 'Ship on desktop for Tue to Wed'],
            ['5 · The masthead', 'Top of feed', 'Collapse', 'Two cards', 'Yes', 'Desktop', 'Test against the pack'],
            ['6 · The live standing', 'Rail module', 'Pulse', 'Resolves into it', 'It is the week', 'Desktop rail, mobile header', 'Ship, needs daily aggregate'],
            ['7 · The inline deck', 'Top of feed', 'Flip', 'Yes, in place', 'Yes', 'Mobile', 'Mobile shape of the open pack'],
            ['8 · Pull to reveal', 'None', 'Pull', 'Hero', 'Yes', 'Mobile', 'Second door, with Charm'],
            ['9 · The stamped post', 'None, rides a post', 'None', 'No, one claim', 'Standing weeks', 'All', 'Ship for rank cards, Tue onward'],
          ]}
        />
      </Section>

      <Section title="The combination I would build">
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="All week" note="6 · the live standing">
            <p className="text-text-tertiary typo-footnote">
              The rail shows the standing climbing in the person&apos;s best topic.
              The week is a story with a Sunday deadline; Replay is how it ends.
            </p>
          </Cell>
          <Cell label="Monday" note="1 · the pack">
            <p className="text-text-tertiary typo-footnote">
              The sealed pack in slot one, the standing module reading
              &quot;sealed&quot;. Tear, fan, open. On mobile the fan is the inline
              deck (7), so nobody leaves the feed to see card one.
            </p>
          </Cell>
          <Cell label="Tuesday onward" note="4, 9, then 3">
            <p className="text-text-tertiary typo-footnote">
              Desktop: the open pack becomes the chapter band, then the thin bar;
              the post that tipped the standing wears the ribbon. Mobile: Charm
              says the claim once, then waits as a badge. Pull to reveal stays as
              the Easter egg for people who find it.
            </p>
          </Cell>
        </div>
        <Callout tone={CalloutTone.Good} title="Why this and not a card">
          <p>
            A card in a slot asks the person to decide to open it. A pack asks
            them to tear it, a standing they watched all week asks them to find
            out how it ended, and a dog asks them a question. None of those are
            decisions. That is the difference between a feature people use and a
            Monday people expect.
          </p>
        </Callout>
        <button
          type="button"
          onClick={linkTo('Replay delivery/01. In the feed', 'Seven entry points')}
          className="w-fit rounded-12 border border-border-subtlest-tertiary bg-surface-float px-4 py-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
        >
          The conventional entry points, for comparison →
        </button>
        <div className="hidden">
          <PostCard index={0} />
        </div>
      </Section>
    </Page>
  ),
};
