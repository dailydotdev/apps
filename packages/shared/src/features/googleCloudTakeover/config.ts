// DEMO TOGGLE — Google Cloud advertiser takeover injected directly into the
// main feed (My Feed / Popular). When enabled, the four GCP placements render
// for ALL users with no flag/auth/Plus gating, so the takeover can be shown
// live on any account.
//
// NOTE: this is a hardcoded sales-demo switch, not a GrowthBook experiment.
// It is `true` on purpose for the demo. Set it to `false` to turn the takeover
// off, and do not ship it enabled to a production audience.
export const googleCloudTakeoverEnabled = true;

// Number of cards prepended at the top of the feed before the real items: the
// sponsored blog card + the engagement (second) card. The head ad is injected
// separately before item 0. Used to keep the strip aligned to a row boundary.
export const googleCloudPrependedCards = 2;

// The full-row strip starts at this grid row (0-based). Picking a whole row
// (rather than an item index) guarantees the row above it is full, so there
// are no empty cells before the strip.
export const googleCloudStripRow = 4;
