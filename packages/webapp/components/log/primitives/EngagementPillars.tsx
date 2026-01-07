import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import styles from '../Log.module.css';

interface EngagementPillarsProps {
  /** Number of upvotes given */
  upvotes: number;
  /** Number of comments written */
  comments: number;
  /** Number of posts bookmarked */
  bookmarks: number;
  /** Whether to animate the pillars (set false for static image generation) */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Icon size (different for static images) */
  iconSize?: IconSize;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    engagementPillars?: string;
    engagementPillar?: string;
    pillarIcon?: string;
    pillarValue?: string;
    pillarLabel?: string;
  };
}

interface PillarConfig {
  icon: ReactNode;
  value: number;
  label: string;
}

/**
 * Single pillar component
 */
function Pillar({
  icon,
  value,
  label,
  animated,
  customStyles,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  animated: boolean;
  customStyles?: EngagementPillarsProps['customStyles'];
}): ReactElement {
  const s = {
    engagementPillar: customStyles?.engagementPillar ?? styles.engagementPillar,
    pillarIcon: customStyles?.pillarIcon ?? styles.pillarIcon,
    pillarValue: customStyles?.pillarValue ?? styles.pillarValue,
    pillarLabel: customStyles?.pillarLabel ?? styles.pillarLabel,
  };

  const content = (
    <>
      <span className={s.pillarIcon}>{icon}</span>
      <span className={s.pillarValue}>{largeNumberFormat(value)}</span>
      <span className={s.pillarLabel}>{label}</span>
    </>
  );

  if (!animated) {
    return <div className={s.engagementPillar}>{content}</div>;
  }

  return (
    <motion.div className={s.engagementPillar} whileHover={{ scale: 1.05 }}>
      {content}
    </motion.div>
  );
}

/**
 * EngagementPillars - Three-column display for community engagement stats
 *
 * Shows upvotes, comments, and bookmarks in a pillar format.
 * Supports both animated (interactive cards) and static (image generation) modes.
 *
 * @example
 * ```tsx
 * // Interactive card (animated)
 * <EngagementPillars upvotes={234} comments={18} bookmarks={89} animated />
 *
 * // Static card (no animation, larger icons)
 * <EngagementPillars
 *   upvotes={234}
 *   comments={18}
 *   bookmarks={89}
 *   animated={false}
 *   iconSize={IconSize.XXXLarge}
 * />
 * ```
 */
export default function EngagementPillars({
  upvotes,
  comments,
  bookmarks,
  animated = true,
  delay = 0.7,
  iconSize = IconSize.Medium,
  className,
  customStyles,
}: EngagementPillarsProps): ReactElement {
  const s = {
    engagementPillars:
      customStyles?.engagementPillars ?? styles.engagementPillars,
  };

  const containerClass = className
    ? `${s.engagementPillars} ${className}`
    : s.engagementPillars;

  const pillars: PillarConfig[] = [
    {
      icon: (
        <UpvoteIcon
          secondary
          size={iconSize}
          className="text-action-upvote-default"
        />
      ),
      value: upvotes,
      label: 'upvotes',
    },
    {
      icon: (
        <DiscussIcon
          secondary
          size={iconSize}
          className="text-action-comment-default"
        />
      ),
      value: comments,
      label: 'comments',
    },
    {
      icon: (
        <BookmarkIcon
          secondary
          size={iconSize}
          className="text-action-bookmark-default"
        />
      ),
      value: bookmarks,
      label: 'saved',
    },
  ];

  // Static rendering for image generation
  if (!animated) {
    return (
      <div className={containerClass}>
        {pillars.map((pillar) => (
          <Pillar
            key={pillar.label}
            icon={pillar.icon}
            value={pillar.value}
            label={pillar.label}
            animated={false}
            customStyles={customStyles}
          />
        ))}
      </div>
    );
  }

  // Animated rendering for interactive cards
  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {pillars.map((pillar) => (
        <Pillar
          key={pillar.label}
          icon={pillar.icon}
          value={pillar.value}
          label={pillar.label}
          animated
          customStyles={customStyles}
        />
      ))}
    </motion.div>
  );
}
