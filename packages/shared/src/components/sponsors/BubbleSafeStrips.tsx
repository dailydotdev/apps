import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { SponsoredStripProps } from './SponsoredStrip';
import { Divider, PartnerRow, PrimaryLockup } from './SponsoredStrip';

// =============================================================
// Ten technical answers to one problem: the browser's link
// tooltip covers the bottom-left of the viewport, and that is
// where the strip's paid mark sits.
//
// Constraint for all ten: the bar looks like the original. Flush
// to the bottom, full feed width, sticky, one row, opaque, no
// float. What changes is never the look — it is the geometry,
// the ordering, or what the page tells the browser to display.
//
// What is actually known about the tooltip, because the fixes
// depend on it:
//   - it is browser chrome, painted over the page; it cannot be
//     read, styled or suppressed from JS
//   - it is anchored to the bottom-left corner of the viewport,
//     and jumps to the bottom-right if the pointer comes near it
//   - its height is roughly 20-25px at 100% zoom and scales with
//     page zoom
//   - its WIDTH is the width of the URL being shown, truncated
//     around half the viewport
//
// That last point is the one most people miss, and it is the
// cheapest lever available: a shorter href is a smaller tooltip.
//
// Three families:
//   Give it nothing to cover  — 1, 2, 3, 10
//   Make it smaller           — 4, 5
//   Move only when it matters — 6, 7, 8, 9
// =============================================================

type VariantProps = Pick<SponsoredStripProps, 'primary' | 'partners'>;

/** The original bar, unchanged, for every variant to build on. */
const BAR =
  'sticky bottom-0 z-3 flex w-full items-center gap-5 border-t border-border-subtlest-tertiary bg-background-default px-4 laptop:px-10';

/**
 * Height is fixed and small. Width is neither — and that
 * asymmetry decides which of the fixes below actually work.
 *
 * Measured on the live feed, 28 links on one screen, at the 12px
 * UI font the tooltip uses:
 *
 *   nav and tag links      33 chars    189px    13% of a 1440 screen
 *   post slugs             68 chars    393px    27%
 *   ad click-throughs     742 chars    clipped  50% (the cap)
 *
 * So a horizontal clearance has to be ~400px to survive an
 * ordinary post and half the viewport to survive a promoted card.
 * At that point the bar has no room left. A vertical clearance is
 * 26px whatever the URL says, which is why the width-independent
 * fixes are the ones that hold.
 */
export const TOOLTIP_HEIGHT = 26;

/** Clears nav links. Does NOT clear a post slug — see above. */
export const TOOLTIP_SAFE_WIDTH = 320;

/** What a post slug actually needs. */
export const TOOLTIP_SLUG_WIDTH = 400;

/** Chrome truncates around here, so this is the true worst case. */
export const TOOLTIP_MAX_FRACTION = 0.5;

// --- shared behaviour -----------------------------------------

/**
 * The href currently under the pointer, or null. This is as close
 * to detecting the tooltip as the platform allows: we cannot see
 * it, but we know exactly when the browser is about to draw one,
 * and for which URL.
 */
export const useHoveredHref = (): string | null => {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const anchor = (event.target as HTMLElement)?.closest?.('a[href]');

      setHref(anchor ? (anchor as HTMLAnchorElement).href : null);
    };

    document.addEventListener('pointerover', onOver, { passive: true });

    return () => document.removeEventListener('pointerover', onOver);
  }, []);

  return href;
};

// --- 1. Left gutter -------------------------------------------
// Keep the bar identical and start its content past the tooltip.
// Sized to clear a post slug (400px), which covers the common
// case — but NOT a promoted card's click-through, which is
// clipped at half the viewport and would need a gutter wider than
// the content it protects. Good for ordinary links, not a
// guarantee.
export const GutterStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className={classNames(BAR, 'h-10')}>
    <span
      aria-hidden
      className="shrink-0"
      style={{ width: TOOLTIP_SLUG_WIDTH }}
    />
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 2. Right-anchored ----------------------------------------
// Same bar, reversed reading order: the paid mark sits at the
// right end and the wall fills back towards the left, so what the
// tooltip covers is the tail of the wall. Paired with the wall's
// per-load shuffle, the mark it buries is a different one every
// session rather than the same one for ever.
export const RightAnchoredStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className={classNames(BAR, 'h-10 flex-row-reverse')}>
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 3. Sacrificial band --------------------------------------
// A taller bar whose content is top-aligned. The bottom 26px are
// padding — the tooltip lands in dead space inside the bar rather
// than on the marks. Reads as a slightly roomier strip, and the
// occlusion problem disappears without anything moving.
export const BandStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div
    className={classNames(BAR, 'h-16 items-start pt-2')}
    style={{ paddingBottom: TOOLTIP_HEIGHT }}
  >
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 4. Short href --------------------------------------------
// Nothing changes in the strip at all. The tooltip is as wide as
// the URL inside it, so serving cards a short canonical link
// (/p/<id>, 301ing to the slug) shrinks it from most of the bar
// to a stub that a modest gutter already clears. The only fix
// here that costs no layout whatsoever — it is a routing change.
export const ShortHrefStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className={classNames(BAR, 'h-10')}>
    <span aria-hidden className="w-24 shrink-0" />
    <PrimaryLockup primary={primary} />
    <Divider />
    <PartnerRow partners={partners} />
  </div>
);

