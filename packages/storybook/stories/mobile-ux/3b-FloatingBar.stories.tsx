import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Source,
  Table,
  Verdict,
  ChapterStatus,
  Status,
} from './kit';
import { BarMaterial } from './floating';
import {
  BarLook,
  Circle,
  ClusterFrame,
  CreateLook,
  createLookNotes,
  ExploreChromeDemo,
  ExploreCluster,
  HomeChromeDemo,
  LeafTop,
  PostCluster,
  RootCluster,
  chromeSpec,
} from './chrome';
import { floatingResearch } from './floatingResearch';
import { chromeResearch } from './chromeResearch';
import { posts } from './data';

const meta: Meta = {
  title: 'Mobile UX/3b. Floating chrome',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const host = (url: string): string => new URL(url).hostname.replace('www.', '');

const Strip = ({
  children,
  height = 152,
}: {
  children: React.ReactNode;
  height?: number;
}) => (
  <div
    style={{ width: 375, height }}
    className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-accent-onion-default via-accent-cabbage-default to-accent-bun-default opacity-40" />
    <div className="absolute inset-x-0 bottom-2">{children}</div>
  </div>
);

const TopStrip = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{ width: 375, height: 96 }}
    className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-accent-onion-default via-accent-cabbage-default to-accent-bun-default opacity-40" />
    <div className="absolute inset-x-0 top-2">{children}</div>
  </div>
);

const post = posts[0];

