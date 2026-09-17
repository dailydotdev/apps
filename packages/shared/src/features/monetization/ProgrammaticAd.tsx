import type { ReactElement } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { AdActions } from '../../lib/ads';
import AuthContext from '../../contexts/AuthContext';
import { requiresCertifiedCmp } from '../../lib/geo';
import { useViewability } from './useViewability';
import { viewabilityLogExtra } from './viewability';
import type { AdSize, AdSlotConfig } from './kueez';
import { KUEEZ_PID } from './kueez';
import type { PrebidBid } from './prebid';
import {
  configurePrebid,
  pingViewable,
  renderPrebidBid,
  requestKueezBid,
} from './prebid';
import { useAdUtm } from './useAdUtm';

/** Names the page/context a unit serves on, for per-surface reporting. */
export type ProgrammaticAdSurface = string;

export enum ProgrammaticAdFormat {
  Leaderboard = 'leaderboard',
  MediumRectangle = 'mediumRectangle',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  MobileBanner = 'mobileBanner',
}

type FormatSpec = {
  label: string;
  size: string;
  /**
   * Every size the exchange may answer this format with, widest first. The
   * ones that do not fit the slot's measured width are dropped at request
   * time, which is how a format gets its mobile variant: a leaderboard on a
   * phone can only come back as the banner, because 728x90 was never offered.
   */
  sizes: AdSize[];
  /**
   * Reserves the creative's height PLUS the chrome that renders with it:
   * the label row (1rem line + pb-1) and the wrapper's py-2, 36px in all,
   * so the box never grows under the reader when the bid lands in-viewport.
   */
  minHeight: string;
  /**
   * Caps the slot at its standard IAB width so every creative in a given
   * format renders the same size, and so the width the sizes are filtered
   * against is the one the creative will actually occupy.
   */
  maxWidth?: string;
  /**
   * The reservation for the compact wrapper: creative height plus py-1, no
   * label row. Only formats that render compact anywhere declare it.
   */
  compactMinHeight?: string;
};

export const FORMAT_SPEC: Record<ProgrammaticAdFormat, FormatSpec> = {
  // Leaderboard on desktop; the phone header is the MobileBanner twin below.
  // The phone cap stays so a Leaderboard left visible on a phone still comes
  // back as a banner rather than whatever else fits the column.
  [ProgrammaticAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 · 320x100 mobile',
    sizes: [
      [728, 90],
      [320, 100],
    ],
    minHeight: 'min-h-[136px] tablet:min-h-[126px]',
    maxWidth: 'max-w-[320px] tablet:max-w-[728px]',
  },
  // The IAB medium rectangle. Reserves its exact height rather than the
  // shorter guess the in-content unit makes, because it is booked at a fixed
  // size and anything less would shift the article as it fills.
  [ProgrammaticAdFormat.MediumRectangle]: {
    label: 'Medium rectangle',
    size: '300x250',
    sizes: [[300, 250]],
    minHeight: 'min-h-[286px]',
    maxWidth: 'max-w-[300px]',
  },
  // 336x280 is a Google size rather than an IAB one, so on a phone this drops
  // to the medium rectangle, which is what the portfolio actually lists.
  [ProgrammaticAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280 · 300x250 mobile',
    sizes: [
      [336, 280],
      [300, 250],
    ],
    minHeight: 'min-h-[286px] tablet:min-h-[216px]',
    maxWidth: 'max-w-[300px] tablet:max-w-[336px]',
  },
  [ProgrammaticAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    sizes: [[300, 600]],
    minHeight: 'min-h-[356px]',
    maxWidth: 'max-w-[300px]',
  },
  // The phone header unit, booked at the fixed 320x50: the smallest standard
  // size, so the pinned header block takes the least of a phone screen, and
  // the only size offered, so no expandable creative can answer it.
  [ProgrammaticAdFormat.MobileBanner]: {
    label: 'Mobile banner',
    size: '320x50',
    sizes: [[320, 50]],
    minHeight: 'min-h-[86px]',
    compactMinHeight: 'min-h-[3.625rem]',
    maxWidth: 'max-w-[320px]',
  },
};

/**
 * The sizes this slot may be answered with. A slot booked at a fixed size
 * says so in its config; everything else offers the format's sizes that fit
 * the space the slot actually has. Nothing fitting means the slot is
 * narrower than the format's smallest size (a phone below 320px, a test
 * environment with no layout), where the narrowest size is the only sensible
 * ask: the alternative is bidding on a size that cannot be displayed.
 */
