import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { isDevelopment } from '../../../lib/constants';
import { useOrganicAdSlots, useReadAdSlots } from './useReadAdSlots';
import type { AdSlots } from './slots';
import { hasLiveAdSlots } from './slots';
import type { ProgrammaticAdFormat } from '../../../features/monetization/ProgrammaticAd';
import {
  FORMAT_SPEC,
  ProgrammaticAd,
} from '../../../features/monetization/ProgrammaticAd';

export type ReadAdSurface = 'read' | 'organic';

export { ProgrammaticAdFormat as ReadAdFormat } from '../../../features/monetization/ProgrammaticAd';

export interface ReadAdSlotProps {
  slot: number;
  format: ProgrammaticAdFormat;
  className?: string;
  /**
   * Drops the slot below the tablet breakpoint. The Better Ads Standards cap
   * mobile ad density at 30% of page height, and Chrome's filter for a
   * violation applies to the whole domain. The anchor is hidden rather than
   * skipped so the tag's selectors still see one unit map per surface.
   */
  hideOnPhone?: boolean;
  /**
   * Which slot map gates the unit: the /read template (default) or
   * the organic post page. The dashed density-review placeholder is a
   * /read-template tool and never renders for the organic surface.
   */
  surface?: ReadAdSurface;
}

function MappedAdSlot({
  slot,
  format,
  className,
  hideOnPhone,
  slots,
  surface,
  allowPlaceholder = false,
}: ReadAdSlotProps & {
  slots: AdSlots;
  surface: ReadAdSurface;
  allowPlaceholder?: boolean;
}): ReactElement | null {
  const isLive = hasLiveAdSlots(slots);

  if (isLive) {
    if (!slots[String(slot)]) {
      return null;
    }
    return (
      <ProgrammaticAd
        slot={slot}
        format={format}
        surface={surface}
        className={className}
        hideOnPhone={hideOnPhone}
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
        'relative flex min-h-40 w-full items-center justify-center border border-border-subtlest-tertiary bg-background-subtle px-3 py-4',
        hideOnPhone && 'hidden tablet:flex',
        className,
      )}
      data-testid={`read-ad-slot-${slot}`}
    >
      <span className="absolute left-3 top-2 rounded-6 bg-accent-cheese-default px-2 py-0.5 font-bold text-surface-invert typo-caption2">
        {slot}
      </span>
      <span className="absolute right-3 top-2 rounded-6 bg-background-default px-2 py-0.5 text-text-quaternary typo-caption2">
        {spec.size}
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
 * behind organic_ads, both anonymous-only) AND its hardcoded map (slots.ts)
 * lists this slot number.
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
