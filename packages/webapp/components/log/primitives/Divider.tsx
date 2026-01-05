import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../Log.module.css';

interface DividerProps {
  /** Whether to animate the divider (set false for static image generation) */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Icon to display in center (default: ◆) */
  icon?: ReactNode;
  /** Whether to spin the icon continuously */
  spinIcon?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    divider?: string;
    dividerLine?: string;
    dividerIcon?: string;
  };
}

/**
 * Divider - Decorative divider with centered icon for Log cards
 *
 * Supports both animated (interactive cards) and static (image generation) modes.
 * The icon spins continuously in animated mode by default.
 *
 * @example
 * ```tsx
 * // Interactive card (animated with spinning icon)
 * <Divider animated delay={1.1} />
 *
 * // Static card (no animation)
 * <Divider animated={false} customStyles={staticStyles} />
 *
 * // Custom icon
 * <Divider icon="★" spinIcon={false} />
 * ```
 */
export default function Divider({
  animated = true,
  delay = 1.1,
  icon = '◆',
  spinIcon = true,
  className,
  customStyles,
}: DividerProps): ReactElement {
  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    divider: customStyles?.divider ?? styles.divider,
    dividerLine: customStyles?.dividerLine ?? styles.dividerLine,
    dividerIcon: customStyles?.dividerIcon ?? styles.dividerIcon,
  };

  const containerClass = className ? `${s.divider} ${className}` : s.divider;

  // Static rendering for image generation
  if (!animated) {
    return (
      <div className={containerClass}>
        <div className={s.dividerLine} />
        <div className={s.dividerIcon}>{icon}</div>
        <div className={s.dividerLine} />
      </div>
    );
  }

  // Animated rendering for interactive cards
  return (
    <motion.div
      className={containerClass}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className={s.dividerLine} />
      {spinIcon ? (
        <motion.div
          className={s.dividerIcon}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      ) : (
        <div className={s.dividerIcon}>{icon}</div>
      )}
      <div className={s.dividerLine} />
    </motion.div>
  );
}
