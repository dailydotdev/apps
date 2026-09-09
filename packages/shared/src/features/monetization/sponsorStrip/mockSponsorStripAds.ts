import { isDevelopment } from '../../../lib/constants';
import { SponsorTier } from './sponsorStripCreative';

/**
 * Stand-in for the `footer_logo` placement while the ad server side is built.
 * Swapping it for the real thing is one call:
 *
 *   GET /v1/a/footer_logo?count=<n>  (+ the consent params in `lib/ads.ts`)
 *
 * The payload below is the wire shape `sponsorStripCreativeSchema` parses, so
 * the response drops in without touching anything downstream.
 *
 * Every mark is a generated placeholder for a fictitious company, and the guard
 * at the bottom returns nothing outside development. Both are deliberate: the
 * row is labelled "Made possible by" and fires real impression, viewable
 * impression, air time and click events, so a real company's mark here would
 * claim a sponsorship that does not exist — and ramping the flag, which is the
 * whole point of it being a flag, would ship that claim. Placeholders exercise
 * the masking, the themed pair and the optical sizing identically.
 */

/**
 * Marks are generated rather than fetched so the fixture pulls nothing from a
 * third party, and so `logo_ratio` is exact by construction rather than
 * measured off someone else's file.
 */
const placeholderMark = (label: string, ratio: number, ink: string): string => {
  const height = 40;
  const width = Math.round(height * ratio);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect x="0" y="8" width="24" height="24" rx="6" fill="${ink}"/>` +
    `<text x="32" y="28" font-family="sans-serif" font-size="20" font-weight="700" fill="${ink}">${label}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const slugOf = (company: string) =>
  company.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const wallSponsor = (company: string, ratio: number, tier: SponsorTier) => ({
  gen_id: `mock-${slugOf(company)}`,
  company,
  // The same asset for both themes: the wall silhouettes its marks through a
  // mask that takes the row's text colour, so one serves either ground. Real
  // creatives are expected to carry a themed pair — see the gold slot, which
  // cannot be masked because its colour is the point.
  logo_img: {
    light: placeholderMark(company, ratio, '#000000'),
    dark: placeholderMark(company, ratio, '#000000'),
  },
  logo_ratio: ratio,
  link: `https://daily.dev/?utm_source=sponsor_strip&sponsor=${slugOf(
    company,
  )}`,
  pixel: [] as string[],
  tier,
});

const GOLD_COMPANY = 'Relecloud';
const GOLD_RATIO = 123 / 20;

/**
 * The gold slot keeps its own colour rather than being masked, which is the one
 * case a single flat asset cannot serve and the reason the wire contract takes
 * a themed pair.
 */
const goldSponsor = {
  gen_id: 'mock-gold',
  company: GOLD_COMPANY,
  logo_img: {
    light: placeholderMark(GOLD_COMPANY, GOLD_RATIO, '#0E1217'),
    dark: placeholderMark(GOLD_COMPANY, GOLD_RATIO, '#FFFFFF'),
  },
  logo_ratio: GOLD_RATIO,
  link: `https://daily.dev/?utm_source=sponsor_strip&sponsor=${slugOf(
    GOLD_COMPANY,
  )}`,
  pixel: [] as string[],
  tier: SponsorTier.Gold,
};

// Ratios span the range real marks do — a near-square through to a long
// wordmark — so the optical sizing is exercised across the same spread.
const MOCK_SPONSOR_STRIP_ADS = [
  goldSponsor,
  wallSponsor('Contoso', 3.94, SponsorTier.Premium),
  wallSponsor('Fabrikam', 5.69, SponsorTier.Premium),
  wallSponsor('Northwind', 5.67, SponsorTier.Premium),
  wallSponsor('Litware', 5.12, SponsorTier.Premium),
  wallSponsor('Proseware', 1.86, SponsorTier.Premium),
  wallSponsor('Adventure Works', 3.03, SponsorTier.Community),
  wallSponsor('Woodgrove', 3.01, SponsorTier.Community),
  wallSponsor('Tailspin', 4.0, SponsorTier.Community),
  wallSponsor('Wingtip', 6.4, SponsorTier.Community),
  wallSponsor('Lucerne', 4.1, SponsorTier.Community),
  wallSponsor('Trey Research', 4.66, SponsorTier.Community),
  wallSponsor('Blue Yonder', 4.53, SponsorTier.Community),
];

/**
 * Empty outside development, so ramping `sponsor_strip` cannot put fabricated
 * sponsorships in front of a reader. The guard is here rather than at the call
 * site for the reason `mockFeedHighlights` did the same: nothing upstream can
 * opt back in, and the ramp exercises the dock's empty-row path instead.
 */
export const fetchSponsorStripAds = async (): Promise<unknown> =>
  isDevelopment ? MOCK_SPONSOR_STRIP_ADS : [];
