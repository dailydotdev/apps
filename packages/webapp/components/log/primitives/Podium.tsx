import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Image,
  ImageType,
} from '@dailydotdev/shared/src/components/image/Image';
import styles from '../Log.module.css';
import {
  PODIUM_MEDALS,
  PODIUM_HEIGHTS_INTERACTIVE,
  PODIUM_HEIGHTS_STATIC,
  PODIUM_DELAYS,
  getPodiumRank,
} from './utils';

interface SourceData {
  name: string;
  logoUrl: string;
  postsRead: number;
}

interface PodiumProps {
  /** Top sources to display (in rank order: 1st, 2nd, 3rd). Can have 1-3 items. */
  sources: SourceData[];
  /** Whether to animate the podium (set false for static image generation) */
  animated?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    podiumStage?: string;
    podiumColumn?: string;
    podiumMedal?: string;
    podiumSource?: string;
    podiumSourceLogo?: string;
    podiumSourceName?: string;
    podiumBar?: string;
    podiumBarFirst?: string;
    podiumRank?: string;
    podiumCount?: string;
  };
}

/**
 * Podium - Olympic-style podium for displaying top 3 sources
 *
 * Displays sources in podium order: [2nd, 1st, 3rd] for visual impact.
 * Supports both animated (interactive cards) and static (image generation) modes.
 *
 * @example
 * ```tsx
 * // Interactive card (animated)
 * <Podium sources={[first, second, third]} animated />
 *
 * // Static card (no animation)
 * <Podium sources={[first, second, third]} animated={false} />
 * ```
 */
export default function Podium({
  sources,
  animated = true,
  className,
  customStyles,
}: PodiumProps): ReactElement {
  const [showMedals, setShowMedals] = useState(!animated);

  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    podiumStage: customStyles?.podiumStage ?? styles.podiumStage,
    podiumColumn: customStyles?.podiumColumn ?? styles.podiumColumn,
    podiumMedal: customStyles?.podiumMedal ?? styles.podiumMedal,
    podiumSource: customStyles?.podiumSource ?? styles.podiumSource,
    podiumSourceLogo: customStyles?.podiumSourceLogo ?? styles.podiumSourceLogo,
    podiumSourceName: customStyles?.podiumSourceName ?? styles.podiumSourceName,
    podiumBar: customStyles?.podiumBar ?? styles.podiumBar,
    podiumBarFirst: customStyles?.podiumBarFirst ?? styles.podiumBarFirst,
    podiumRank: customStyles?.podiumRank ?? styles.podiumRank,
    podiumCount: customStyles?.podiumCount ?? styles.podiumCount,
  };

  const containerClass = className
    ? `${s.podiumStage} ${className}`
    : s.podiumStage;

  // Reorder for podium display: [2nd, 1st, 3rd] - only include sources that exist
  // Visual order maps to: index 0 = 2nd place, index 1 = 1st place, index 2 = 3rd place
  const podiumOrder: Array<{ source: SourceData; rankIndex: number }> = [];
  if (sources[1]) {
    podiumOrder.push({ source: sources[1], rankIndex: 0 }); // 2nd place (left)
  }
  if (sources[0]) {
    podiumOrder.push({ source: sources[0], rankIndex: 1 }); // 1st place (center)
  }
  if (sources[2]) {
    podiumOrder.push({ source: sources[2], rankIndex: 2 }); // 3rd place (right)
  }
  const heights = animated ? PODIUM_HEIGHTS_INTERACTIVE : PODIUM_HEIGHTS_STATIC;

  // Show medals after delay in animated mode
  useEffect(() => {
    if (!animated) {
      setShowMedals(true);
      return undefined;
    }

    const timer = setTimeout(() => setShowMedals(true), 1200);
    return () => clearTimeout(timer);
  }, [animated]);

  // Static rendering for image generation
  if (!animated) {
    return (
      <div className={containerClass}>
        {podiumOrder.map(({ source, rankIndex }) => {
          const rank = getPodiumRank(rankIndex);
          const height = heights[rankIndex];
          const isFirst = rankIndex === 1;

          return (
            <div key={source.name} className={s.podiumColumn}>
              <div className={s.podiumMedal}>{PODIUM_MEDALS[rankIndex]}</div>
              <div className={s.podiumSource}>
                {source.logoUrl && (
                  <img
                    src={source.logoUrl}
                    alt={source.name}
                    className={s.podiumSourceLogo}
                  />
                )}
                <span className={s.podiumSourceName}>{source.name}</span>
              </div>
              <div
                className={`${s.podiumBar} ${isFirst ? s.podiumBarFirst : ''}`}
                style={{ height }}
              >
                <span className={s.podiumRank}>{rank}</span>
                <span className={s.podiumCount}>{source.postsRead} posts</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Animated rendering for interactive cards
  return (
    <div className={containerClass}>
      {podiumOrder.map(({ source, rankIndex }) => {
        const rank = getPodiumRank(rankIndex);
        const height = heights[rankIndex];
        const delay = PODIUM_DELAYS[rankIndex];
        const isFirst = rankIndex === 1;

        return (
          <motion.div
            key={source.name}
            className={s.podiumColumn}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: 'spring', stiffness: 100 }}
          >
            {/* Medal with bounce */}
            <motion.div
              className={s.podiumMedal}
              initial={{ scale: 0, rotate: -180 }}
              animate={showMedals ? { scale: 1, rotate: 0 } : { scale: 0 }}
              transition={{
                delay: delay + 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 10,
              }}
            >
              {PODIUM_MEDALS[rankIndex]}
            </motion.div>

            {/* Source icon + name */}
            <motion.div
              className={s.podiumSource}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {source.logoUrl && (
                <Image
                  src={source.logoUrl}
                  alt={source.name}
                  className="size-8 rounded-full object-cover"
                  type={ImageType.Squad}
                />
              )}
              {source.name}
            </motion.div>

            {/* Bar */}
            <motion.div
              className={s.podiumBar}
              style={{
                height: 0,
                background: isFirst
                  ? 'linear-gradient(180deg, #f7c948 0%, #ff6b35 100%)'
                  : '#fff',
              }}
              animate={{ height }}
              transition={{
                delay: delay + 0.1,
                duration: 0.5,
                ease: 'easeOut',
              }}
            >
              <span className={s.podiumRank}>{rank}</span>
              <span className={s.podiumCount}>{source.postsRead} posts</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
