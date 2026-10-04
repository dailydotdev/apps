import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  ChapterNav,
  DigIn,
  Feasibility,
  FeasibilityPill,
  Goal,
  Page,
  PageHeader,
  Quote,
  Section,
  Table,
  ChapterStatus,
  Status,
} from './kit';
import { feedback } from './audit';

const meta: Meta = {
  title: 'Mobile UX/7. Gestures and feel',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// Accepted swipe cone: today anything more horizontal than vertical past
// 40px counts; proposed needs the first movement to be horizontal and the
// total to stay inside ±27° (|dx| > 2|dy|).
const SwipeCone = ({ proposed }: { proposed?: boolean }) => {
  const angle = proposed ? 27 : 45;
  const rad = (angle * Math.PI) / 180;
  const r = 110;
  const x = Math.cos(rad) * r;
  const y = Math.sin(rad) * r;
  const cone = {
    fill: proposed
      ? 'var(--theme-accent-avocado-default)'
      : 'var(--theme-accent-ketchup-default)',
    fillOpacity: 0.35,
  };
  const hairline = { fill: 'none', stroke: 'var(--theme-border-subtlest-tertiary)' };
  const dashed = { fill: 'none', stroke: 'var(--theme-text-quaternary)' };
  const label = { fill: 'var(--theme-text-tertiary)', fontSize: 11 };

  return (
    <svg viewBox="-130 -130 260 260" width={220} height={220} aria-hidden>
      <circle r={r} style={hairline} />
      <line x1={-r} x2={r} y1={0} y2={0} style={hairline} />
      <line x1={0} x2={0} y1={-r} y2={r} style={hairline} />
      <path d={`M0 0 L${x} ${-y} A${r} ${r} 0 0 1 ${x} ${y} Z`} style={cone} />
      <path d={`M0 0 L${-x} ${-y} A${r} ${r} 0 0 0 ${-x} ${y} Z`} style={cone} />
      <circle r={proposed ? 56 : 40} style={dashed} strokeDasharray="4 4" />
      <text x={0} y={-r - 8} textAnchor="middle" style={label}>
        scroll
      </text>
      <text x={r + 4} y={4} style={label}>
        next
      </text>
    </svg>
  );
};

const feel = [
  ['Swipe axis lock', 'Every horizontal row (Headlines channels, feed segments, carousels) ignores gestures that start vertical and commits only inside a ±27° cone past 56px with velocity.', Feasibility.Web],
  ['Content follows the finger', 'Segments and channels are a pager: the next panel drags in with the thumb and springs back if the swipe is abandoned. A switch is never a surprise.', Feasibility.Web],
  ['Pull to refresh', 'Web-layer pull on every feed root that refetches the active query. The iOS wrapper turns its own reload-the-document control off (or bridges it to the same refetch) and re-enables bounces.', Feasibility.IosBridge],
  ['Bar at first paint', 'The tab bar renders with the shell; only the badge waits for data. No pop-in after window load.', Feasibility.Web],
  ['Re-tap the active tab', 'Pop to root, then scroll to top, then refresh (Octal rule). Replaces ScrollToTopButton on phones.', Feasibility.Web],
  ['Push and pop motion', 'View Transitions: leaf slides in from the right in 300ms on cubic-bezier(0.32, 0.72, 0, 1), slides out on back; tab switch cross-fades in 150ms; header collapse 200ms. Reduced motion cuts.', Feasibility.Web],
  ['Press states', 'Tab items and bar buttons scale to 0.92 on press, tap highlight transparent, 44pt targets. No 300ms delay to remove, but touch-action: manipulation stays.', Feasibility.Web],
  ['Haptics', 'One light impact on tab change, upvote, bookmark and a streak increment. iOS needs a five-line bridge handler (UIImpactFeedbackGenerator); Android uses navigator.vibrate(10).', Feasibility.IosBridge],
  ['Sheets that behave', 'Grabber, drag to dismiss, damped over-drag, medium detent for Create and options, one sheet at a time. Size from visualViewport when the keyboard is up.', Feasibility.Web],
  ['Safe areas', 'Already correct at the bottom (max(env, .5rem)) and at the top for the ios class. Add the same top handling for Android when its wrapper goes edge to edge.', Feasibility.Android],
];

export const GesturesAndFeel: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Does it behave like software the phone shipped with?"
        title="Fix the swipe that switches channels while you scroll, then add the handful of behaviours every native app has and we have none of."
      >
        <p>
          The code has no pull-to-refresh, no haptics, no press states, no
          push animation, a tab bar that appears after window load, and one
          horizontal swipe handler with a 40px threshold and no axis lock. The
          last one produced a support ticket this month. Everything in this
          chapter except two rows is web-only work.
        </p>
        <ChapterNav current="7" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="1">
        Axis-locked swipe (the reported bug), pull to refresh, motion vocabulary, haptics. The continuous shrink spec moved to 3b.
      </Status>

      <Goal
        goal="Zero accidental gestures and the six behaviours a phone user expects, without a native rewrite."
        metric="Gesture complaints per month (1 to 0), and the store rating trend after phase 3 in chapter 9."
      />

      <Section
        title="The reported bug"
        description="A member scrolling Headlines keeps landing on a different channel."
      >
        <Quote>&ldquo;{feedback.quote}&rdquo;</Quote>
        <div className="grid gap-6 laptop:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-5">
            <span className="font-bold typo-callout">Root cause</span>
            <p className="text-text-secondary typo-footnote">
              HighlightsPage renders its channel tabs with
              TabContainer&apos;s <code>swipeable</code> prop. TabContainer
              wires react-swipeable with <code>delta: 40</code> and
              <code>trackTouch</code>, and calls navigateTab on onSwipedLeft /
              onSwipedRight. react-swipeable decides direction from the total
              movement at touch end: any drag whose horizontal distance beats
              its vertical distance and exceeds 40px is a swipe, even when the
              browser already scrolled the page under that finger. A thumb
              scrolling at a slight angle on a 375px screen crosses 40px of
              horizontal travel in one flick.
            </p>
            <pre className="overflow-x-auto rounded-12 bg-surface-float p-3 text-text-secondary typo-caption1">
              {`// TabContainer.tsx:166
const swipeHandlers = useSwipeable({
  onSwipedLeft: () => navigateTab('next'),
  onSwipedRight: () => navigateTab('previous'),
  trackTouch: true,
  delta: 40,
});`}
            </pre>
          </div>
          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-5">
            <span className="font-bold typo-callout">The fix (and the rule for every swipe surface)</span>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-text-secondary typo-footnote">
              <li>
                Lock the axis on the first 10px of movement. If |dy| ≥ |dx|
                at that point the gesture is a scroll and the handler ignores
                the rest of it entirely.
              </li>
              <li>
                Commit only when |dx| &gt; 56px and |dx| &gt; 2|dy| (a ±27°
                cone), or when velocity exceeds 0.3px/ms with |dx| &gt; 32px.
              </li>
              <li>
                Make the content follow the finger once the axis is locked
                horizontal, and spring back if the threshold is not met.
              </li>
              <li>
                Set <code>touch-action: pan-y</code> on the swipe surface so
                the browser never starts a horizontal history swipe on the
                same drag.
              </li>
            </ol>
            <pre className="overflow-x-auto rounded-12 bg-surface-float p-3 text-text-secondary typo-caption1">
              {`useSwipeable({
  onSwiping: ({ first, absX, absY }) => {
    if (first) axis.current = absY >= absX ? 'y' : 'x';
  },
  onSwiped: ({ dir, absX, absY, velocity }) => {
    if (axis.current !== 'x') return;
    const committed =
      (absX > 56 && absX > absY * 2) ||
      (velocity > 0.3 && absX > 32);
    if (committed) navigateTab(dir === 'Left' ? 'next' : 'previous');
  },
  trackTouch: true,
  delta: 10,
});`}
            </pre>
            <p className="text-text-tertiary typo-caption1">
              The user asked for a toggle or a sensitivity slider. With the
              lock in place neither is needed; a setting would be an admission
              that the gesture is still wrong.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-10">
          <figure className="flex flex-col items-center gap-2">
            <SwipeCone />
            <figcaption className="text-text-tertiary typo-footnote">
              Today: anything past 40px that ends more horizontal than vertical
            </figcaption>
          </figure>
          <figure className="flex flex-col items-center gap-2">
            <SwipeCone proposed />
            <figcaption className="text-text-tertiary typo-footnote">
              Proposed: horizontal from the first 10px, inside ±27°, past 56px
            </figcaption>
          </figure>
        </div>
        <Callout tone={CalloutTone.Good} title="Same rule, everywhere">
          Feed segments (chapter 4), Headlines channels, FeedHeroCarousel,
          Carousel, QuestOfferCarousel and the share sheet&apos;s swipe-down
          all go through one useAxisLockedSwipe hook. Chips rows that are not
          pagers get touch-action: pan-y and no swipe handler at all.
        </Callout>
      </Section>

      <Section
        title="The behaviours we add"
        description="Ten rows. Eight are web-only and can ship behind the header and nav flags; two need a few lines in a wrapper."
      >
        <Table
          head={['Behaviour', 'Spec', 'Needs']}
          rows={feel.map((row) => [
            <span key={row[0] as string} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            <FeasibilityPill key="f" feasibility={row[2] as Feasibility} />,
          ])}
        />
      </Section>

      <Section title="Details that decide whether it feels native">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Motion vocabulary">
            One curve for pushes (cubic-bezier(0.32, 0.72, 0, 1), the iOS
            sheet curve vaul uses), one duration per kind (push 300, sheet
            420, cross-fade 150, collapse 200), compositor properties only,
            will-change set just before an animation and cleared after, and
            prefers-reduced-motion turns every transform into a fade or a cut.
          </Callout>
          <Callout title="Rubber band">
            The iOS wrapper sets scrollView.bounces = false, so feeds stop
            dead at the top and bottom inside the app while they bounce in
            Safari. Turn bounces back on once the web layer owns pull to
            refresh, and keep overscroll-behavior: contain inside sheets only.
          </Callout>
          <Callout title="Keyboard">
            Safari does not resize the layout viewport, so anything
            position: fixed slides under the keyboard. The comment sheet and
            the search field size themselves from visualViewport, the pattern
            EmailCodeVerification already uses.
          </Callout>
          <Callout title="Scroll edge">
            The pinned segmented row and the PageBar get a scroll-edge
            shadow (a 1px hairline that appears once content is under them),
            the iOS 26 replacement for a permanent border.
          </Callout>
        </div>
        <DigIn title="Why not hide the bar on scroll">
          <p>
            Apple forbids hiding the tab bar outside modals; iOS 26 minimizes
            it instead. Smart Interface Design Patterns&apos; rule is the same:
            hiding needs intent, revealing must be cheap. Our proposal shrinks
            the bar to icons and slides the brand row away; the feed selector
            and the active tab stay visible.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="7" />
      </Section>
    </Page>
  ),
};
