import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { isDevelopment } from '../../../lib/constants';
import { useOrganicAdSlots, useReadAdSlots } from './useReadAdSlots';
import { useFeature } from '../../GrowthBookProvider';
import { featureReadTaboola } from '../../../lib/featureManagement';
import type { AdSlots } from '../../../features/monetization/kueez';
import { hasLiveAdSlots } from '../../../features/monetization/kueez';
import type { ProgrammaticAdFormat } from '../../../features/monetization/ProgrammaticAd';
import {
  FORMAT_SPEC,
  ProgrammaticAd,
} from '../../../features/monetization/ProgrammaticAd';

export type ReadAdSurface = 'read' | 'organic';

export {
  getAdSlotLogExtra,
  ProgrammaticAdFormat as ReadAdFormat,
} from '../../../features/monetization/ProgrammaticAd';

export interface ReadAdSlotProps {
  slot: number;
  format: ProgrammaticAdFormat;
  className?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh once on Ad Manager. */
  refreshes?: boolean;
  /**
   * Drops the slot below the tablet breakpoint. The Better Ads Standards cap
   * mobile ad density at 30% of page height, and Chrome's filter for a
   * violation applies to the whole domain. The unit is hidden rather than
   * skipped so it also never bids: the auction only runs on intersection,
   * and a display:none box never intersects.
   */
  hideOnPhone?: boolean;
  /** No label row and tighter padding — see ProgrammaticAd. */
  compact?: boolean;
  /**
   * Which slot map gates the unit: the /read template (default) or
   * the organic post page. The dashed density-review placeholder is a
   * /read-template tool and never renders for the organic surface.
   */
  surface?: ReadAdSurface;
  /**
   * Runs the auction on mount instead of waiting to near the viewport. For
   * slots visible at first paint the intersection wait only adds latency, and
   * pbjs queues commands before the bundle has even arrived, so eager slots
   * ride its very first processing pass.
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
  compact,
  eager,
  logExtra,
  slots,
  surface,
  allowPlaceholder = false,
}: ReadAdSlotProps & {
  slots: AdSlots;
  surface: ReadAdSurface;
  allowPlaceholder?: boolean;
}): ReactElement | null {
  const isLive = hasLiveAdSlots(slots);
  const config = slots[String(slot)];

  if (isLive) {
    if (!config) {
      return null;
    }
    return (
      // A slot runs its auction once per mount, so a change of format or
      // booked size has to remount rather than re-render.
      <ProgrammaticAd
        key={`${surface}:${slot}:${format}:${JSON.stringify(
          config.sizes ?? '',
        )}`}
        slot={slot}
        config={config}
        format={format}
        surface={surface}
        className={className}
        refreshes={refreshes}
        hideOnPhone={hideOnPhone}
        compact={compact}
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
      data-testid={`read-ad-slot-${slot}`}
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

function ReadSurfaceAdSlot(props: ReadAdSlotProps): ReactElement | null {
  const slots = useReadAdSlots();
  // Off from the first render, not once boot resolves, so neither a unit
  // nor a development placeholder flashes before Taboola takes over.
  const taboola = useFeature(featureReadTaboola);

  if (taboola) {
    return null;
  }

  return (
    <MappedAdSlot {...props} slots={slots} surface="read" allowPlaceholder />
  );
}

function OrganicSurfaceAdSlot(props: ReadAdSlotProps): ReactElement | null {
  const slots = useOrganicAdSlots();
  return <MappedAdSlot {...props} slots={slots} surface="organic" />;
}

/**
 * A programmatic ad slot. Live only while its surface's hook says so (the
 * /read template sits behind the read_ads kill switch, the organic post page
 * is anonymous-only) AND its hardcoded map (slots.ts) lists this slot number.
 * Everything else collapses to nothing, so visitors get a clean page. The
 * dashed density-review placeholder only ever appears in local development
 * builds of the /read template.
 */
export function ReadAdSlot({
  surface = 'read',
  ...props
}: ReadAdSlotProps): ReactElement | null {
  if (surface === 'organic') {
    return <OrganicSurfaceAdSlot {...props} />;
  }
  return <ReadSurfaceAdSlot {...props} />;
}
