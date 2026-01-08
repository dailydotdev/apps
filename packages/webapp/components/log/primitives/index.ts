// Log primitives - reusable components for Log cards
// All primitives support both animated (interactive) and static (image generation) modes

// Typography
export { default as HeadlineStack, SimpleHeadline } from './HeadlineStack';
export type { HeadlineRowConfig } from './HeadlineStack';

// Stats display
export { default as StatBadge, StatBadgeGroup } from './StatBadge';
export type { BadgeShadowColor } from './StatBadge';

// Decorative elements
export { default as Divider } from './Divider';

// Visualizations
export { default as ClockVisualization } from './ClockVisualization';
export { default as Podium } from './Podium';
export { default as TrackList } from './TrackList';
export { default as EngagementPillars } from './EngagementPillars';

// Shared utilities
export {
  formatHour,
  normalizeHourDistribution,
  calculateClockAngle,
  PATTERN_BANNER_TEXT,
  PODIUM_MEDALS,
  PODIUM_HEIGHTS_INTERACTIVE,
  PODIUM_HEIGHTS_STATIC,
  PODIUM_DELAYS,
  getPodiumRank,
  findBestEngagementStat,
  shouldShowPercentileBanner,
} from './utils';
export type { EngagementStat } from './utils';
