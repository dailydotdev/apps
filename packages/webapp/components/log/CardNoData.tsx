import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import styles from './Log.module.css';

// Animation timing constants (in seconds, relative to mount)
const NAME_START = 0.2;
const HEADLINE_START = 0.5;
const SUBTEXT_DELAY = 1.0;
const CTA_DELAY = 1.5;

/**
 * CardNoData - Displayed when user doesn't have enough 2025 data for their Log
 * Used for users who missed their 2025 window (feature launches early 2026)
 */
export default function CardNoData(): ReactElement {
  const { user } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get the user's first name (or username as fallback)
  const displayName = user?.name?.split(' ')[0] || user?.username || 'Dev';

  // Animation states
  const hidden = { opacity: 0, y: 20 };
  const visible = { opacity: 1, y: 0 };

  return (
    <div className={styles.cardContent}>
      {/* Main headline stack */}
      <div className={styles.headlineStack}>
        {/* Personalized greeting */}
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{ delay: NAME_START, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.welcomeName}>Hey {displayName}!</span>
        </motion.div>

        {/* Headline - acknowledges missed 2025 */}
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{ delay: HEADLINE_START, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.headlineMedium}>We missed you</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{
            delay: HEADLINE_START + 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <span className={styles.headlineBig}>in 2025</span>
        </motion.div>
      </div>

      {/* Encouraging subtext - pivots to 2026 */}
      <motion.p
        className={styles.welcomeTagline}
        initial={hidden}
        animate={isMounted ? visible : hidden}
        transition={{ delay: SUBTEXT_DELAY, duration: 0.5 }}
      >
        But 2026? That&apos;s YOUR year.
        <br />
        Start reading, start building your story.
      </motion.p>

      {/* CTA Button - links to feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: CTA_DELAY, duration: 0.5 }}
      >
        <Link href="/">
          <a className={styles.noDataCtaButton}>Let&apos;s go</a>
        </Link>
      </motion.div>
    </div>
  );
}
