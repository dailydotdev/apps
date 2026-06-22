// DEMO TOGGLE — Google Cloud advertiser takeover injected directly into the
// main feed (My Feed / Popular). When enabled, the four GCP placements render
// for ALL users with no flag/auth/Plus gating, so the takeover can be shown
// live on any account.
//
// NOTE: this is a hardcoded sales-demo switch, not a GrowthBook experiment.
// It is `true` on purpose for the demo. Set it to `false` to turn the takeover
// off, and do not ship it enabled to a production audience.
export const googleCloudTakeoverEnabled = true;

// The full-row Google Cloud strip is inserted after this many feed cards.
export const googleCloudStripFeedIndex = 6;
