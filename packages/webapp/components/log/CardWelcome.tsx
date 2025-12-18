import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { LogData } from '../../types/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
  isLoading?: boolean;
  cardType?: string;
  imageCache?: Map<string, Blob>;
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

// Animation timing constants (in seconds, relative to mount)
const TITLE_START = 0.2;
const TAGLINE_DELAY = 1.0;
const INSTRUCTIONS_DELAY = 1.6;
const CTA_DELAY = 2.2;

export default function CardWelcome({
  isTouchDevice,
  isLoading,
}: CardProps): ReactElement {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Before mount, hide elements that should animate in
  const hidden = { opacity: 0, y: 20 };
  const visible = { opacity: 1, y: 0 };

  return (
    <div className={styles.cardContent}>
      {/* Main headline - appears first */}
      <div className={styles.headlineStack}>
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
            delay: TITLE_START + 0.2,
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
            delay: TITLE_START + 0.4,
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
        className={cardStyles.welcomeTagline}
        initial={hidden}
        animate={isMounted ? visible : hidden}
        transition={{ delay: TAGLINE_DELAY, duration: 0.5 }}
      >
        Discover what kind of developer you really are.
      </motion.p>

      {/* Navigation instructions - appears after tagline (fade only) */}
      <motion.p
        className={cardStyles.welcomeInstructions}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: INSTRUCTIONS_DELAY, duration: 0.5 }}
      >
        {isTouchDevice ? 'Tap' : 'Click'} the sides to navigate
        <span className={cardStyles.instructionHint}>
          👈 back · next 👉
        </span>
      </motion.p>

      {/* CTA prompt - appears last (fade only) */}
      <motion.div
        className={cardStyles.welcomeCta}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMounted ? 1 : 0 }}
        transition={{ delay: CTA_DELAY, duration: 0.5 }}
      >
        {/* Loading state */}
        <div
          className={cardStyles.loadingState}
          style={{
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? 'auto' : 'none',
          }}
        >
          <div className={cardStyles.loadingSpinner} />
          <span className={cardStyles.loadingText}>
            Preparing your year in review...
          </span>
        </div>

        {/* Ready state */}
        <motion.div
          className={cardStyles.readyState}
          style={{
            opacity: isLoading ? 0 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
          }}
          animate={!isLoading && isMounted ? { x: [0, 10, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <span className={cardStyles.ctaText}>
            {isTouchDevice ? 'Tap ' : 'Click '} right to begin{' '}
            <ArrowIcon size={IconSize.XSmall} className={cardStyles.ctaArrow} />
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
