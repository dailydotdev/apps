// Log 2025 hooks - re-export from central location

// Re-export existing hooks from the main log.ts file
export {
  useAnimatedNumber,
  useCardNavigation,
  useStaggeredAnimation,
  useLog,
  LOG_QUERY_KEY,
} from '../log';
export type { CardConfig, NavigationEvent } from '../log';

// Export new hooks
export { useBackgroundMusic } from './useBackgroundMusic';
export { useShareLogImage } from './useShareLogImage';
export { useShareImagePreloader } from './useShareImagePreloader';
