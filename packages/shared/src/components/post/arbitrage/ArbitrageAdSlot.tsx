import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { isDevelopment, webappUrl } from '../../../lib/constants';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import {
  useOrganicAdsenseSlots,
  useReadAdsenseSlots,
} from './useReadAdsenseSlots';
import type { AdsenseSlotConfig, ReadAdsenseSlots } from './adsense';
import { ADSENSE_CLIENT_ID, hasLiveAdsenseUnits } from './adsense';

/** How long a slot gets to render a creative before it counts as empty. */
const FILL_GRACE_MS = 4_000;

/** Anything shorter than this is a blank creative, not an ad. */
const FILLED_MIN_HEIGHT_PX = 20;

export enum ArbitrageAdFormat {
  Leaderboard = 'leaderboard',
  MediumRectangle = 'mediumRectangle',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  SidebarCompact = 'sidebarCompact',
  Native = 'native',
  Grid = 'grid',
  Anchor = 'anchor',
}

type FormatSpec = {
  label: string;
  size: string;
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
    minHeight: 'min-h-[250px]',
    maxWidth: 'max-w-[300px]',
    shape: 'rectangle',
  },
  // 336x280 is a Google size rather than an IAB one, so on a phone this drops
  // to the medium rectangle, which is what the portfolio actually lists.
  [ArbitrageAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280 · 300x250 mobile',
    minHeight: 'min-h-[250px] tablet:min-h-[180px]',
    maxWidth: 'max-w-[300px] tablet:max-w-[336px]',
    shape: 'rectangle',
  },
  [ArbitrageAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    minHeight: 'min-h-[320px]',
    maxWidth: 'max-w-[300px]',
    shape: 'vertical',
  },
  // The navigation's own unit. No width cap: it sizes to the sidebar column it
  // sits in, so the sidebar's width is the only place that measurement lives.
  // The shape is what keeps it out of the way — a rectangle at ~224px can only
  // come back as a small square or small rectangle, where the uncapped slot
  // was answering with a half page and taking most of the nav's height.
  [ArbitrageAdFormat.SidebarCompact]: {
    label: 'Sidebar compact',
    size: '200x200 · 180x150',
    minHeight: 'min-h-[150px]',
    shape: 'rectangle',
  },
  [ArbitrageAdFormat.Native]: {
    label: 'Native',
    size: 'fluid',
    minHeight: 'min-h-[96px]',
  },
  // AdSense's multiplex unit: one request that returns a responsive grid of
  // creatives, Google choosing the rows and columns for the width it is given.
  // Spans the column rather than capping, because the grid is what fills it.
  // The slot must be created as a Multiplex unit in AdSense — the format only
  // styles the box, the unit type comes from the remote config.
  [ArbitrageAdFormat.Grid]: {
    label: 'Multiplex grid',
    size: 'responsive grid',
    minHeight: 'min-h-[320px]',
  },
  // Leaderboard on desktop, mobile phone banner on a phone. The shortest
  // banner in the portfolio, because it sits over the content rather than in
  // it and shares the bottom of a phone screen with the footer nav.
  [ArbitrageAdFormat.Anchor]: {
    label: 'Anchor',
    size: '728x90 · 320x50 mobile',
    minHeight: 'min-h-[50px] tablet:min-h-[90px]',
    maxWidth: 'max-w-[320px] tablet:max-w-[728px]',
    shape: 'horizontal',
  },
};

export interface ArbitrageAdSlotProps {
  slot: number;
  format: ArbitrageAdFormat;
  className?: string;
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [isRequested, setIsRequested] = useState(eager ?? false);
  const [isEmpty, setIsEmpty] = useState(false);
  const { logEvent } = useLogContext();
  const hasLoggedFill = useRef(false);

