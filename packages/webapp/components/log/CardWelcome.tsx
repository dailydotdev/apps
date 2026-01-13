import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import styles from './Log.module.css';
import type { BaseCardProps } from './types';

// Animation timing constants (in seconds, relative to mount)
const NAME_START = 0.2;
const TITLE_START = 0.5;
const TAGLINE_DELAY = 1.3;
const INSTRUCTIONS_DELAY = 1.9;
const CTA_DELAY = 2.5;

export default function CardWelcome({
  isTouchDevice,
  isLoading,
}: BaseCardProps): ReactElement {
  const { user } = useAuthContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get the user's first name (or username as fallback)
  const displayName = user?.name?.split(' ')[0] || user?.username || 'Dev';

  // Before mount, hide elements that should animate in
  const hidden = { opacity: 0, y: 20 };
  const visible = { opacity: 1, y: 0 };

  return (
    <div className={styles.cardContent}>
      {/* Main headline - appears first */}
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
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{ delay: TITLE_START, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.headlineSmall}>Welcome to</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={hidden}
          animate={isMounted ? visible : hidden}
          transition={{
            delay: TITLE_START + 0.15,
            type: 'spring',
            stiffness: 100,
          }}
        >
          <span className={styles.headlineMedium}>LOG</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{
            delay: TITLE_START + 0.3,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <span className={styles.headlineBig}>2025</span>
        </motion.div>
      </div>

      {/* Tagline - appears after title */}
      <motion.p
        className={styles.welcomeTagline}
        initial={hidden}
        animate={isMounted ? visible : hidden}
        transition={{ delay: TAGLINE_DELAY, duration: 0.5 }}
      >
        Discover your developer archetype.
      </motion.p>

      {/* Navigation instructions - appears after tagline (fade only) */}
      <motion.p
        className={styles.welcomeInstructions}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: INSTRUCTIONS_DELAY, duration: 0.5 }}
      >
        <span className={styles.instructionHint}>
          🔊 Turn on sound for the full experience
        </span>
        {isTouchDevice ? 'Tap' : 'Click'} the sides to navigate
        <span className={styles.instructionHint}>👈 back · next 👉</span>
      </motion.p>

      {/* CTA prompt - appears last (fade only) */}
      <motion.div
        className={styles.welcomeCta}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: CTA_DELAY, duration: 0.5 }}
      >
        {/* Loading state */}
        <div
          className={styles.loadingState}
          style={{
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? 'auto' : 'none',
          }}
        >
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>
            Preparing your year in review...
          </span>
        </div>

        {/* Ready state */}
        <motion.div
          className={styles.readyState}
          style={{
            opacity: isLoading ? 0 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
          animate={!isLoading && isMounted ? { x: [0, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <span className={styles.ctaText}>
            {isTouchDevice ? 'Tap ' : 'Click '} right to begin{' '}
            <ArrowIcon size={IconSize.XSmall} className={styles.ctaArrow} />
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
