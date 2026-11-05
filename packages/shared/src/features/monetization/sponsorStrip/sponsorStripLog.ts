import type { LogEvent } from '../../../hooks/log/useLogQueue';
import { AdActions, AdPlacement } from '../../../lib/ads';
import { TargetType } from '../../../lib/log';
import type { ResolvedSponsor } from './sponsorStripCreative';
import type { SponsorSlot } from './sponsorStripSlots';

/**
 * A click on one logo. Shaped like `adLogEvent` in `lib/feed.ts` — same
 * `target_type`, same url field — so strip clicks sit alongside the other
 * placements rather than needing their own reporting.
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
 * One impression for the marks a strip render put on screen, with the
 * advertisers listed in `extra.sponsors`, rather than one event per logo: a
 * render holds about a dozen marks and the per-logo events were the largest
 * share of the warehouse's traffic. Its own `target_type`, not `ad`, so the
 * rows stay out of the per-ad views built on top of `target_type = 'ad'`.
 * Billing does not read this: the ad server counts each logo from its pixel.
 */
export const sponsorStripImpressionLogEvent = (
  slots: SponsorSlot[],
): LogEvent => ({
  event_name: AdActions.Impression,
  target_id: AdPlacement.SponsorStrip,
  target_type: TargetType.SponsorStrip,
  extra: JSON.stringify({
    placement: AdPlacement.SponsorStrip,
    sponsors: slots.map(({ sponsor, slotIndex }) => ({
      company: sponsor.company,
      tier: sponsor.tier,
      slot_index: slotIndex,
      gen_id: sponsor.genId,
    })),
  }),
});
