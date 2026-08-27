import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { isDevelopment } from '../../../lib/constants';
import {
  useOrganicAdsenseSlots,
  useReadAdsenseSlots,
} from './useReadAdsenseSlots';
import type { AdsenseSlots } from '../../../features/monetization/adsense';
import { hasLiveAdsenseUnits } from '../../../features/monetization/adsense';
import type { ProgrammaticAdFormat } from '../../../features/monetization/ProgrammaticAd';
import {
  FORMAT_SPEC,
  ProgrammaticAd,
} from '../../../features/monetization/ProgrammaticAd';

export type ArbitrageAdSurface = 'read' | 'organic';

export {
  getAdsenseSlotLogExtra,
  ProgrammaticAdFormat as ArbitrageAdFormat,
} from '../../../features/monetization/ProgrammaticAd';

export interface ArbitrageAdSlotProps {
  slot: number;
  format: ProgrammaticAdFormat;
  className?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh once on Ad Manager. */
  refreshes?: boolean;
  /**
   * Drops the slot below the tablet breakpoint — the Better Ads Standards cap
   * mobile ad density at 30% of page height, and Chrome's filter for a
   * violation applies to the whole domain. The unit is hidden rather than
   * skipped so it also never requests: the ad only pushes on intersection,
   * and a display:none box never intersects.
   */
  hideOnPhone?: boolean;
  /**
   * Which slot map and flag gate the unit: the /read arbitrage template
   * (default) or the organic post page. The dashed density-review placeholder
   * is a /read-template tool and never renders for the organic surface.
   */
  surface?: ArbitrageAdSurface;
  /**
   * Requests the ad on mount instead of waiting to near the viewport. For
   * slots visible at first paint the intersection wait only adds latency —
   * and the adsbygoogle array queues pushes before the script has even
   * arrived, so eager pushes ride its very first processing pass.
   */
  eager?: boolean;
  /** Per-instance extra for repeated placements — see ProgrammaticAd. */
  logExtra?: Record<string, unknown>;
}

function MappedAdSlot({
  slot,
  format,
  className,
  refreshes,
  hideOnPhone,
  eager,
  logExtra,
  slots,
  surface,
  allowPlaceholder = false,
}: ArbitrageAdSlotProps & {
  slots: AdsenseSlots;
  surface: ArbitrageAdSurface;
  allowPlaceholder?: boolean;
}): ReactElement | null {
  const isLive = hasLiveAdsenseUnits(slots);
  const config = slots[String(slot)];

  if (isLive) {
    if (!config?.id) {
      return null;
    }
    return (
      // An <ins> can only be initialised once, so any change to the unit's
      // identity has to remount rather than re-render.
      <ProgrammaticAd
        key={`${surface}:${slot}:${format}:${config.id}:${config.type}:${
          config.layoutKey ?? ''
        }:${config.width ?? ''}:${config.height ?? ''}`}
        slot={slot}
        config={config}
        format={format}
        surface={surface}
        className={className}
        refreshes={refreshes}
        hideOnPhone={hideOnPhone}
        eager={eager}
        logExtra={logExtra}
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
        'relative flex w-full items-center justify-center border border-border-subtlest-tertiary bg-background-subtle px-3 py-4',
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
  return (
    <MappedAdSlot {...props} slots={slots} surface="read" allowPlaceholder />
  );
}

function OrganicArbitrageAdSlot(
  props: ArbitrageAdSlotProps,
): ReactElement | null {
  const slots = useOrganicAdsenseSlots();
  return <MappedAdSlot {...props} slots={slots} surface="organic" />;
}

/**
 * A programmatic ad slot. Live only while its surface's boolean flag is on
 * AND its hardcoded map (slots.ts) carries a unit id for this slot number;
 * everything else collapses to nothing — visitors get a clean page. The
 * dashed density-review placeholder only ever appears in local development
 * builds of the /read template.
 */
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
