import type { Sponsor } from './SponsoredStrip';
import { CodeRabbitLockup } from './CodeRabbitLockup';
import { GoogleCloudLockup } from './GoogleCloudLockup';
import { NvidiaLockup } from './NvidiaLockup';

// ===========================================================
// PLACEHOLDER DATA — not a sponsorship, not an ad server.
//
// Hard-coded stand-ins so the strip can be reviewed on a real
// feed. Nothing here has been sold: the marks are advertiser
// logos already published on business.daily.dev, and Google Cloud
// is a mock lead sponsor. Real inventory would come from the ad
// service, behind a flag, before any of this ships.
// ===========================================================

const LOGO_BASE = 'https://business.daily.dev/assets/company-logos';

const sponsor = (name: string, file: string, ratio: number): Sponsor => ({
  name,
  logo: `${LOGO_BASE}/${file}.svg`,
  ratio,
});

/**
 * The paid slot: brand colour, larger, and the only link in the strip.
 *
 * Google Cloud is two-tone rather than four: the cloud keeps its inks,
 * but the shipped wordmark is #5F6368 — dark grey, which sinks into
 * the dark feed — so it rides `currentColor` and flips with the
 * ground. One source instead of Google's two lockup files.
 */
export const MOCK_LEAD_SPONSOR: Sponsor = {
  name: 'Google Cloud',
  ratio: 181 / 28,
  Artwork: GoogleCloudLockup,
  href: 'https://cloud.google.com',
};

/** The wall: silhouetted, even-weighted, inert. */
export const MOCK_PARTNER_SPONSORS: Sponsor[] = [
  // Inline rather than the library file: CodeRabbit's mark carries a
  // painted white detail, and the wall masks by alpha, so the flat
  // asset silhouettes into a featureless blob. The lockup punches the
  // detail out instead.
  {
    name: 'CodeRabbit',
    ratio: 2152 / 314,
    Artwork: CodeRabbitLockup,
  },
  // Inline for the same reason it led the strip: NVIDIA sets its
  // symbol in green and its wordmark to suit the background, so one
  // flat asset dies on one theme. Here the whole lockup silhouettes.
  {
    name: 'NVIDIA',
    ratio: 164 / 30,
    Artwork: NvidiaLockup,
  },
  sponsor('Datadog', 'datadog', 800.5 / 203.19),
  sponsor('PostHog', 'posthog', 512 / 90),
  sponsor('ClickHouse', 'clickhouse', 584.9 / 103.1),
  sponsor('Retool', 'retool', 87 / 17),
  sponsor('Snyk', 'snyk', 65 / 35),
  sponsor('Okta', 'okta', 512 / 169),
  sponsor('Neo4j', 'neo4j', 512 / 170),
  sponsor('Pulumi', 'pulumi', 512 / 128),
  sponsor('LaunchDarkly', 'launchdarkly', 512 / 80),
  sponsor('Amazon', 'amazon', 512 / 256),
  sponsor('Sonar', 'sonar', 512 / 125),
];
