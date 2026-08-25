import type { CSSProperties, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { webappUrl } from '../../lib/constants';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { useViewability } from './useViewability';
import { viewabilityLogExtra } from './viewability';
import type { AdsenseSlotConfig } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';

// Module-level, not per-slot: one warning per page load says everything.
let hasLoggedTestMode = false;

/** Names the page/context a unit serves on, for per-surface reporting. */
export type ProgrammaticAdSurface = string;

export enum ProgrammaticAdFormat {
  Leaderboard = 'leaderboard',
  MediumRectangle = 'mediumRectangle',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  Native = 'native',
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

export const FORMAT_SPEC: Record<ProgrammaticAdFormat, FormatSpec> = {
  // Leaderboard on desktop, large mobile banner on a phone.
  [ProgrammaticAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 · 320x100 mobile',
    minHeight: 'min-h-[100px] tablet:min-h-[90px]',
    maxWidth: 'max-w-[320px] tablet:max-w-[728px]',
    shape: 'horizontal',
  },
  // The IAB medium rectangle. Reserves its exact height rather than the
  // shorter guess the in-content unit makes, because it is booked at a fixed
  // size and anything less would shift the article as it fills.
  [ProgrammaticAdFormat.MediumRectangle]: {
    label: 'Medium rectangle',
    size: '300x250',
    minHeight: 'min-h-[250px]',
    maxWidth: 'max-w-[300px]',
    shape: 'rectangle',
  },
  // 336x280 is a Google size rather than an IAB one, so on a phone this drops
  // to the medium rectangle, which is what the portfolio actually lists.
  [ProgrammaticAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280 · 300x250 mobile',
    minHeight: 'min-h-[250px] tablet:min-h-[180px]',
    maxWidth: 'max-w-[300px] tablet:max-w-[336px]',
    shape: 'rectangle',
  },
  [ProgrammaticAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    minHeight: 'min-h-[320px]',
    maxWidth: 'max-w-[300px]',
    shape: 'vertical',
  },
  [ProgrammaticAdFormat.Native]: {
    label: 'Native',
    size: 'fluid',
    minHeight: 'min-h-[96px]',
  },
};

type ProgrammaticAdLogExtraProps = {
  slot: number;
  config?: AdsenseSlotConfig;
  format: ProgrammaticAdFormat;
  surface: ProgrammaticAdSurface;
  refreshes?: boolean;
  extra?: Record<string, unknown>;
};

/**
 * One shape for every slot event, so ClickHouse queries never have to guess
 * which fields a given surface remembered to include.
 */
export const getAdsenseSlotLogExtra = ({
  slot,
  config,
  format,
  surface,
  refreshes,
  extra,
}: ProgrammaticAdLogExtraProps): Record<string, unknown> => ({
  slot,
  unit: config?.id,
  unit_type: config?.type,
  format,
  surface,
  refreshes: refreshes || undefined,
  ...extra,
});

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

export interface ProgrammaticAdProps {
  slot: number;
  config: AdsenseSlotConfig;
  format: ProgrammaticAdFormat;
  surface: ProgrammaticAdSurface;
  className?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh once on Ad Manager. */
  refreshes?: boolean;
  /** Drops the slot below the tablet breakpoint (and its request with it). */
  hideOnPhone?: boolean;
  /**
   * Requests the ad on mount instead of waiting to near the viewport. For
   * slots visible at first paint the intersection wait only adds latency —
   * and the adsbygoogle array queues pushes before the script has even
   * arrived, so eager pushes ride its very first processing pass.
   */
  eager?: boolean;
}

/**
 * One AdSense unit, with the full lifecycle in telemetry: request, fill,
 * unfilled, push error, test mode and an IAB viewable impression. Callers own
 * the audience/flag gating and pass a remount `key` when the unit identity
 * changes — an <ins> can only ever be initialised once.
 */
export function ProgrammaticAd({
  slot,
  config,
  format,
  surface,
  className,
  refreshes,
  hideOnPhone,
  eager,
}: ProgrammaticAdProps): ReactElement {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<HTMLModElement>(null);
  const [isRequested, setIsRequested] = useState(eager ?? false);
  const [isFilled, setIsFilled] = useState(false);
  const { logEvent } = useLogContext();
  const hasPushed = useRef(false);
  const hasLoggedFill = useRef(false);
  const hasLoggedEmpty = useRef(false);
  const hasLoggedClick = useRef(false);
  const { id: unitId, type: unitType, layoutKey: unitLayoutKey } = config;

  const logSlotEvent = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>): void => {
      logEvent({
        event_name: eventName,
        extra: JSON.stringify(
          getAdsenseSlotLogExtra({
            slot,
            config: { id: unitId, type: unitType, layoutKey: unitLayoutKey },
            format,
            surface,
            refreshes,
            extra,
          }),
        ),
      });
    },
    [
      format,
      logEvent,
      refreshes,
      slot,
      surface,
      unitId,
      unitLayoutKey,
      unitType,
    ],
  );

  // Impressions and clicks use the exact shape of the internal ads' events
  // (adLogEvent): same event names and target_type, the provider carried in
  // ad_provider_id and the AdSense unit as the target — so one query covers
  // every ad on the platform and GROUP BY ad_provider_id splits the demand.
  const logAdInteraction = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>): void => {
      logEvent({
        event_name: eventName,
        target_type: 'ad',
        target_id: unitId,
        ad_provider_id: 'adsense',
        extra: JSON.stringify(
          getAdsenseSlotLogExtra({
            slot,
            config: { id: unitId, type: unitType, layoutKey: unitLayoutKey },
            format,
            surface,
            refreshes,
            extra,
          }),
        ),
      });
    },
    [
      format,
      logEvent,
      refreshes,
      slot,
      surface,
      unitId,
      unitLayoutKey,
      unitType,
    ],
  );

  // The MRC viewable impression, measured only once a creative is actually in
  // the slot — an empty reservation scrolling by is not an impression.
  const { ref: setViewabilityRef } = useViewability<HTMLDivElement>({
    enabled: isFilled,
    trackingKey: `${surface}:${slot}:${unitId}:${format}`,
    onViewable: (data) => {
      logAdInteraction(LogEvent.Impression, viewabilityLogExtra(data));
    },
  });

  const setWrapperRef = useCallback(
    (element: HTMLDivElement | null): void => {
      wrapperRef.current = element;
      setViewabilityRef(element);
    },
    [setViewabilityRef],
  );

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

  // Fires once the ins exists: stamps the test attribute and pushes the
  // request. Nothing here decides the slot is empty on a timer — the wrapper's
  // CSS rule collapses it on data-ad-status="unfilled", which is the only
  // signal that actually means "no ad". Guessing from height or from a missing
  // iframe cannot tell a slow auction from a declined one, and guessing wrong
  // is unrecoverable: a collapsed slot is display:none, and Google does not
  // render into one, so the ad never arrives at all.
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
      // Test mode pays nothing, so it engaging where it should not — a
      // misconfigured webappUrl in production — must be visible in telemetry
      // rather than silently zeroing revenue. Once per page is enough.
      if (!hasLoggedTestMode) {
        hasLoggedTestMode = true;
        logSlotEvent(LogEvent.AdsenseTestMode, {
          host: window.location.hostname,
        });
      }
    }

    // Logs the terminal answer, watching mutations rather than polling — and
    // never hiding the slot on the strength of it: the CSS rule owns layout.
    // A fill (the iframe landing) and an unfilled verdict are each logged
    // once; a refreshing unit mutates forever, so the observer disconnects as
    // soon as both outcomes are settled or impossible.
    const reportOutcome = (): boolean => {
      if (!hasLoggedFill.current && element.querySelector('iframe')) {
        hasLoggedFill.current = true;
        setIsFilled(true);
        logSlotEvent(LogEvent.FillAdsenseSlot);
      }
      if (
        !hasLoggedEmpty.current &&
        element.getAttribute('data-ad-status') === 'unfilled'
      ) {
        hasLoggedEmpty.current = true;
        logSlotEvent(LogEvent.EmptyAdsenseSlot, { reason: 'unfilled' });
      }
      return hasLoggedFill.current || hasLoggedEmpty.current;
    };
    const observer = new MutationObserver(() => {
      if (reportOutcome()) {
        observer.disconnect();
      }
    });
    if (!reportOutcome()) {
      observer.observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-ad-status'],
      });
    }

    // This push is only safe because of the mount-at-eligibility invariant
    // above: it binds to the first uninitialised ins in document order, not
    // to this element. Adding `eager` to a slot (or any change that mounts an
    // ins before it should be requested) re-opens the mis-binding race — an
    // eager slot must be one that is genuinely requested at mount. The ref
    // guard keeps a dependency change from ever pushing the same ins twice.
    if (!hasPushed.current) {
      hasPushed.current = true;
      logSlotEvent(LogEvent.RequestAdsenseSlot);
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (error) {
        // adsbygoogle.js blocked (ad blocker) — leave the reserved box empty.
        logSlotEvent(LogEvent.AdsenseSlotError, {
          error_type: 'push_failed',
          message: error instanceof Error ? error.message : undefined,
        });
      }
    }

    return () => observer.disconnect();
  }, [isRequested, logSlotEvent]);

  // First-party click signal. The creative is a cross-origin iframe, so no
  // click event ever reaches this document — but engaging it moves focus:
  // the window blurs and document.activeElement becomes the iframe. That
  // inference is the industry-standard AdSense click proxy; it can overcount
  // the rare tap that focuses without completing the click-through, so
  // AdSense's own reporting stays the exact source of truth while this event
  // gives the per-user join our internal ads have. Logged once per slot: a
  // second click on the same creative is the same user leaving again.
  useEffect(() => {
    const element = wrapperRef.current;
    if (!isFilled || !element) {
      return undefined;
    }

    const onWindowBlur = (): void => {
      const active = document.activeElement;
      if (
        hasLoggedClick.current ||
        !active ||
        active.tagName !== 'IFRAME' ||
        !element.contains(active)
      ) {
        return;
      }
      hasLoggedClick.current = true;
      logAdInteraction(LogEvent.Click);
    };

    window.addEventListener('blur', onWindowBlur);
    return () => window.removeEventListener('blur', onWindowBlur);
  }, [isFilled, logAdInteraction]);

  return (
    // Square-cornered and unclipped: the box only centres the unit and
    // reserves its request-time height against layout shift. No overflow
    // clipping, so a creative that comes back taller than the reservation
    // grows the container instead of being cut off, which AdSense forbids.
    <div
      ref={setWrapperRef}
      className={classNames(
        'mx-auto w-full text-center',
        // AdSense stamps data-ad-status="unfilled" when no creative was
        // returned. Without collapsing, the reserved min-height stays behind as
        // a block of empty page — most visible in the comment thread, where an
        // unfilled slot leaves a gap between the heading and the first comment.
        // Important because `tablet:block` below sits in a media query, which
        // the generated stylesheet emits after this plain rule — without it an
        // unfilled phone-hidden slot would stay visible from tablet up.
        'has-[>ins[data-ad-status="unfilled"]]:!hidden',
        hideOnPhone && 'hidden tablet:block',
        FORMAT_SPEC[format].minHeight,
        FORMAT_SPEC[format].maxWidth,
        className,
      )}
    >
      {/* A fluid native unit is the "confusable with site content" shape
          AdSense prohibits shipping unlabeled — "Advertisements" is one of
          the two label strings its policy permits. Inside the wrapper, so an
          unfilled slot's collapse takes the label down with it. */}
      {isRequested && config.type === 'inFeed' && (
        <span className="mb-1 block text-left text-text-quaternary typo-caption2">
          Advertisements
        </span>
      )}
      {isRequested && (
        <ins
          ref={insRef}
          className="adsbygoogle"
          data-testid={`adsense-slot-${slot}`}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={config.id}
          {...getInsAttributes(config, FORMAT_SPEC[format].shape)}
        />
      )}
    </div>
  );
}
