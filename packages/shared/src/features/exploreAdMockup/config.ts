import { OtherFeedPage } from '../../lib/query';
import { activeCampaigns } from './registry';

// DEMO TOGGLE — when enabled, EVERY ad slot on the Explore feed is replaced
// with a randomized advertiser card drawn from the active campaigns (see
// registry.ts). This is the "filter" that makes every ad on Explore an
// exclusive mockup placement.
//
// NOTE: this is a hardcoded sales-demo switch, not a GrowthBook experiment.
// It is `true` on purpose for the mockup. Set it to `false` to restore normal
// ad serving, and do not ship it enabled to a production audience.
export const exploreAdMockupEnabled = true;

// Brand logo used for the lightweight placeholder ad materialized in the feed
// stream before the card randomizes its own creative at render time.
export const exploreAdMockupPlaceholderLogo =
  activeCampaigns[0]?.brand.logo ?? '';

const exploreFeeds = new Set<string>([
  OtherFeedPage.Explore,
  OtherFeedPage.ExploreLatest,
  OtherFeedPage.ExploreDiscussed,
  OtherFeedPage.ExploreUpvoted,
  OtherFeedPage.ExploreTag,
]);

export const isExploreMockupFeed = (feedName?: string): boolean =>
  !!feedName && exploreFeeds.has(feedName);
