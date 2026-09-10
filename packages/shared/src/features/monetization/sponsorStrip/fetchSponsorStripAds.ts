import type { AdMacroContext } from '../adMacros';
import { AdPlacement, appendConsentParams } from '../../../lib/ads';
import { apiUrl } from '../../../lib/config';
import { isDevelopment } from '../../../lib/constants';
import { MOCK_ADVERTISER_BAR } from './mockSponsorStripAds';
import { parseSponsors } from './sponsorStripCreative';

/**
 * The placement returns the whole bar — pinned, top tier and community in one
 * response — so the composition is the ad server's call and the request carries
 * nothing but consent. How many of them the row ends up drawing is decided
 * later, off the measured width.
 */
const withDevFallback = (bar: unknown): unknown =>
  isDevelopment && !parseSponsors(bar).length ? MOCK_ADVERTISER_BAR : bar;

export const fetchSponsorStripAds = async (
  consent?: AdMacroContext,
): Promise<unknown> => {
  const query = appendConsentParams(new URLSearchParams(), consent).toString();

  try {
    const res = await fetch(
      `${apiUrl}/v1/a/${AdPlacement.SponsorStrip}${query ? `?${query}` : ''}`,
      { credentials: 'include' },
    );

    return withDevFallback(await res.json());
  } catch (originalError) {
    // A local run with no ad server behind it still gets a row to work on;
    // anywhere else the query goes to error and the dock collapses, which is
    // the same outcome as no fill.
    if (isDevelopment) {
      return MOCK_ADVERTISER_BAR;
    }

    throw originalError;
  }
};
