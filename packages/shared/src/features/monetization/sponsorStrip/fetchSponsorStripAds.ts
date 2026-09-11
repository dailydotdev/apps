import type { AdMacroContext } from '../adMacros';
import { AdPlacement, appendConsentParams } from '../../../lib/ads';
import { apiUrl } from '../../../lib/config';

/**
 * The placement lives on the ad server's `/v2/a/:placement` route, not the
 * three hardcoded `/v1/a` ones the older placements use — those are legacy
 * aliases and there is no `/v1/a/advertiser_bar` behind them, so asking there
 * 404s into an empty row rather than failing loudly.
 *
 * The response carries the whole bar — pinned, top tier and community together
 * — so the composition is the ad server's call and the request carries nothing
 * but consent. How many of them the row draws is decided later, off the
 * measured width. The reader comes from the `da2` cookie, which is what
 * `credentials` is for.
 */
export const fetchSponsorStripAds = async (
  consent?: AdMacroContext,
): Promise<unknown> => {
  const query = appendConsentParams(new URLSearchParams(), consent).toString();
  const res = await fetch(
    `${apiUrl}/v2/a/${AdPlacement.SponsorStrip}${query ? `?${query}` : ''}`,
    { credentials: 'include' },
  );

  return res.json();
};
