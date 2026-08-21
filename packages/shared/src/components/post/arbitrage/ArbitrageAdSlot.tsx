import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { isDevelopment, webappUrl } from '../../../lib/constants';
import {
  useOrganicAdsenseSlots,
  useReadAdsenseSlots,
} from './useReadAdsenseSlots';
import type { AdsenseSlotConfig } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';

/** How long a slot gets to render a creative before it counts as empty. */
const FILL_GRACE_MS = 4_000;

/** Anything shorter than this is a blank creative, not an ad. */
const FILLED_MIN_HEIGHT_PX = 20;

export enum ArbitrageAdFormat {
  Leaderboard = 'leaderboard',
  MediumRectangle = 'mediumRectangle',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  SidebarRail = 'sidebarRail',
  Native = 'native',
  Video = 'video',
  RichMedia = 'richMedia',
  Grid = 'grid',
  Anchor = 'anchor',
}

type FormatSpec = {
  label: string;
  size: string;
  cpm: string;
  minHeight: string;
  /**
   * Caps the slot at its standard IAB width so every creative in a given
   * format renders the same size. Without this the unit is responsive and
   * Google picks whatever creative fits the container, so two slots side by
   * side come back different widths.
   *
   * The cap is also how a format gets its mobile variant. AdSense sizes a
   * responsive unit from the space it is given, so a leaderboard left
   * uncapped on a phone comes back as whatever else fits — a rectangle, not a
   * banner. Capping at the phone width in the IAB portfolio makes the mobile
   * sizes the only ones that can serve.
   */
  maxWidth?: string;
  /**
   * Restricts which shapes AdSense may return. A width cap alone does not:
   * left on `auto`, a 300px-wide slot is just as free to answer with a 300x600
   * half page as with a 300x250, and it did. Naming the shape keeps the unit
   * responsive across breakpoints while ruling the wrong orientations out,
   * which a fixed pixel size could not do without breaking one of them.
   */
  shape?: 'rectangle' | 'horizontal' | 'vertical';
};

const FORMAT_SPEC: Record<ArbitrageAdFormat, FormatSpec> = {
  // Leaderboard on desktop, large mobile banner on a phone.
  [ArbitrageAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 · 320x100 mobile',
    cpm: '$2.50',
    minHeight: 'min-h-[100px] tablet:min-h-[90px]',
    maxWidth: 'max-w-[320px] tablet:max-w-[728px]',
    shape: 'horizontal',
  },
  // The IAB medium rectangle. Reserves its exact height rather than the
  // shorter guess the in-content unit makes, because it is booked at a fixed
  // size and anything less would shift the article as it fills.
  [ArbitrageAdFormat.MediumRectangle]: {
    label: 'Medium rectangle',
    size: '300x250',
    cpm: '$3.00',
    minHeight: 'min-h-[250px]',
    maxWidth: 'max-w-[300px]',
    shape: 'rectangle',
  },
  // 336x280 is a Google size rather than an IAB one, so on a phone this drops
  // to the medium rectangle, which is what the portfolio actually lists.
  [ArbitrageAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280 · 300x250 mobile',
    cpm: '$3.00',
    minHeight: 'min-h-[250px] tablet:min-h-[180px]',
    maxWidth: 'max-w-[300px] tablet:max-w-[336px]',
    shape: 'rectangle',
  },
  [ArbitrageAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    cpm: '$4.00',
    minHeight: 'min-h-[320px]',
    maxWidth: 'max-w-[300px]',
    shape: 'vertical',
  },
  [ArbitrageAdFormat.SidebarRail]: {
    label: 'Sidebar',
    size: '240x400',
    cpm: '$4.00',
    minHeight: 'min-h-[220px]',
    maxWidth: 'max-w-[300px]',
    shape: 'vertical',
  },
  [ArbitrageAdFormat.Native]: {
    label: 'Native',
    size: 'fluid',
    cpm: '$3.00',
    minHeight: 'min-h-[96px]',
  },
  [ArbitrageAdFormat.Video]: {
    label: 'Outstream video',
    size: '16:9 muted',
    cpm: '$7.00',
    minHeight: 'min-h-[200px]',
  },
  [ArbitrageAdFormat.RichMedia]: {
    label: 'Rich media',
    size: 'responsive',
    cpm: '$4.00',
    minHeight: 'min-h-[160px]',
  },
  // AdSense's multiplex unit: one request that returns a responsive grid of
  // creatives, Google choosing the rows and columns for the width it is given.
  // Spans the column rather than capping, because the grid is what fills it.
  // The slot must be created as a Multiplex unit in AdSense — the format only
  // styles the box, the unit type comes from the remote config.
  [ArbitrageAdFormat.Grid]: {
    label: 'Multiplex grid',
    size: 'responsive grid',
    cpm: '$2.00',
    minHeight: 'min-h-[320px]',
  },
  // Leaderboard on desktop, mobile phone banner on a phone. The shortest
  // banner in the portfolio, because it sits over the content rather than in
  // it and shares the bottom of a phone screen with the footer nav.
  [ArbitrageAdFormat.Anchor]: {
    label: 'Anchor',
    size: '728x90 · 320x50 mobile',
    cpm: '$2.00',
    minHeight: 'min-h-[50px] tablet:min-h-[90px]',
    maxWidth: 'max-w-[320px] tablet:max-w-[728px]',
    shape: 'horizontal',
  },
};

