import type { ReactElement } from 'react';
import React from 'react';
import { ArbitrageAdFormat, ArbitrageAdSlot } from './ArbitrageAdSlot';
import { useReadAdsenseSlots } from './useReadAdsenseSlots';

/**
 * Bottom-pinned slot. This is the position PostAuthBanner occupies on the
 * standard template — it is the only unit on the page every visitor sees
 * regardless of scroll depth, which is why the signup banner gives it up here.
 *
 * In live mode the real anchor is an AdSense Auto ads overlay that Google
 * pins itself, so the whole placeholder frame unmounts rather than compete
 * with it for the viewport bottom.
 */
export function ArbitrageAnchor(): ReactElement | null {
  const slots = useReadAdsenseSlots();

  if (Object.keys(slots).length > 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-3 px-2 pb-2">
      <div className="bg-background-default/95 pointer-events-auto mx-auto max-w-[69.25rem] backdrop-blur">
        <ArbitrageAdSlot
          slot={13}
          format={ArbitrageAdFormat.Anchor}
          reach="100%"
          refreshes
        />
      </div>
    </div>
  );
}