// --- 5. Narrow anchor -----------------------------------------
// The tooltip appears when an anchor is hovered, and a feed card
// is usually one big anchor. Shrinking the link to the title
// alone means most of the pointer's time over a card produces no
// tooltip at all. Fewer appearances rather than a safer strip —
// best combined with one of the others.
export const NarrowAnchorStrip = ShortHrefStrip;

// --- 6. Lift on hover -----------------------------------------
// Flush and identical until the moment a link is hovered, then it
// rises by the tooltip's height and settles back. Nothing floats:
// at rest it is exactly the original bar. The motion is tied to
// an intent the reader just expressed, so it reads as the product
// responding rather than as a widget hiding.
export const LiftOnHoverStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const href = useHoveredHref();

  return (
    <div
      className={classNames(
        BAR,
        'h-10 transition-transform duration-150 ease-out',
      )}
      style={{
        transform: href ? `translateY(-${TOOLTIP_HEIGHT}px)` : undefined,
      }}
    >
      <PrimaryLockup primary={primary} />
      <Divider />
      <PartnerRow partners={partners} />
    </div>
  );
};

// --- 7. Slide on hover ----------------------------------------
// The same trigger with no vertical movement at all: the bar's
// contents shift right past the tooltip's reach and slide back.
// The bar itself never moves, so the layout is completely still —
// only what is inside it travels.
export const SlideOnHoverStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const href = useHoveredHref();

  return (
    <div className={classNames(BAR, 'h-10 overflow-hidden')}>
      <div
        className="flex min-w-0 flex-1 items-center gap-5 transition-transform duration-200 ease-out"
        style={{
          transform: href ? `translateX(${TOOLTIP_SLUG_WIDTH}px)` : undefined,
        }}
      >
        <PrimaryLockup primary={primary} />
        <Divider />
        <PartnerRow partners={partners} />
      </div>
    </div>
  );
};

// --- 8. Adaptive ----------------------------------------------
// Reacts only when it needs to. We cannot see the tooltip, but we
// know the href the browser is about to draw, so we can estimate
// its width and move only for the long ones. Short links leave
// the bar completely still — most hovers cost nothing.
export const AdaptiveStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const href = useHoveredHref();
  // ~5.8px per character at the tooltip's 12px UI font, checked
  // against real hrefs. Worth keeping even though today's links
  // trip it almost every time: if the URLs get shorter, this stops
  // moving on its own rather than needing to be removed.
  const estimated = href ? href.length * 5.8 : 0;
  const shift = estimated > TOOLTIP_SAFE_WIDTH;

  return (
    <div
      className={classNames(
        BAR,
        'h-10 transition-transform duration-150 ease-out',
      )}
      style={{
        transform: shift ? `translateY(-${TOOLTIP_HEIGHT}px)` : undefined,
      }}
    >
      <PrimaryLockup primary={primary} />
      <Divider />
      <PartnerRow partners={partners} />
    </div>
  );
};

// --- 9. Swap ends ---------------------------------------------
// No movement and no lost space: when a link is hovered the lead
// mark and the wall trade places, so the paid mark leaves the
// corner the tooltip is about to occupy and the wall's tail takes
// it instead. The bar's geometry is untouched.
export const SwapEndsStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => {
  const href = useHoveredHref();

  return (
    <div className={classNames(BAR, 'h-10', href && 'flex-row-reverse')}>
      <PrimaryLockup primary={primary} />
      <Divider />
      <PartnerRow partners={partners} />
    </div>
  );
};

