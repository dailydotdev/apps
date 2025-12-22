// Log 2025 hooks

// Animation hooks
export { useAnimatedNumber } from './useAnimatedNumber';
export { useStaggeredAnimation } from './useStaggeredAnimation';

// Navigation
export { useCardNavigation } from './useCardNavigation';
export type { CardConfig, NavigationEvent } from './useCardNavigation';

// Data fetching
export { useLog, LOG_QUERY_KEY } from './useLog';

// Music
export { useBackgroundMusic } from './useBackgroundMusic';

// Sharing
export { shareLog } from './shareLogImage';
export type { ShareResult } from './shareLogImage';
export { useShareImagePreloader } from './useShareImagePreloader';

// Stats calculations
export {
  useBestPercentileStat,
  getBestPercentileStat,
  calculateTotalEngagement,
  useTotalEngagement,
  getPeakReadingHour,
  usePeakReadingHour,
} from './useLogStats';
export type { EngagementStat, EngagementPercentileData } from './useLogStats';
