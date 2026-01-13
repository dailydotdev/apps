import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import styles from '../Log.module.css';

/**
 * Shadow color options for stat badges
 */
export type BadgeShadowColor = 'primary' | 'accent' | 'lime' | 'secondary';

interface StatBadgeProps {
  /** The main value to display (number or text) */
  value: ReactNode;
  /** The label describing the value */
  label: string;
  /** Whether to use the large variant */
  large?: boolean;
  /** Whether to animate the badge */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Enable hover/tap interactions */
  interactive?: boolean;
  /** Custom rotation in degrees */
  rotation?: number;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Additional motion props for animated badges */
  motionProps?: MotionProps;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    badge?: string;
    badgeLarge?: string;
    badgeValue?: string;
    badgeLabel?: string;
  };
}

/**
 * StatBadge - White box with colored shadow for displaying statistics
 *
 * A reusable component for displaying key statistics with the Log festival theme.
 * Supports both static and animated variants.
 *
 * @example
 * ```tsx
 * <StatBadge value="1,234" label="Posts Read" animated delay={0.5} />
 * <StatBadge value="42h" label="Reading Time" interactive rotation={-2} />
 * ```
 */
export default function StatBadge({
  value,
  label,
  large = false,
  animated = false,
  delay = 0,
  interactive = false,
  rotation,
  className,
  style,
  motionProps,
  customStyles,
}: StatBadgeProps): ReactElement {
  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    badge: customStyles?.badge ?? styles.badge,
    badgeLarge: customStyles?.badgeLarge ?? styles.badgeLarge,
    badgeValue: customStyles?.badgeValue ?? styles.badgeValue,
    badgeLabel: customStyles?.badgeLabel ?? styles.badgeLabel,
  };

  const badgeClass = `${s.badge} ${large ? s.badgeLarge : ''} ${
    className || ''
  }`;

  const customStyle: React.CSSProperties = {
    ...style,
    ...(rotation !== undefined && { transform: `rotate(${rotation}deg)` }),
  };

  // Static rendering
  if (!animated) {
    return (
      <div className={badgeClass} style={customStyle}>
        <span className={s.badgeValue}>{value}</span>
        <span className={s.badgeLabel}>{label}</span>
      </div>
    );
  }

  // Animated rendering
  const hoverProps = interactive
    ? {
        whileHover: { scale: 1.05, rotate: rotation ?? -2 },
        whileTap: { scale: 0.95 },
      }
    : {};

  return (
    <motion.div
      className={badgeClass}
      style={customStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      {...hoverProps}
      {...motionProps}
    >
      <span className={styles.badgeValue}>{value}</span>
      <span className={styles.badgeLabel}>{label}</span>
    </motion.div>
  );
}

interface StatBadgeGroupProps {
  /** Array of badge configurations */
  badges: Array<Omit<StatBadgeProps, 'animated' | 'delay' | 'customStyles'>>;
  /** Whether to animate the badge group */
  animated?: boolean;
  /** Base delay for animation */
  baseDelay?: number;
  /** Delay between each badge animation */
  staggerDelay?: number;
  /** Additional CSS class name for the container */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    statsBadges?: string;
    badge?: string;
    badgeLarge?: string;
    badgeValue?: string;
    badgeLabel?: string;
  };
}

/**
 * StatBadgeGroup - Container for multiple stat badges with consistent spacing
 *
 * @example
 * ```tsx
 * <StatBadgeGroup
 *   badges={[
 *     { value: '42h', label: 'Reading' },
 *     { value: '365', label: 'Days Active' },
 *   ]}
 *   animated
 *   baseDelay={1.2}
 * />
 * ```
 */
export function StatBadgeGroup({
  badges,
  animated = false,
  baseDelay = 0,
  staggerDelay = 0.1,
  className,
  customStyles,
}: StatBadgeGroupProps): ReactElement {
  // Use custom styles if provided (for static cards), otherwise use default styles
  const containerStyle = customStyles?.statsBadges ?? styles.statsBadges;
  const containerClass = `${containerStyle} ${className || ''}`;

  // Extract badge-specific custom styles to pass to individual badges
  const badgeCustomStyles = customStyles
    ? {
        badge: customStyles.badge,
        badgeLarge: customStyles.badgeLarge,
        badgeValue: customStyles.badgeValue,
        badgeLabel: customStyles.badgeLabel,
      }
    : undefined;

  if (!animated) {
    return (
      <div className={containerClass}>
        {badges.map((badge, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <StatBadge key={index} {...badge} customStyles={badgeCustomStyles} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: baseDelay }}
    >
      {badges.map((badge, index) => (
        <StatBadge
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          {...badge}
          animated
          delay={baseDelay + index * staggerDelay}
        />
      ))}
    </motion.div>
  );
}
