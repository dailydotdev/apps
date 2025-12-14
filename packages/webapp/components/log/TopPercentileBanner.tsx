import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { MotionProps } from 'framer-motion';
import { motion } from 'framer-motion';
import styles from './Log.module.css';

interface TopPercentileBannerProps {
  preText: ReactNode;
  mainText: ReactNode;
  postText: ReactNode;
  delay?: number;
  motionProps?: Omit<MotionProps, 'className'>;
}

export default function TopPercentileBanner({
  preText,
  mainText,
  postText,
  delay = 1.5,
  motionProps,
}: TopPercentileBannerProps): ReactElement {
  return (
    <motion.div
      className={styles.celebrationBanner}
      initial={{ opacity: 0, x: -100, rotate: -5 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      {...motionProps}
    >
      <div className={styles.bannerBg} />
      <div className={styles.bannerContent}>
        <span className={styles.bannerPre}>{preText}</span>
        <motion.span
          className={styles.bannerMain}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        >
          {mainText}
        </motion.span>
        <span className={styles.bannerPost}>{postText}</span>
      </div>
    </motion.div>
  );
}
