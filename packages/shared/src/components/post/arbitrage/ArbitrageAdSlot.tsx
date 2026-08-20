import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { isDevelopment, webappUrl } from '../../../lib/constants';
import { useReadAdsenseSlots } from './useReadAdsenseSlots';
import type { AdsenseSlotConfig } from './adsense';
import { ADSENSE_CLIENT_ID } from './adsense';

export enum ArbitrageAdFormat {
  Leaderboard = 'leaderboard',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  SidebarRail = 'sidebarRail',
  Native = 'native',
  Video = 'video',
  RichMedia = 'richMedia',
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
   * side come back different widths. Below the cap the box still shrinks, so
   * mobile is unaffected.
   */
  maxWidth?: string;
};

const FORMAT_SPEC: Record<ArbitrageAdFormat, FormatSpec> = {
  [ArbitrageAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 / 320x100',
    cpm: '$2.50',
    minHeight: 'min-h-[90px]',
    maxWidth: 'max-w-[728px]',
  },
  [ArbitrageAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280',
    cpm: '$3.00',
    minHeight: 'min-h-[180px]',
    maxWidth: 'max-w-[336px]',
  },
  [ArbitrageAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    cpm: '$4.00',
    minHeight: 'min-h-[320px]',
    maxWidth: 'max-w-[300px]',
  },
  [ArbitrageAdFormat.SidebarRail]: {
    label: 'Sidebar',
    size: '240x400',
    cpm: '$4.00',
    minHeight: 'min-h-[220px]',
    maxWidth: 'max-w-[300px]',
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
  [ArbitrageAdFormat.Anchor]: {
    label: 'Anchor',
    size: '728x90 / 320x50',
    cpm: '$2.00',
    minHeight: 'min-h-[56px]',
    maxWidth: 'max-w-[728px]',
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
}

type InsAttributes = {
  style: CSSProperties;
  'data-ad-format'?: string;
  'data-ad-layout'?: string;
  'data-ad-layout-key'?: string;
  'data-full-width-responsive'?: string;
};

function getInsAttributes(config: AdsenseSlotConfig): InsAttributes {
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
}: Pick<
  ArbitrageAdSlotProps,
  'slot' | 'format' | 'className' | 'hideOnPhone'
> & {
  config: AdsenseSlotConfig;
}): ReactElement {
  const insRef = useRef<HTMLModElement>(null);

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

    let pushed = false;
    // Request the ad only near the viewport: viewability drives AdSense CPMs,
    // and never-seen impressions depress the whole page's pricing.
    const observer = new IntersectionObserver(
      (entries) => {
        if (pushed || !entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        pushed = true;
        observer.disconnect();
        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        } catch {
          // adsbygoogle.js blocked (ad blocker) — leave the reserved box empty.
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

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
        {...getInsAttributes(config)}
      />
    </div>
  );
}

/**
 * A programmatic ad slot on the /read template. Live only when the
 * `read_adsense_slots` remote config carries this slot number: any entry puts
 * the template in live mode, configured slots render a real AdSense unit and
 * unconfigured ones collapse. With the config empty (the default) the slot
 * renders nothing — visitors get a clean page. The dashed density-review
 * placeholder only ever appears in local development builds.
 */
export function ArbitrageAdSlot({
  slot,
  format,
  className,
  reach,
  refreshes,
  hideOnPhone,
}: ArbitrageAdSlotProps): ReactElement | null {
  const slots = useReadAdsenseSlots();
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
      />
    );
  }

  if (!isDevelopment) {
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