// --- 10. Centred --------------------------------------------
// Both corners left empty and the content centred between them.
// The tooltip owns the left corner, and — since it jumps corners
// when the pointer nears it — the right one is spoken for too.
// This is the only static layout that is safe from both.
export const CentredStrip = ({
  partners,
  primary,
}: VariantProps): ReactElement => (
  <div className={classNames(BAR, 'h-10 justify-center')}>
    <span
      aria-hidden
      className="shrink-0"
      style={{ width: TOOLTIP_SAFE_WIDTH / 2 }}
    />
    <PrimaryLockup primary={primary} />
    <Divider />
    <div className="flex min-w-0 max-w-[52rem] flex-1 items-center">
      <PartnerRow partners={partners} />
    </div>
    <span
      aria-hidden
      className="shrink-0"
      style={{ width: TOOLTIP_SAFE_WIDTH / 2 }}
    />
  </div>
);

export const BUBBLE_SAFE_VARIANTS: {
  id: string;
  name: string;
  family: string;
  how: string;
  cost: string;
  /**
   * Does it hold when the URL is long? `width` means the fix is a
   * vertical or structural one and does not care; `slug` means it
   * survives an ordinary post link but not a promoted card's;
   * `short` means it only works if the URLs are shortened first.
   */
  holds: 'width' | 'slug' | 'short';
  Strip: (props: VariantProps) => ReactElement;
  linkStyle?: 'long' | 'short';
  narrowAnchor?: boolean;
}[] = [
  {
    id: 'gutter',
    holds: 'slug',
    name: 'Left gutter',
    family: 'Give it nothing to cover',
    how: 'content starts 320px in, so the corner the tooltip owns is empty',
    cost: '320px of horizontal room; nothing else',
    Strip: GutterStrip,
  },
  {
    id: 'right',
    holds: 'width',
    name: 'Right-anchored',
    family: 'Give it nothing to cover',
    how: 'lead mark at the right end, wall filling leftward into the danger zone',
    cost: 'reversed reading order; the tooltip jumps right if the pointer follows it',
    Strip: RightAnchoredStrip,
  },
  {
    id: 'band',
    holds: 'width',
    name: 'Sacrificial band',
    family: 'Give it nothing to cover',
    how: 'taller bar, content top-aligned, bottom 26px left as padding',
    cost: '26px more feed, permanently',
    Strip: BandStrip,
  },
  {
    id: 'shorthref',
    holds: 'short',
    name: 'Short href',
    family: 'Make it smaller',
    how: 'cards link to /p/<id>; the tooltip is as wide as the URL in it',
    cost: 'a routing change, not a layout one — needs a 301 to the slug',
    Strip: ShortHrefStrip,
    linkStyle: 'short',
  },
  {
    id: 'narrow',
    holds: 'short',
    name: 'Narrow anchor',
    family: 'Make it smaller',
    how: 'only the title is a link, so most of the pointer’s time over a card draws nothing',
    cost: 'a smaller click target; reduces frequency rather than risk',
    Strip: NarrowAnchorStrip,
    narrowAnchor: true,
  },
  {
    id: 'lift',
    holds: 'width',
    name: 'Lift on hover',
    family: 'Move only when it matters',
    how: 'flush at rest; rises by the tooltip’s height while a link is hovered',
    cost: 'vertical motion, tied to an intent the reader just expressed',
    Strip: LiftOnHoverStrip,
  },
  {
    id: 'slide',
    holds: 'slug',
    name: 'Slide on hover',
    family: 'Move only when it matters',
    how: 'the bar holds still; its contents shift right past the tooltip',
    cost: 'horizontal motion; the wall’s tail clips while shifted',
    Strip: SlideOnHoverStrip,
  },
  {
    id: 'adaptive',
    holds: 'width',
    name: 'Adaptive',
    family: 'Move only when it matters',
    how: 'estimates the tooltip’s width from the hovered href and moves only for long ones',
    cost: 'an estimate, not a measurement; short links cost nothing at all',
    Strip: AdaptiveStrip,
  },
  {
    id: 'swap',
    holds: 'width',
    name: 'Swap ends',
    family: 'Move only when it matters',
    how: 'lead mark and wall trade places on hover; geometry untouched',
    cost: 'the lead mark changes position, which is jarring if it happens often',
    Strip: SwapEndsStrip,
  },
  {
    id: 'centred',
    holds: 'slug',
    name: 'Centred',
    family: 'Give it nothing to cover',
    how: 'both corners empty, content centred — safe from the tooltip in either corner',
    cost: 'the widest layout cost, and it stops looking like a full-width rail',
    Strip: CentredStrip,
  },
];