export interface ArbitrageAdSlotProps {
  slot: number;
  format: ArbitrageAdFormat;
  className?: string;
  /** Share of visitors expected to scroll far enough for this slot to bill. */
  reach?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh once on Ad Manager. */
  refreshes?: boolean;
  /**
   * Drops the slot below the tablet breakpoint. The Better Ads Standards cap
   * mobile ad density at 30% of page height, and a scraped post carries little
   * body text to dilute it — running every slot on a phone measured 56%, which
   * is what gets a site's ads filtered by Chrome. The unit is hidden rather
   * than skipped so it also never requests: the ad only pushes on intersection,
   * and a display:none box never intersects.
   */
  hideOnPhone?: boolean;
  /**
   * Which slot map and flag gate the unit: the /read arbitrage template
   * (default) or the organic post page. The dashed density-review placeholder
   * is a /read-template tool and never renders for the organic surface.
   */
  surface?: 'read' | 'organic';
  /**
   * Requests the ad on mount instead of waiting to near the viewport. For
   * slots visible at first paint the intersection wait only adds latency —
   * and the adsbygoogle array queues pushes before the script has even
   * arrived, so eager pushes ride its very first processing pass.
   */
  eager?: boolean;
}

type InsAttributes = {
  style: CSSProperties;
  'data-ad-format'?: string;
  'data-ad-layout'?: string;
  'data-ad-layout-key'?: string;
  'data-full-width-responsive'?: string;
};

function getInsAttributes(
  config: AdsenseSlotConfig,
  shape?: FormatSpec['shape'],
): InsAttributes {
  if (config.type === 'inArticle') {
    return {
      style: { display: 'block', textAlign: 'center' },
      'data-ad-layout': 'in-article',
      'data-ad-format': 'fluid',
    };
  }

  if (config.type === 'inFeed') {
    return {
      style: { display: 'block' },
      'data-ad-format': 'fluid',
      'data-ad-layout-key': config.layoutKey,
    };
  }

  if (config.type === 'multiplex') {
    return {
      style: { display: 'block' },
      'data-ad-format': 'autorelaxed',
    };
  }

  if (config.width && config.height) {
    return {
      style: {
        display: 'inline-block',
        width: config.width,
        height: config.height,
      },
    };
  }

  if (shape) {
    return { style: { display: 'block' }, 'data-ad-format': shape };
  }

  return {
    style: { display: 'block' },
    'data-ad-format': 'auto',
    'data-full-width-responsive': 'true',
  };
}

