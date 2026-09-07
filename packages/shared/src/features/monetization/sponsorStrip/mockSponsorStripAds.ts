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
 * gold slot carries Google Cloud, per the design mockup, reusing the mark the
 * Explore ad-card mockup already established as this repo's Google Cloud
 * asset. It is still a fixture: nothing here says a gold slot has been sold,
 * and the "Made possible by" label claims more than a display campaign does,
 * so this stays behind the experiment flag until the slot is actually sold.
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

/**
 * The official four-colour Google Cloud mark, from the same devicon source the
 * Explore ad-card mockup uses, minus that one's white backing plate: the plate
 * is there to round-crop into a favicon, and on the strip it would sit as a
 * white tile against the dark ground.
 */
const GOOGLE_CLOUD_MARK =
  '<path fill="#ea4535" d="M80.6 40.3h.4l-.2-.2 14-14v-.3c-11.8-10.4-28.1-14-43.2-9.5C36.5 20.8 24.9 32.8 20.7 48c.2-.1.5-.2.8-.2 5.2-3.4 11.4-5.4 17.9-5.4 2.2 0 4.3.2 6.4.6.1-.1.2-.1.3-.1 9-9.9 24.2-11.1 34.6-2.6h-.1z"/>' +
  '<path fill="#557ebf" d="M108.1 47.8c-2.3-8.5-7.1-16.2-13.8-22.1L80 39.9c6 4.9 9.5 12.3 9.3 20v2.5c16.9 0 16.9 25.2 0 25.2H63.9v20h-.1l.1.2h25.4c14.6.1 27.5-9.3 31.8-23.1 4.3-13.8-1-28.8-13-36.9z"/>' +
  '<path fill="#36a852" d="M39 107.9h26.3V87.7H39c-1.9 0-3.7-.4-5.4-1.1l-15.2 14.6v.2c6 4.3 13.2 6.6 20.7 6.6z"/>' +
  '<path fill="#f9bc15" d="M40.2 41.9c-14.9.1-28.1 9.3-32.9 22.8-4.8 13.6 0 28.5 11.8 37.3l15.6-14.9c-8.6-3.7-10.6-14.5-4-20.8 6.6-6.4 17.8-4.4 21.7 3.8L68 55.2C61.4 46.9 51.1 42 40.2 42.1z"/>';

const GOLD_COMPANY = 'Google Cloud';
/**
 * Where the wordmark starts: the mark's own artwork runs x 7.3–120.9 inside a
 * 128 box, so it is shifted back to the origin and scaled to a 22px cap before
 * the text follows it. Hard numbers rather than a measured box because an SVG
 * in an `<img>` never reports one.
 */
const WORDMARK_X = 36;
const GOLD_WIDTH = WORDMARK_X + GOLD_COMPANY.length * 9.25 + 6;

/**
 * A lockup rather than a word, so the paid slot reads as a logo at a glance
 * the way the marks beside it do. Two inks: the glyph holds its brand colour
 * in both themes while the wordmark flips, which is exactly the case a single
 * flat file cannot serve and the reason the wire contract takes a pair.
 *
 * The wordmark is set in the same stack as the rest of this fixture, not in
 * Google Sans — a licensed face cannot be inlined here, and an approximated
 * one is the part a real creative would replace anyway.
 */
const goldLockup = (wordmark: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${GOLD_WIDTH}" height="32" viewBox="0 0 ${GOLD_WIDTH} 32"><g transform="translate(-1.73 1.45) scale(0.2366)">${GOOGLE_CLOUD_MARK}</g><text x="${WORDMARK_X}" y="22" font-family="'Google Sans','Product Sans',Arial,Helvetica,sans-serif" font-size="17" font-weight="700" fill="${wordmark}">${GOLD_COMPANY}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const MOCK_SPONSOR_STRIP_ADS = [
  {
    gen_id: 'mock-gold',
    company: GOLD_COMPANY,
    logo_img: {
      light: goldLockup('#0E1217'),
      dark: goldLockup('#FFFFFF'),
    },
    logo_ratio: GOLD_WIDTH / 32,
    link: 'https://cloud.google.com/free?utm_source=sponsor_strip&sponsor=google-cloud',
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