export const resolveAdSizes = (
  spec: FormatSpec,
  config: AdSlotConfig,
  availableWidth: number,
): AdSize[] => {
  if (config.sizes?.length) {
    return config.sizes;
  }

  const fitting = spec.sizes.filter(([width]) => width <= availableWidth);
  if (fitting.length) {
    return fitting;
  }

  return [spec.sizes.reduce((a, b) => (b[0] < a[0] ? b : a))];
};

type ProgrammaticAdLogExtraProps = {
  slot: number;
  format: ProgrammaticAdFormat;
  surface: ProgrammaticAdSurface;
  refreshes?: boolean;
  extra?: Record<string, unknown>;
};

/**
 * One shape for every slot event, so ClickHouse queries never have to guess
 * which fields a given surface remembered to include.
 */
export const getAdSlotLogExtra = ({
  slot,
  format,
  surface,
  refreshes,
  extra,
}: ProgrammaticAdLogExtraProps): Record<string, unknown> => ({
  slot,
  format,
  surface,
  refreshes: refreshes || undefined,
  ...extra,
});

/**
 * What the auction actually returned. The cpm is the point of the whole
 * migration: with a tag we only ever learned that a slot filled, while a bid
 * says what the impression was worth, so per-placement RPM is a query rather
 * than a quarterly statement from the network.
 */
const bidLogExtra = (bid: PrebidBid): Record<string, unknown> => ({
  cpm: bid.cpm,
  currency: bid.currency,
  bidder: bid.bidder,
  creative_id: bid.creativeId,
  creative_size: `${bid.width}x${bid.height}`,
  advertiser_domains: bid.meta?.advertiserDomains,
});

type SlotOutcome = 'pending' | 'filled' | 'unfilled';

// Ad unit codes must be unique per mounted slot: the code is how the winning
// bid is looked up again, and repeated placements (in-body, comment
// interleave) share a slot number. Module-level so remounts never collide.
let adUnitSequence = 0;

export interface ProgrammaticAdProps {
  slot: number;
  config: AdSlotConfig;
  format: ProgrammaticAdFormat;
  surface: ProgrammaticAdSurface;
  className?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh. Not live yet. */
  refreshes?: boolean;
  /** Drops the slot below the tablet breakpoint (and its auction with it). */
  hideOnPhone?: boolean;
  /**
   * The bare unit: no "Advertisements" row and the tighter padding, for a
   * placement pinned on screen where every pixel of chrome is permanent.
   */
  compact?: boolean;
  /**
   * Runs the auction on mount instead of waiting to near the viewport. For
   * slots visible at first paint the intersection wait only adds latency, and
   * pbjs queues commands before the bundle has even arrived, so eager slots
   * ride its very first processing pass.
   */
  eager?: boolean;
  /**
   * Merged into every event's extra. Repeated placements share a slot number,
   * so this is how the first occurrence stays distinguishable from the sixth.
   */
  logExtra?: Record<string, unknown>;
}

/**
 * One Kueez slot, with the full lifecycle in telemetry: auction, fill (with
 * the winning price), no bid, render failure and an IAB viewable impression.
 * Callers own the audience/flag gating.
 */
