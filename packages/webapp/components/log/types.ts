// Shared types for Log card components
import type { LogData } from '../../types/log';

/**
 * Base props interface for all Log card components
 */
export interface BaseCardProps {
  /** The log data containing all user statistics */
  data: LogData;
  /** Whether this card is currently visible/active (triggers animations) */
  isActive: boolean;
  /** Sub-card index for cards with multiple views (e.g., Topic Evolution quarters) */
  subcard?: number;
  /** Whether the user is on a touch device (affects navigation hints) */
  isTouchDevice?: boolean;
  /** Whether the card data is still loading */
  isLoading?: boolean;
  /** Card type identifier for image generation */
  cardType?: string;
  /** Cache for pre-generated card images */
  imageCache?: Map<string, Blob>;
  /** Callback when a card image is fetched/generated */
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

/**
 * Extended props for cards that support sharing actions
 */
export interface ShareableCardProps extends BaseCardProps {
  /** Callback triggered when user initiates a share action */
  onShare?: () => void;
}

/**
 * Props for static card components used in image generation
 */
export interface StaticCardProps<
  T extends Partial<LogData> = Partial<LogData>,
> {
  /** Partial log data containing only the fields needed for this card */
  data: T;
}

/**
 * Common motion animation variants used across cards
 */
export const cardMotionVariants = {
  /** Fade in and slide up */
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  /** Scale in with spring */
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
  },
  /** Slide in from left with rotation */
  slideInLeft: {
    initial: { opacity: 0, x: -40, rotate: -5 },
    animate: { opacity: 1, x: 0, rotate: -2 },
  },
  /** Slide in from right with rotation */
  slideInRight: {
    initial: { opacity: 0, x: 40, rotate: 5 },
    animate: { opacity: 1, x: 0, rotate: 2 },
  },
} as const;

/**
 * Headline text animation variants with staggered delays
 */
export const headlineMotionVariants = {
  small: {
    initial: { opacity: 0, y: 30, rotate: -3 },
    animate: { opacity: 1, y: 0, rotate: 0 },
  },
  big: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
  },
  medium: {
    initial: { opacity: 0, y: 30, rotate: 3 },
    animate: { opacity: 1, y: 0, rotate: 0 },
  },
  accent: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
} as const;
