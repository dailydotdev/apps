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
 * PLACEHOLDER DATA — not a sponsorship and not an ad server. The wall marks
 * are advertiser logos already published on business.daily.dev, borrowed so
 * the row can be judged at the weight and spacing real assets give it. The
 * gold slot is deliberately a fictional company: the paid slot is the one
 * place where a real name would read as a deal that has been signed.
 *
 * One mark is deliberately absent: business.daily.dev serves GitLab's logo as
 * a base64 WebP wrapped in an `<svg>`, and a raster has no alpha shape to mask
 * — it silhouettes into a solid block. It is the clearest example of why real
 * inventory needs an asset spec, and it is left out rather than papered over.
 *
 * `pixel` is empty throughout. A fixture that pinged the ad server with
 * invented generation ids would put junk impressions in real reporting; the
 * pixel path is covered by the specs instead.
 */

const LOGO_BASE = 'https://business.daily.dev/assets/company-logos';

const wallSponsor = (
  company: string,
  file: string,
  ratio: number,
  tier: SponsorTier,
) => ({
  gen_id: `mock-${file}`,
  company,
  // The same file for both themes: the wall silhouettes its marks through a
  // mask that takes the row's text colour, so one asset serves either ground.
  // Real creatives are expected to carry a themed pair — see the gold slot,
  // which cannot be masked because its colour is the point.
  logo_img: {
    light: `${LOGO_BASE}/${file}.svg`,
    dark: `${LOGO_BASE}/${file}.svg`,
  },
  logo_ratio: ratio,
  link: `https://daily.dev/?utm_source=sponsor_strip&sponsor=${file}`,
  pixel: [] as string[],
  tier,
});

const GLYPH_COLOR = '#CE3DF3';

/**
 * A lockup rather than a word, so the paid slot reads as a logo at a glance
 * the way the marks beside it do. Two inks: the glyph holds its brand colour
 * in both themes while the wordmark flips, which is exactly the case a single
 * flat file cannot serve and the reason the wire contract takes a pair.
 */
const goldLockup = (company: string, wordmark: string): string => {
  const width = company.length * 11 + 46;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="32" viewBox="0 0 ${width} 32"><rect x="0" y="4" width="24" height="24" rx="7" fill="${GLYPH_COLOR}"/><path d="M7.5 16.5l3.5 3.5 6-7" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="32" y="22" font-family="Verdana,Geneva,sans-serif" font-size="17" font-weight="700" fill="${wordmark}">${company}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const GOLD_COMPANY = 'Quantile';
const GOLD_WIDTH = GOLD_COMPANY.length * 11 + 46;

const MOCK_SPONSOR_STRIP_ADS = [
  {
    gen_id: 'mock-gold',
    company: GOLD_COMPANY,
    logo_img: {
      light: goldLockup(GOLD_COMPANY, '#0E1217'),
      dark: goldLockup(GOLD_COMPANY, '#FFFFFF'),
    },
    logo_ratio: GOLD_WIDTH / 32,
    link: 'https://daily.dev/?utm_source=sponsor_strip&sponsor=quantile',
    pixel: [] as string[],
    tier: SponsorTier.Gold,
  },
  // Ratios are the marks' own, read off each file's viewBox, so the optical
  // sizing has the same numbers a real creative would carry.
  wallSponsor('Datadog', 'datadog', 800.5 / 203.19, SponsorTier.Premium),
  wallSponsor('PostHog', 'posthog', 512 / 90, SponsorTier.Premium),
  wallSponsor('ClickHouse', 'clickhouse', 584.9 / 103.1, SponsorTier.Premium),
  wallSponsor('Retool', 'retool', 87 / 17, SponsorTier.Premium),
  wallSponsor('Snyk', 'snyk', 65 / 35, SponsorTier.Premium),
  wallSponsor('Okta', 'okta', 512 / 169, SponsorTier.Community),
  wallSponsor('Neo4j', 'neo4j', 512 / 170, SponsorTier.Community),
  wallSponsor('Pulumi', 'pulumi', 512 / 128, SponsorTier.Community),
  wallSponsor('LaunchDarkly', 'launchdarkly', 512 / 80, SponsorTier.Community),
  wallSponsor('Sonar', 'sonar', 512 / 125, SponsorTier.Community),
  wallSponsor('JetBrains', 'jetbrains', 298 / 64, SponsorTier.Community),
  wallSponsor('Sentry', 'sentry', 512 / 113, SponsorTier.Community),
];

export const fetchSponsorStripAds = async (): Promise<unknown> =>
  MOCK_SPONSOR_STRIP_ADS;
