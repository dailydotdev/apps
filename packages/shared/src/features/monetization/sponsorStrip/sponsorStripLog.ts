import type { LogEvent } from '../../../hooks/log/useLogQueue';
import type { AdActions } from '../../../lib/ads';
import { AdPlacement } from '../../../lib/ads';
import type { ResolvedSponsor } from './sponsorStripCreative';

/**
 * Every sponsor-strip signal (impression, viewable impression, click, air
 * time) reports through this one builder, so a logo's whole story can be cut
 * by tier and slot in the warehouse. Shaped like `adLogEvent` in `lib/feed.ts`
 * — same `target_type`, same url field — so the strip sits alongside the other
 * placements rather than needing its own reporting.
 */
export const sponsorStripLogEvent = (
  action: AdActions,
  sponsor: ResolvedSponsor,
  slotIndex: number,
  extra?: Record<string, unknown>,
): LogEvent => ({
  event_name: action,
  target_id: sponsor.company,
  target_type: 'ad',
  feed_item_target_url: sponsor.link,
  extra: JSON.stringify({
    placement: AdPlacement.SponsorStrip,
    tier: sponsor.tier,
    slot_index: slotIndex,
    gen_id: sponsor.genId,
    ...extra,
  }),
});

/**
 * Air time is a duration event, so its key has to survive a rotation: the
 * outgoing logo's event ends under its own key while the incoming one starts
 * under a new one, in the same render.
 */
export const airTimeKey = (slotIndex: number, genId: string): string =>
  `ss-${slotIndex}-${genId}`;