export const FloatingChrome: Story = {
  name: 'Floating chrome',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Floating like iOS 26, on both platforms, without a fork. What exactly floats, how big, and how does it shrink?"
        title="Three floating pieces, one shape, one material, one motion. A square button for one action, a bar for a group, a field for an input, all rounded rectangles. They sit 12px off the edges and shrink together as you scroll, the way Instagram's bar and Safari's address pill do."
      >
        <p>
          Round three of the bar. Tsahi&apos;s calls after the first floating
          mock: keep floating, but make it fit Apple&apos;s proportions;
          Create leaves the pill and becomes its own round button like the
          Search circle in Photos; the profile leaves the bar for the top
          header; the Explore search field floats too, in our rectangle
          radius; the post page keeps both its bars, combined the way the
          best apps combine them; the shrink is continuous, Instagram style,
          and improved; and Safari&apos;s button, bar, button row is the
          grammar to borrow. This chapter is the answer to all of that at
          once.
        </p>
        <ChapterNav current="3b" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Shapes, sizes and motion are decided, and on 1 Oct 2026 Tsahi closed the last choice: the selection look is Tint, the filled glyph with nothing behind it. Lens, Dot and Fill stay under Tuning the bar for the record.
      </Status>
      <p className="text-text-tertiary typo-footnote">
        Alternatives and research kept for the record are in the Archive: Tab
        bar, chrome, search and create.
      </p>

      <Goal
        goal="One floating chrome system that covers every screen (roots, leaves, Explore, post) with the same three shapes, the same sizes and the same scroll motion, so it reads native on iOS and calm on Android."
        metric="Chapter 3's second-destination rate, plus scroll depth per session and a frame budget: no long frames from the chrome while a mid-range Android scrolls the feed."
      />

      <Section
        title="The grammar"
        description="Safari's bottom row is a button, a bar and a button that move as one. Ours keeps that arrangement in our own shape: the rounded rectangle today's footer and search field already use, one notch rounder."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="Button · one action">
            Back, Create, More and Share. At the
            bottom, a square whose side equals the bar height (56 at rest, 44
            compact) so it shrinks and pulls in with the bar: Create beside
            the bar, filled, the one action. At the top, fixed 38px squares
            with a 14px radius, inset 16px to line up with the content, that never move or resize, deliberately
            smaller than the bottom bar the way Telegram&apos;s header pills
            sit against its tab bar.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Bar · a group">
            The tab bar (four places, icons only) and the engagement bar on a
            post. Our rectangle, 22px radius at rest and 18px compact, 4px
            inner padding, 56px tall. Every icon in the primary text colour;
            the active one is the filled glyph (Instagram). No purple, no
            block behind it (see Tuning the bar).
          </Callout>
          <Callout tone={CalloutTone.Good} title="Field · an input">
            The search field on Explore, floating above the tab bar. It
            shares its height, radius and motion with the post page action
            bar (52 at rest, 44 compact, takes the bar&apos;s slot on scroll)
            so the two accessories are one component family. Tapping it opens
            Spotlight.
          </Callout>
        </div>
        <div className="flex flex-wrap gap-6">
          <Cell label="Bottom cluster on a root" note="Tab bar + Create beside it, the one filled piece. Profile is the avatar in the top header. A detached Search square was tried and dropped as a duplicate of Explore's field.">
            <Strip>
              <RootCluster material={BarMaterial.Glass} />
            </Strip>
          </Cell>
          <Cell label="Top cluster on a leaf" note="Back button left, action buttons right, nothing in the middle. Fixed 38px, smaller than the bar (Telegram); they never shrink or pull in.">
            <TopStrip>
              <LeafTop
                material={BarMaterial.Glass}
                p={1}
                actions={
                  <>
                    <Circle material={BarMaterial.Glass} fixed>
                      <ShareIcon size={IconSize.Small} />
                    </Circle>
                    <Circle material={BarMaterial.Glass} fixed>
                      <MenuIcon size={IconSize.Small} />
                    </Circle>
                  </>
                }
              />
            </TopStrip>
          </Cell>
          <Cell label="Explore root" note="The search field floats above the tab bar at rest; on scroll the tab bar slides away and the field stays at the bottom as a compact bar, exactly like the post leaf.">
            <Strip height={152}>
              <ExploreCluster material={BarMaterial.Glass} />
            </Strip>
          </Cell>
          <Cell label="Post leaf" note="Action bar above the tab cluster at rest; it takes the cluster's slot as you scroll.">
            <Strip height={212}>
              <PostCluster material={BarMaterial.Glass} post={post} />
            </Strip>
          </Cell>
        </div>
      </Section>

      <Section
        title="Apple's proportions, and ours"
        description="Measured from Apple's own iOS 26 screenshots at 2.42px per point, cross-checked with Apple DTS threads and a pixel-exact recreation. Where Apple's number does not fit a 375px web viewport, the column on the right says what we use and why."
      >
        <Table
          head={['Value', 'Apple iOS 26', 'Ours', 'Source']}
          rows={chromeResearch.spec.map((row) => [
            <span key={row.value} className="font-bold text-text-primary">
              {row.value}
            </span>,
            row.apple,
            row.ours,
            row.source ? (
              <Source key={row.source} href={row.source}>
                {host(row.source)}
              </Source>
            ) : (
              ''
            ),
          ])}
        />
        <div className="flex flex-wrap gap-6">
          <Cell label="At rest · p = 0" note={`${chromeSpec.rest}px bar, ${chromeSpec.inset}px inset, ${chromeSpec.gap}px gap, ${chromeSpec.restRadius}px radius, icons only.`}>
            <ClusterFrame p={0} />
          </Cell>
          <Cell label="Half way · p = 0.5" note="Height and inset are interpolating. This frame exists on screen for a few pixels of scroll only.">
            <ClusterFrame p={0.5} />
          </Cell>
          <Cell label="Compact · p = 1" note={`${chromeSpec.compact}px, icons only, Create button matches. All targets stay 44px.`}>
            <ClusterFrame p={1} />
          </Cell>
        </div>
      </Section>

      <Section
        title="Create button: tint"
        description="Tsahi found the primary fill (white on dark) too dominant and picked Material: the same material as the bar with a primary glyph. Every cluster in the Storybook uses it. The square's size, radius and position do not change."
      >
        <div className="flex flex-wrap items-start gap-6">
          <ClusterFrame p={0} createLook={CreateLook.Material} plain />
          <ClusterFrame p={0} createLook={CreateLook.Material} />
          <div className="flex max-w-xs flex-col gap-1 pt-1">
            <span className="font-bold typo-callout">Material (the pick)</span>
            <span className="text-text-tertiary typo-footnote">{createLookNotes[CreateLook.Material]}</span>
          </div>
        </div>
      </Section>

      <Section
        title="Tuning the bar"
        description="Tsahi liked the top buttons and not the bar. Measured against Instagram, X, Facebook and the HIG, the differences were: labels (none of the three apps has them), height (Instagram's bar is about 54pt, Apple's 62), icon colour (Instagram keeps every icon black and marks the active one by filling it), the purple badge, and a plus glyph heavier than the bar icons. All fixed below; the corner radius stays ours."
      >
        <div className="flex flex-wrap gap-6">
          <Cell label="Icons only" verdict={Verdict.Ship} note="Instagram, X and Facebook: no labels, 56px bar, 32px icon boxes (about 24px of glyph, Instagram's size), the active one filled. Every icon in the primary colour; inactive ones at 72% so nothing looks greyed out.">
            <ClusterFrame p={0} />
          </Cell>
          <Cell label="Icons only, compact" note="44px, pulled in to a 40px inset.">
            <ClusterFrame p={1} />
          </Cell>
        </div>
        <Callout tone={CalloutTone.Good} title="What changed this round">
          Labels off by default (the three apps Tsahi named run icon-only
          bars); bar 56px at rest like Instagram&apos;s instead of Apple&apos;s
          62; all icons in the primary colour with only the fill marking the
          active one (Instagram); the badge is the brand bubble from the layout v2 rail (revised 1 Oct: purple, a rounded rectangle, never a red circle); the plus in
          the Create button matches the bar icons&apos; weight instead of
          being a larger, thinner glyph. Radius unchanged: 22 at rest, 18
          compact, our rectangle.
        </Callout>
        <div className="flex flex-wrap gap-6">
          <Cell label="Tint" note="Filled icon, nothing behind it. The default.">
            <ClusterFrame p={0} look={BarLook.Tint} />
          </Cell>
          <Cell label="Tint, compact" note="Same look at p = 1: 46px tall, pulled in to a 40px inset.">
            <ClusterFrame p={1} look={BarLook.Tint} />
          </Cell>
        </div>
        <DigIn title="What was off, and what changed">
          <p>
            Radius: the buttons at 46px with an 18px radius are a third round;
            the bar at 62px with the same 18px was under a third, so it read
            boxier than the buttons beside it. Now both scale together. Lens:
            a grey block inside a glass bar reads like a pressed key on our
            palette (Apple gets away with it because the lens is itself
            glass). Weight: outline icons in the primary colour made every
            item look active; the unselected ones now use the tertiary text
            colour and the selected one is the filled glyph in the primary
            colour, black rather than purple. Icon:
            the AI-sparkle magnifier meant Explore, but it looked like Search
            next to the search field, so Explore is a compass.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Two bars on one screen: how the good ones combine them"
        description="The post page keeps its engagement bar and its tab bar. This is what Apple and the peer apps do when a screen needs both."
      >
        <Table
          head={['App', 'Screen', 'The two bars', 'While scrolling', 'Takeaway', 'Source']}
          rows={chromeResearch.combos.map((row) => [
            <span key={row.app} className="font-bold text-text-primary">
              {row.app}
            </span>,
            row.screen,
            row.bars,
            row.whileScrolling,
            row.takeaway,
            <Source key={row.source} href={row.source}>
              {host(row.source)}
            </Source>,
          ])}
        />
        <Callout tone={CalloutTone.Good} title="The rule we take">
          The second bar is an accessory. At rest it sits above the tab
          cluster on its own glass. As you scroll, the tab cluster slides
          down out of the screen with the scroll and the accessory takes its
          slot, shrinking and pulling in exactly like the Home bar. One row
          while you read, two rows the moment you scroll back up, and no
          state change anywhere in between.
        </Callout>
      </Section>

      <Section
        title="The shrink, Instagram's idea taken further"
        description="Instagram's bar gets shorter and narrower as you scroll. Ours does both continuously, direction-aware, and merges the second bar instead of stacking it."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          {chromeResearch.shrink.map((item) => (
            <Callout key={item.title} title={item.title}>
              {item.body}
            </Callout>
          ))}
        </div>
        <Table
          head={['Progress p', 'Bar', 'Labels', 'Buttons', 'Second bar', 'Header']}
          rows={[
            ['0 (top or scrolled up)', '56px tall, 20px from the edges', 'n/a (icons only)', '56px', 'own row above the cluster', 'brand row + segments'],
            ['0 to 0.5', '56 to 50px tall, edges pull in 20 to 30px', 'n/a', '56 to 50px', 'shrinks with the cluster', 'brand row slides away'],
            ['0.5 to 1', '50 to 44px tall, edges pull in to 40px', 'n/a', '50 to 44px', 'tab row slides below the screen; the accessory is now in the bottom slot', 'segments pinned, blurred'],
            ['any scroll up', 'reverses at the same rate', 'n/a', 'reverse', 'tab row slides back up under the accessory', 'brand row returns'],
            ['top buttons, any p', 'n/a', 'n/a', 'fixed 38px, 16px inset, never move', 'n/a', 'n/a'],
          ]}
        />
        <DigIn title="What is better than Instagram's version">
          <p>
            Shorter and narrower together: height 56 to 44 while the side inset grows 20 to 40, so the cluster visibly pulls in from the edges the way Instagram's does. Direction-aware from the first pixel: a short flick up re-grows
            the chrome without reaching the top, so it never feels stuck
            small. Progress is bounded to 96px of travel so the whole
            transition is visible, not a blink. The second bar takes the first one's place instead
            of stacking, so reading a post costs one row of chrome, not two.
            Targets never drop below 44px; only labels and padding give way.
            A light haptic marks the fold at p = 0.5, and tapping any circle
            or capsule at p = 1 re-expands before acting, the iOS 26 rule.
            prefers-reduced-motion turns the interpolation into a cut at 0.5.
          </p>
        </DigIn>
        <DigIn title="How it is built">
          <p>
            One scroll progress value per screen. Chrome heights, label
            opacity and button sizes read it through CSS custom properties;
            in Safari 26 and Chrome 115+ the same values can come from a
            scroll-driven animation timeline with no JavaScript on the scroll
            path. The fold at p = 0.5 is a state change animated with a
            200ms spring (bounce 0). Blur radius is never animated. Content
            keeps a bottom padding equal to the rest height so the last card
            is reachable at any p.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Try it"
        description="Each phone scrolls for real. Watch the header, the cluster and the second bar move on the same progress."
      >
        <PhoneRow>
          <Cell label="Home root" verdict={Verdict.Ship} note="Brand row slides away, segments pin, tab bar and Create button shrink together.">
            <HomeChromeDemo />
          </Cell>
          <Cell label="Explore root" verdict={Verdict.Ship} note="The places and, then the Explore feed itself, scrollable. Scroll and the tab bar slides away while the search field takes its slot as a compact bar. Tapping it opens Spotlight.">
            <ExploreChromeDemo />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The decision"
        description="One web app, one chrome. Platform differences are handled by material, never by layout."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Pick: the floating cluster, continuous shrink, everywhere">
            Tab bar (Home · Explore · Squads · Activity) with Create beside
            it on every root; the Explore search field and the post action
            bar as accessories that take the bar&apos;s place on scroll;
            fixed, smaller back and action buttons on every leaf, nothing in
            the middle. Continuous shrink over 96px of travel,
            direction-aware, never collapsing to a single tab.
          </Callout>
          <Callout tone={CalloutTone.Good} title="One material on both platforms">
            The flat blur (production&apos;s bar recipe) on iOS and on
            Android alike; Tsahi&apos;s call in round 5: the two platforms
            look the same and neither gets glass. Solid is only the fallback
            when the OS asks for reduced transparency or a WebView cannot
            draw the blur at frame rate, and it is measured, not assumed.
            No glass rim or highlight anywhere, the material stays as flat
            as today&apos;s action bar. Same
            component, one class.
          </Callout>
          <Callout title="What changes elsewhere">
            Chapter 4&apos;s PageBar becomes the top cluster (same content,
            floating). Chapter 6 keeps both bars on the post page via the
            accessory fold, and the &quot;hide the tab bar&quot; option is
            withdrawn. Chapter 3&apos;s You tab becomes the header avatar.
          </Callout>
          <Callout title="Mobile web in Safari 26">
            Safari&apos;s own compact address pill sits at the bottom. On
            the mobile web only, the cluster starts at p = 1 and sits 8px
            above Safari&apos;s pill; in the store apps there is no Safari
            pill and it starts at rest. Same components, one prop.
          </Callout>
        </div>
        <Quote>
          Borrow the shapes and the shrink from iOS 26, borrow the opaque
          restraint from Android, and let the material degrade instead of the
          layout.
        </Quote>
        <DigIn title="Material spec">
          <p>
            Flat blur, production&apos;s own recipe: the blur-baseline token
            (the surface at 88%) over a 40px backdrop blur, a 1px
            border-subtlest-tertiary ring, one soft shadow (0 4px 30px at
            12%). No inner highlight, no rim, no saturation boost. Solid:
            background-popover with the same ring and shadow, for Android and
            reduced transparency. Radius 22px at rest and 18px compact on the
            bar and the bottom buttons, 14px on the fixed top buttons, 18px
            on fields.
          </p>
        </DigIn>
        <DigIn title="Fallback triggers">
          <p>
            Solid when any of: the platform is Android; the iOS wrapper
            reports Reduce Transparency through a bridge flag (Safari does
            not expose prefers-reduced-transparency, Chrome 118+ does);
            navigator.deviceMemory ≤ 2 or Save-Data on; or a runtime check
            finds more than 10% long frames while scrolling. The switch is a
            class, the layout never changes.
          </p>
        </DigIn>
      </Section>

      <Section title="Sources">
        <ul className="flex flex-col gap-1 text-text-tertiary typo-footnote">
          {[...chromeResearch.sources, ...floatingResearch.sources]
            .filter(
              (source, index, all) =>
                all.findIndex((entry) => entry.url === source.url) === index,
            )
            .map((source) => (
            <li key={source.url}>
              <Source href={source.url}>{source.label}</Source>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="3b" />
      </Section>
    </Page>
  ),
};
