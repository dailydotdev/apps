import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import styles from './Log.module.css';

interface TopPercentileBannerProps {
  preText: ReactNode;
  mainText: ReactNode;
  postText: ReactNode;
  /** Whether to animate the banner (set false for static image generation) */
  animated?: boolean;
  delay?: number;
  motionProps?: Omit<MotionProps, 'className'>;
  /** Additional CSS class name for context-specific styling */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    celebrationBanner?: string;
    bannerBg?: string;
    bannerContent?: string;
    bannerPre?: string;
    bannerMain?: string;
    bannerPost?: string;
  };
}

/**
 * TopPercentileBanner - Celebration banner for displaying percentile stats
 *
 * Supports both animated (interactive cards) and static (image generation) modes.
 * Use customStyles prop when rendering in static cards with different CSS modules.
 *
 * @example
 * ```tsx
 * // Interactive card (animated)
 * <TopPercentileBanner preText="Top" mainText="8%" postText="of devs" />
 *
 * // Static card (no animation)
 * <TopPercentileBanner
 *   preText="Top"
 *   mainText="8%"
 *   postText="of devs"
 *   animated={false}
 *   customStyles={staticStyles}
 * />
 * ```
 */
export default function TopPercentileBanner({
  preText,
  mainText,
  postText,
  animated = true,
  delay = 1.5,
  motionProps,
  className,
  customStyles,
}: TopPercentileBannerProps): ReactElement {
  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    celebrationBanner:
      customStyles?.celebrationBanner ?? styles.celebrationBanner,
    bannerBg: customStyles?.bannerBg ?? styles.bannerBg,
    bannerContent: customStyles?.bannerContent ?? styles.bannerContent,
    bannerPre: customStyles?.bannerPre ?? styles.bannerPre,
    bannerMain: customStyles?.bannerMain ?? styles.bannerMain,
    bannerPost: customStyles?.bannerPost ?? styles.bannerPost,
  };

  const containerClass = className
    ? `${s.celebrationBanner} ${className}`
    : s.celebrationBanner;

  // Static rendering for image generation
  if (!animated) {
    return (
      <div className={containerClass}>
        <div className={s.bannerBg} />
        <div className={s.bannerContent}>
          <span className={s.bannerPre}>{preText}</span>
          <span className={s.bannerMain}>{mainText}</span>
          <span className={s.bannerPost}>{postText}</span>
        </div>
      </div>
    );
  }

  // Animated rendering for interactive cards
  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, x: -100, rotate: -5 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      {...motionProps}
    >
      <div className={s.bannerBg} />
      <div className={s.bannerContent}>
        <span className={s.bannerPre}>{preText}</span>
        <motion.span
          className={s.bannerMain}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        >
          {mainText}
        </motion.span>
        <span className={s.bannerPost}>{postText}</span>
      </div>
    </motion.div>
  );
}
