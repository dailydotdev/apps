import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { isProduction } from '../../../lib/constants';
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
};

const FORMAT_SPEC: Record<ArbitrageAdFormat, FormatSpec> = {
  [ArbitrageAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 / 320x100',
    cpm: '$2.50',
    minHeight: 'min-h-[90px]',
  },
  [ArbitrageAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280',
    cpm: '$3.00',
    minHeight: 'min-h-[180px]',
  },
  [ArbitrageAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    cpm: '$4.00',
    minHeight: 'min-h-[320px]',
  },
  [ArbitrageAdFormat.SidebarRail]: {
    label: 'Sidebar',
    size: '240x400',
    cpm: '$4.00',
    minHeight: 'min-h-[220px]',
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
}: Pick<ArbitrageAdSlotProps, 'slot' | 'format' | 'className'> & {
  config: AdsenseSlotConfig;
}): ReactElement {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const element = insRef.current;
    if (!element) {
      return undefined;
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
    <div
      className={classNames(
        'w-full overflow-hidden text-center',
        FORMAT_SPEC[format].minHeight,
        className,
      )}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        data-testid={`adsense-slot-${slot}`}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={config.id}
        // Test creatives everywhere except real production traffic, so local
        // and preview builds never generate billable/invalid impressions.
        data-adtest={isProduction ? undefined : 'on'}
        {...getInsAttributes(config)}
      />
    </div>
  );
}

/**
 * A programmatic ad slot on the /read template. Live only when the
 * `read_adsense_slots` remote config carries this slot number: any entry puts
 * the template in live mode, configured slots render a real AdSense unit and
 * unconfigured ones collapse. With the config empty (the default) it renders
 * the reserved placeholder box at the real creative height — the density
 * review the template shipped with, and the same height reservation a live
 * slot needs to avoid layout shift.
 */
export function ArbitrageAdSlot({
  slot,
  format,
  className,
  reach,
  refreshes,
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
      />
    );
  }

  const spec = FORMAT_SPEC[format];

  return (
    <div
      className={classNames(
        'bg-accent-cheese-default/[0.06] relative flex w-full items-center justify-center rounded-12 border border-dashed border-accent-cheese-default px-3 py-4',
        spec.minHeight,
        className,
      )}
      data-testid={`arbitrage-ad-slot-${slot}`}
    >
      <span className="absolute -top-2 left-3 rounded-6 bg-accent-cheese-default px-2 py-0.5 font-bold text-surface-invert typo-caption2">
        {slot}
      </span>
      <span className="absolute -top-2 right-3 rounded-6 border border-accent-cheese-default bg-background-default px-2 py-0.5 text-accent-cheese-default typo-caption2">
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
