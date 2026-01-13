import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../Log.module.css';

/**
 * HeadlineRow represents a single line in the headline stack
 */
export interface HeadlineRowConfig {
  /** The text content to display */
  content: ReactNode;
  /** Style variant for the row */
  variant: 'small' | 'big' | 'medium' | 'accent';
  /** Animation delay in seconds */
  delay?: number;
}

/**
 * Animation variants for each headline style
 */
const animationVariants = {
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

/**
 * Default spring transition for headline animations
 */
const springTransition = {
  type: 'spring' as const,
  stiffness: 100,
};

/**
 * Map variant to CSS class name
 */
const variantClassMap = {
  small: 'headlineSmall',
  big: 'headlineBig',
  medium: 'headlineMedium',
  accent: 'headlineAccent',
} as const;

interface HeadlineStackProps {
  /** Array of headline rows to render */
  rows: HeadlineRowConfig[];
  /** Whether to animate the headlines (set false for static image generation) */
  animated?: boolean;
  /** Base delay before starting animations */
  baseDelay?: number;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles object for static cards using different CSS modules */
  customStyles?: {
    headlineStack?: string;
    headlineRow?: string;
    headlineSmall?: string;
    headlineBig?: string;
    headlineMedium?: string;
    headlineAccent?: string;
  };
}

/**
 * HeadlineStack - Reusable stacked headline component for Log cards
 *
 * Renders a stack of text elements with consistent styling and optional
 * staggered animations. Used across multiple Log cards for consistent
 * headline presentation.
 *
 * @example
 * ```tsx
 * <HeadlineStack
 *   rows={[
 *     { content: 'You read', variant: 'small', delay: 0.3 },
 *     { content: '1,234', variant: 'big', delay: 0.5 },
 *     { content: 'POSTS', variant: 'medium', delay: 0.7 },
 *     { content: 'this year', variant: 'accent', delay: 0.9 },
 *   ]}
 *   animated
 * />
 * ```
 */
export default function HeadlineStack({
  rows,
  animated = true,
  baseDelay = 0,
  className,
  customStyles,
}: HeadlineStackProps): ReactElement {
  // Map variant names to custom style class names
  const customStyleMap = {
    small: 'headlineSmall',
    big: 'headlineBig',
    medium: 'headlineMedium',
    accent: 'headlineAccent',
  } as const;

  // Use custom styles if provided (for static cards), otherwise use default styles
  const s = {
    headlineStack: customStyles?.headlineStack ?? styles.headlineStack,
    headlineRow: customStyles?.headlineRow ?? styles.headlineRow,
  };

  const getVariantClass = (variant: HeadlineRowConfig['variant']) => {
    const customKey = customStyleMap[variant];
    return customStyles?.[customKey] ?? styles[variantClassMap[variant]];
  };

  return (
    <div className={`${s.headlineStack} ${className || ''}`}>
      {rows.map((row, index) => {
        const variantAnimation = animationVariants[row.variant];
        const delay = baseDelay + (row.delay ?? index * 0.2);
        const styleClass = getVariantClass(row.variant);

        if (!animated) {
          // Static rendering for image generation
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} className={s.headlineRow}>
              <span className={styleClass}>{row.content}</span>
            </div>
          );
        }

        // Animated rendering for interactive cards
        return (
          <motion.div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={styles.headlineRow}
            initial={variantAnimation.initial}
            animate={variantAnimation.animate}
            transition={{
              delay,
              ...springTransition,
              ...(row.variant === 'big' && {
                stiffness: 200,
                damping: 15,
              }),
            }}
          >
            <span className={styleClass}>{row.content}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Simplified headline for single-line headers
 */
interface SimpleHeadlineProps {
  /** Text content */
  children: ReactNode;
  /** Whether to animate */
  animated?: boolean;
  /** Animation delay in seconds */
  delay?: number;
  /** Additional CSS class name */
  className?: string;
}

export function SimpleHeadline({
  children,
  animated = true,
  delay = 0.2,
  className,
}: SimpleHeadlineProps): ReactElement {
  if (!animated) {
    return (
      <div className={`${styles.headlineStack} ${className || ''}`}>
        <span className={styles.headlineSmall}>{children}</span>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.headlineStack} ${className || ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <span className={styles.headlineSmall}>{children}</span>
    </motion.div>
  );
}