  // The <ins> below only mounts once the slot is eligible, because
  // adsbygoogle.push({}) does not bind to a specific element: the tag
  // processes the first uninitialised ins.adsbygoogle in document order. With
  // every ins mounted up front and per-slot pushes firing in intersection
  // order, a push from a slot low on the page initialises an earlier,
  // never-pushed slot instead — wrong placement gets the request, the
  // triggering slot stays unprocessed and collapses as empty. Mounting the
  // ins at eligibility keeps the invariant that every uninitialised ins in
  // the document is one that should be processed right now, which makes the
  // pushes interchangeable. The wrapper keeps the format's min-height, so the
  // page reserves the same space either way.
  useEffect(() => {
    const element = wrapperRef.current;
    if (eager || !element) {
      return undefined;
    }

    // Request the ad only near the viewport: viewability drives AdSense CPMs,
    // and never-seen impressions depress the whole page's pricing. The margin
    // is roughly a viewport of scroll — enough for the auction round-trip to
    // finish before the slot scrolls into view at reading speed. Eager slots
    // are visible at first paint, where the wait only adds latency.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        observer.disconnect();
        setIsRequested(true);
      },
      { rootMargin: '600px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [eager]);

  // Fires once the ins exists: stamps the test attribute, pushes the request
  // and starts the fill clock. Collapsing matters because AdSense only stamps
  // data-ad-status="unfilled" when it says no — a slot that answers with a
  // zero-height creative, or never answers because a blocker ate the script,
  // keeps its reserved min-height as a band of empty page. The observers stay
  // attached so a genuinely slow fill reopens a collapsed slot.
  useEffect(() => {
    const element = insRef.current;
    if (!isRequested || !element) {
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

    let graceElapsed = false;
    const evaluate = (): void => {
      if (!graceElapsed) {
        return;
      }
      const isUnfilled = element.getAttribute('data-ad-status') === 'unfilled';
      // A slot booked at a fixed size measures its booked height whether or
      // not an ad arrived, so height alone cannot tell the two apart — an
      // unanswered 300x600 held 600px of empty page open at the end of the
      // rail. AdSense fills by injecting an iframe, so its absence is the
      // signal that works at any size.
      const hasCreative = !!element.querySelector('iframe');
      const { height } = element.getBoundingClientRect();
      const filled =
        !isUnfilled && hasCreative && height >= FILLED_MIN_HEIGHT_PX;
      setIsEmpty(!filled);
      // First-party per-placement fill signal: several placements share an
      // AdSense unit id for now, so AdSense's own reporting blends them.
      if (filled && !hasLoggedFill.current) {
        hasLoggedFill.current = true;
        logEvent({
          event_name: LogEvent.FillAdsenseSlot,
          extra: JSON.stringify({ slot, unit: config.id, format }),
        });
      }
    };

    const resizeObserver = new ResizeObserver(evaluate);
    resizeObserver.observe(element);
    // Mutations rather than size alone, so a fill landing after the slot has
    // already collapsed still reopens it: a display:none box reports no
    // resizes, but the script's iframe and status attribute still land on it.
    const mutationObserver = new MutationObserver(evaluate);
    mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['data-ad-status'],
      childList: true,
    });

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // adsbygoogle.js blocked (ad blocker) — leave the reserved box empty.
    }
    const graceTimer = globalThis.setTimeout(() => {
      graceElapsed = true;
      evaluate();
    }, FILL_GRACE_MS);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      globalThis.clearTimeout(graceTimer);
    };
  }, [isRequested, logEvent, slot, config.id, format]);

  return (
    // rounded-16 + overflow-hidden matches the feed Card so a filled slot reads
    // as page furniture rather than a pasted-in iframe. Safe against the
    // resize-after-request problem because the box has no fixed height: a
    // creative that grows pushes the container taller instead of being clipped.
    // min-h only reserves the request-time height against layout shift.
    <div
      ref={wrapperRef}
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
      {isRequested && (
        <ins
          ref={insRef}
          // The radius is repeated on the <ins> because that is the closest
          // ancestor of the injected iframe — clipping only at the wrapper
          // leaves the creative's own corners square inside it.
          className="adsbygoogle overflow-hidden rounded-16"
          data-testid={`adsense-slot-${slot}`}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={config.id}
          {...getInsAttributes(config, FORMAT_SPEC[format].shape)}
        />
      )}
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
function MappedAdSlot({
  slot,
  format,
  className,
  refreshes,
  hideOnPhone,
  eager,
  slots,
  allowPlaceholder = false,
}: ArbitrageAdSlotProps & {
  slots: ReadAdsenseSlots;
  allowPlaceholder?: boolean;
}): ReactElement | null {
  const isLive = hasLiveAdsenseUnits(slots);
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

  if (!isDevelopment || !allowPlaceholder) {
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
        {spec.size}
        {refreshes ? ' · refreshes' : ''}
      </span>
      <span className="font-bold text-text-tertiary typo-footnote">
        {spec.label}
      </span>
      <span className="absolute bottom-1 right-2 text-text-quaternary typo-caption2">
        Ad
      </span>
    </div>
  );
}

function ReadArbitrageAdSlot(props: ArbitrageAdSlotProps): ReactElement | null {
  const slots = useReadAdsenseSlots();
  return <MappedAdSlot {...props} slots={slots} allowPlaceholder />;
}

function OrganicArbitrageAdSlot(
  props: ArbitrageAdSlotProps,
): ReactElement | null {
  const slots = useOrganicAdsenseSlots();
  return <MappedAdSlot {...props} slots={slots} />;
}

export function ArbitrageAdSlot({
  surface = 'read',
  ...props
}: ArbitrageAdSlotProps): ReactElement | null {
  // Split by surface so each branch evaluates only its own slot source: the
  // organic hook conditionally evaluates the post_adsense flag, and a /read
  // page calling it would enroll every visitor in an experiment that does not
  // govern that route.
  if (surface === 'organic') {
    return <OrganicArbitrageAdSlot {...props} />;
  }
  return <ReadArbitrageAdSlot {...props} />;
}