export function ProgrammaticAd({
  slot,
  config,
  format,
  surface,
  className,
  refreshes,
  hideOnPhone,
  compact,
  eager,
  logExtra,
}: ProgrammaticAdProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const creativeRef = useRef<HTMLDivElement>(null);
  const [isRequested, setIsRequested] = useState(eager ?? false);
  const [outcome, setOutcome] = useState<SlotOutcome>('pending');
  const { logEvent } = useLogContext();
  // Optional: a bare component test has no provider, and the context's
  // default is null rather than an empty object.
  const geo = useContext(AuthContext)?.geo;
  // The same predicate Iubenda.tsx loads the TCF stub on, not
  // `isGdprCovered`: that one counts the whole world minus US/IL as covered,
  // and Prebid cancels every auction where it expects a CMP and finds none.
  const withConsentManagement = requiresCertifiedCmp(geo?.region);
  const utm = useAdUtm();
  const hasRequested = useRef(false);
  const hasLoggedClick = useRef(false);
  const isMounted = useRef(true);
  const bidRef = useRef<PrebidBid | null>(null);
  const [adUnitCode] = useState(() => {
    adUnitSequence += 1;
    return `${surface}-${slot}-${adUnitSequence}`;
  });
  // Ref, not dependency: callers pass inline objects whose identity changes
  // every render, and the ad effects must not re-run for that.
  const logExtraRef = useRef(logExtra);
  logExtraRef.current = logExtra;
  const configRef = useRef(config);
  configRef.current = config;

  // Set on mount as well as cleared on unmount: a remount reuses the same ref
  // object, and a slot that only ever cleared it would drop the results of
  // every auction after the first.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const logSlotEvent = useCallback(
    (
      eventName: LogEvent | AdActions,
      extra?: Record<string, unknown>,
      asAdEvent = false,
    ): void => {
      logEvent({
        event_name: eventName,
        // Analytics interactions use the exact shape of the internal ads'
        // events (adLogEvent): same names and target_type, the provider in
        // ad_provider_id and the creative as the target, so one query covers
        // every ad on the platform and GROUP BY ad_provider_id splits demand.
        ...(asAdEvent && {
          target_type: 'ad',
          target_id: bidRef.current?.creativeId ?? KUEEZ_PID,
          ad_provider_id: 'kueez',
        }),
        extra: JSON.stringify(
          getAdSlotLogExtra({
            slot,
            format,
            surface,
            refreshes,
            extra: {
              utm_source: utm?.source,
              utm_medium: utm?.medium,
              utm_campaign: utm?.campaign,
              utm_content: utm?.content,
              ad_unit_code: adUnitCode,
              ...logExtraRef.current,
              ...extra,
            },
          }),
        ),
      });
    },
    [adUnitCode, format, logEvent, refreshes, slot, surface, utm],
  );

  const logAdInteraction = useCallback(
    (eventName: AdActions, extra?: Record<string, unknown>): void =>
      logSlotEvent(eventName, extra, true),
    [logSlotEvent],
  );

  // The strict MRC measurement under the strict name: internal ads log
  // AdActions.Impression when a creative merely reaches the viewport and
  // AdActions.Viewable for IAB-viewable, and mixing the two would make this
  // provider's CTR read systematically higher than internal inventory in any
  // cross-provider query. The loose impression is emitted at fill below.
  const { ref: setViewabilityRef } = useViewability<HTMLDivElement>({
    enabled: outcome === 'filled',
    trackingKey: `${surface}:${slot}:${adUnitCode}:${format}`,
    onViewable: (data) => {
      logAdInteraction(AdActions.Viewable, viewabilityLogExtra(data));
      // Kueez prices future bids on what it can prove was seen, so the pixel
      // matters to revenue and not only to our own reporting.
      if (bidRef.current) {
        pingViewable(bidRef.current);
      }
    },
  });

  const setWrapperRef = useCallback(
    (element: HTMLDivElement | null): void => {
      wrapperRef.current = element;
      setViewabilityRef(element);
    },
    [setViewabilityRef],
  );

  useEffect(() => {
    const element = wrapperRef.current;
    if (eager || !element) {
      return undefined;
    }

    // Run the auction only near the viewport: viewability drives what the
    // exchange pays, and never-seen impressions depress the whole page's
    // pricing. The margin is roughly a viewport of scroll, enough for the
    // auction round trip to finish before the slot scrolls into view at
    // reading speed. Eager slots are visible at first paint, where the wait
    // only adds latency.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        observer.disconnect();
        setIsRequested(true);
      },
      // Enough that the verdict lands while the box is still off screen: both
      // the auction round trip and the collapse of an unfilled slot, which
      // closer in would happen in front of the reader as a visible jump.
      { rootMargin: '250px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [eager]);

  // The auction, once and only once per mounted slot. Unlike a tag, nothing
  // here is bound to a global queue position: the ad unit code ties the
  // request and its winning bid together, so slots are free to run their
  // auctions in whatever order they become eligible.
  useEffect(() => {
    const element = creativeRef.current;
    if (!isRequested || !element || hasRequested.current) {
      return;
    }
    hasRequested.current = true;

    configurePrebid({ withConsentManagement, utm });
    logSlotEvent(LogEvent.RequestAdSlot);

    const sizes = resolveAdSizes(
      FORMAT_SPEC[format],
      configRef.current,
      wrapperRef.current?.clientWidth ?? 0,
    );

    requestKueezBid({ code: adUnitCode, sizes }).then((result) => {
      if (!isMounted.current) {
        return;
      }

      if (result.status !== 'bid') {
        setOutcome('unfilled');
        logSlotEvent(LogEvent.EmptyAdSlot, { reason: result.status });
        return;
      }

      if (!renderPrebidBid(element, result.bid)) {
        setOutcome('unfilled');
        logSlotEvent(LogEvent.AdSlotError, {
          error_type: 'render_failed',
          ...bidLogExtra(result.bid),
        });
        return;
      }

      bidRef.current = result.bid;
      setOutcome('filled');
      logSlotEvent(LogEvent.FillAdSlot, bidLogExtra(result.bid));
      // The loose impression, in the internal ads' meaning: the creative
      // rendered in or near the viewport (auctions run on intersection, so a
      // fill implies it). AdActions.Viewable above carries the strict one.
      logAdInteraction(AdActions.Impression, bidLogExtra(result.bid));
    });
  }, [
    adUnitCode,
    format,
    isRequested,
    logAdInteraction,
    logSlotEvent,
    utm,
    withConsentManagement,
  ]);

  // First-party click signal. The creative is a separate browsing context, so
  // no click event reaches this document, but engaging it moves focus: the
  // window blurs and document.activeElement becomes the iframe. That
  // inference can overcount the rare tap that focuses without completing the
  // click-through, so the exchange's own reporting stays the source of truth
  // for billing while this event gives the per-user join internal ads have.
  // Logged once per slot: a second click is the same user leaving again.
  useEffect(() => {
    const element = wrapperRef.current;
    if (outcome !== 'filled' || !element) {
      return undefined;
    }

    const activeCreative = (): HTMLElement | null => {
      const active = document.activeElement;
      return active && active.tagName === 'IFRAME' && element.contains(active)
        ? (active as HTMLElement)
        : null;
    };

    const logClick = (signal: string): void => {
      if (hasLoggedClick.current || !activeCreative()) {
        return;
      }
      hasLoggedClick.current = true;
      logAdInteraction(AdActions.Click, { signal });
    };

    // Click-throughs that open a new tab/window blur this one with focus on
    // the creative's iframe.
    const onWindowBlur = (): void => logClick('focus-blur');
    // Same-tab click-throughs unload the document without a window blur, and
    // that is the most valuable click to miss.
    const onPageHide = (): void => logClick('pagehide');
    // If the visitor comes back with the creative still holding focus, they
    // tapped it without leaving. Dropping that focus means a later unrelated
    // blur (alt-tab minutes on) can't be mistaken for an ad click.
    const onWindowFocus = (): void => activeCreative()?.blur();

    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [logAdInteraction, outcome]);

  return (
    // Square-cornered and unclipped: the box only centres the unit and
    // reserves its request-time height against layout shift. No overflow
    // clipping, so a creative that comes back taller than the reservation
    // grows the container instead of being cut off.
    <div
      ref={setWrapperRef}
      // Read by the containers that have to disappear along with the slot,
      // which cannot know the outcome any other way: PhoneTopAdStrip pins its
      // own chrome around this box.
      data-ad-status={outcome}
      className={classNames(
        // A constant light island, deliberately NOT a theme token: display
        // creatives are designed against light backgrounds, and on a dark
        // page a white-bodied ad floating on the theme surface reads as a
        // hole punched in the UI. The white card makes the unit an
        // intentional object in both themes without touching the theme.
        // Vertical padding only: these boxes are border-box, so horizontal
        // padding would shrink the usable width below the IAB cap the
        // FORMAT_SPEC widths exist to guarantee.
        'mx-auto w-full rounded-8 bg-white text-center',
        compact ? 'py-1' : 'py-2',
        // Without collapsing, the reserved min-height stays behind as a block
        // of empty page, most visible in the comment thread where it leaves a
        // gap between the heading and the first comment. Important because
        // `tablet:block` below sits in a media query, which the generated
        // stylesheet emits after this plain rule.
        outcome === 'unfilled' && '!hidden',
        hideOnPhone && 'hidden tablet:block',
        (compact && FORMAT_SPEC[format].compactMinHeight) ||
          FORMAT_SPEC[format].minHeight,
        FORMAT_SPEC[format].maxWidth,
        className,
      )}
    >
      {/* Every unit is labeled so none can be confused with site content.
          Inside the wrapper, so an unfilled slot's collapse takes the label
          down with it. */}
      {/* Constant gray, not a theme token: the label sits on the card's
          constant white, where a dark-theme quaternary would vanish. */}
      {isRequested && !compact && (
        <span className="block pb-1 pr-1 text-right text-raw-pepper-10 typo-caption2">
          Advertisements
        </span>
      )}
      {/* Always mounted once requested: the auction resolves into this node,
          and a ref that only exists after the bid lands would have nowhere to
          render it. */}
      {isRequested && <div ref={creativeRef} data-testid={`ad-slot-${slot}`} />}
    </div>
  );
}