function LiveAdSlot({
  slot,
  config,
  format,
  className,
  hideOnPhone,
  eager,
}: Pick<
  ArbitrageAdSlotProps,
  'slot' | 'format' | 'className' | 'hideOnPhone' | 'eager'
> & {
  config: AdsenseSlotConfig;
}): ReactElement {
  const insRef = useRef<HTMLModElement>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  // Collapsing an empty unit needs more than the CSS rule below: AdSense only
  // stamps data-ad-status="unfilled" when it says no, and a slot that answers
  // with a zero-height creative — or never answers, because a blocker ate the
  // script — keeps its reserved min-height as a band of empty page. Measure the
  // <ins> once the request has had time to land and collapse on the result. The
  // observer stays attached so a genuinely slow fill reopens the slot.
  useEffect(() => {
    const element = insRef.current;
    if (!element) {
      return undefined;
    }

    let graceElapsed = false;
    const evaluate = (): void => {
      if (!graceElapsed) {
        return;
      }
      const isUnfilled = element.getAttribute('data-ad-status') === 'unfilled';
      const { height } = element.getBoundingClientRect();
      setIsEmpty(isUnfilled || height < FILLED_MIN_HEIGHT_PX);
    };

    const observer = new ResizeObserver(evaluate);
    observer.observe(element);
    const graceTimer = globalThis.setTimeout(() => {
      graceElapsed = true;
      evaluate();
    }, FILL_GRACE_MS);

    return () => {
      observer.disconnect();
      globalThis.clearTimeout(graceTimer);
    };
  }, []);

  useEffect(() => {
    const element = insRef.current;
    if (!element) {
      return undefined;
    }

    // Any host but the canonical production one serves test creatives.
    // Preview deployments are production *builds*, so a build-time flag
    // can't make this call — it has to happen here, before the request.
    let productionHost = '';
    try {
      productionHost = new URL(webappUrl).hostname;
    } catch {
      // Fail-safe: unset/relative webappUrl means test creatives too.
    }
    if (productionHost !== window.location.hostname) {
      element.setAttribute('data-adtest', 'on');
    }

    const requestAd = (): void => {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        // adsbygoogle.js blocked (ad blocker) — leave the reserved box empty.
      }
    };

    if (eager) {
      requestAd();
      return undefined;
    }

    let pushed = false;
    // Request the ad only near the viewport: viewability drives AdSense CPMs,
    // and never-seen impressions depress the whole page's pricing. The margin
    // is roughly a viewport of scroll — enough for the auction round-trip to
    // finish before the slot scrolls into view at reading speed.
    const observer = new IntersectionObserver(
      (entries) => {
        if (pushed || !entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        pushed = true;
        observer.disconnect();
        requestAd();
      },
      { rootMargin: '600px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [eager]);

  return (
    // rounded-16 + overflow-hidden matches the feed Card so a filled slot reads
    // as page furniture rather than a pasted-in iframe. Safe against the
    // resize-after-request problem because the box has no fixed height: a
    // creative that grows pushes the container taller instead of being clipped.
    // min-h only reserves the request-time height against layout shift.
    <div
      className={classNames(
        // `isolate` forces a stacking context: without one, WebKit paints the
        // ad's iframe on its own compositing layer that escapes the rounded
        // clip and the corners come back square.
        'isolate mx-auto w-full overflow-hidden rounded-16 text-center',
        // AdSense stamps data-ad-status="unfilled" when no creative was
        // returned. Without collapsing, the reserved min-height stays behind as
        // a block of empty page — most visible in the comment thread, where an
        // unfilled slot leaves a gap between the heading and the first comment.
        // Important because `tablet:block` below sits in a media query, which
        // the generated stylesheet emits after this plain rule — without it an
        // unfilled phone-hidden slot would stay visible from tablet up.
        'has-[>ins[data-ad-status="unfilled"]]:!hidden',
        isEmpty && '!hidden',
        hideOnPhone && 'hidden tablet:block',
        FORMAT_SPEC[format].minHeight,
        FORMAT_SPEC[format].maxWidth,
        className,
      )}
    >
      <ins
        ref={insRef}
        // The radius is repeated on the <ins> because that is the closest
        // ancestor of the injected iframe — clipping only at the wrapper leaves
        // the creative's own corners square inside it.
        className="adsbygoogle overflow-hidden rounded-16"
        data-testid={`adsense-slot-${slot}`}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={config.id}
        {...getInsAttributes(config, FORMAT_SPEC[format].shape)}
      />
    </div>
  );
}

/**
 * A programmatic ad slot. Live only while its surface's boolean flag is on
 * AND its hardcoded map (slots.ts) carries a unit id for this slot number;
 * everything else collapses to nothing — visitors get a clean page. The
 * dashed density-review placeholder only ever appears in local development
 * builds of the /read template.
 */
export function ArbitrageAdSlot({
  slot,
  format,
  className,
  reach,
  refreshes,
  hideOnPhone,
  surface = 'read',
  eager,
}: ArbitrageAdSlotProps): ReactElement | null {
  const readSlots = useReadAdsenseSlots();
  const organicSlots = useOrganicAdsenseSlots();
  const slots = surface === 'organic' ? organicSlots : readSlots;
  const isLive = Object.keys(slots).length > 0;
  const config = slots[String(slot)];

  if (isLive) {
    if (!config?.id) {
      return null;
    }
    return (
      <LiveAdSlot
        slot={slot}
        config={config}
        format={format}
        className={className}
        hideOnPhone={hideOnPhone}
        eager={eager}
      />
    );
  }

  if (!isDevelopment || surface !== 'read') {
    return null;
  }

  const spec = FORMAT_SPEC[format];

  return (
    <div
      className={classNames(
        // Matches the feed Card treatment (rounded-16, subtle border, subtle
        // surface) so a filled slot reads as native page furniture rather than
        // a bolted-on iframe.
        'relative flex w-full items-center justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle px-3 py-4',
        hideOnPhone && 'hidden tablet:flex',
        spec.minHeight,
        className,
      )}
      data-testid={`arbitrage-ad-slot-${slot}`}
    >
      <span className="absolute left-3 top-2 rounded-6 bg-accent-cheese-default px-2 py-0.5 font-bold text-surface-invert typo-caption2">
        {slot}
      </span>
      <span className="absolute right-3 top-2 rounded-6 bg-background-default px-2 py-0.5 text-text-quaternary typo-caption2">
        {spec.size} · {spec.cpm}
        {refreshes ? ' · refreshes' : ''}
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-bold text-text-tertiary typo-footnote">
          {spec.label}
        </span>
        {!!reach && (
          <span className="text-text-quaternary typo-caption1">
            seen by {reach} of visitors
          </span>
        )}
      </div>
      <span className="absolute bottom-1 right-2 text-text-quaternary typo-caption2">
        Ad
      </span>
    </div>
  );
}
