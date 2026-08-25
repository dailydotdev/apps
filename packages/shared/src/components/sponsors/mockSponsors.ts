import type { Sponsor } from './SponsoredStrip';
import { NvidiaLockup } from './NvidiaLockup';

// ===========================================================
// PLACEHOLDER DATA — not a sponsorship, not an ad server.
//
// Hard-coded stand-ins so the strip can be reviewed on a real
// feed. Nothing here has been sold: the marks are advertiser
// logos already published on business.daily.dev, and NVIDIA is
// a mock lead sponsor. Real inventory would come from the ad
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
 * NVIDIA sets its symbol in green and its wordmark in black or white
 * to suit the background — two assets, and either one dies on the
 * opposite theme. Rendered inline the symbol holds #76B900 while the
 * wordmark takes `currentColor`, so one source covers both.
 */
export const MOCK_LEAD_SPONSOR: Sponsor = {
  name: 'NVIDIA',
  ratio: 164 / 30,
  Artwork: NvidiaLockup,
  href: 'https://www.nvidia.com',
};

/** The wall: silhouetted, even-weighted, inert. */
export const MOCK_PARTNER_SPONSORS: Sponsor[] = [
  sponsor('CodeRabbit', 'coderabbit', 2152 / 314),
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
