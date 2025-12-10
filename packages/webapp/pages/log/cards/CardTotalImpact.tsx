import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import styles from '../Log.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

export default function CardTotalImpact({
  data,
  isActive,
}: CardProps): ReactElement {
  const animatedPosts = useAnimatedNumber(data.totalPosts, {
    delay: 500,
    duration: 2000,
    enabled: isActive,
  });
  const animatedTime = useAnimatedNumber(data.totalReadingTime, {
    delay: 1100,
    enabled: isActive,
  });
  const animatedDays = useAnimatedNumber(data.daysActive, {
    delay: 1300,
    enabled: isActive,
  });

  return (
    <>
      {/* Main headline with staggered reveal */}
      <div className={styles.headlineStack}>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, y: 30, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.headlineSmall}>You read</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          <motion.span
            className={styles.headlineBig}
            transition={{ duration: 0.3 }}
          >
            {animatedPosts.toLocaleString()}
          </motion.span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0, y: 30, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
        >
          <span className={styles.headlineMedium}>POSTS</span>
        </motion.div>
        <motion.div
          className={styles.headlineRow}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className={styles.headlineAccent}>this year</span>
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div
        className={styles.divider}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className={styles.dividerLine} />
        <motion.div
          className={styles.dividerIcon}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        >
          ◆
        </motion.div>
        <div className={styles.dividerLine} />
      </motion.div>

      {/* Secondary stats with bounce in */}
      <motion.div
        className={styles.statsBadges}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          className={styles.badge}
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.badgeValue}>{animatedTime}h</span>
          <span className={styles.badgeLabel}>Reading</span>
        </motion.div>
        <motion.div
          className={styles.badge}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={styles.badgeValue}>{animatedDays}</span>
          <span className={styles.badgeLabel}>Days Active</span>
        </motion.div>
      </motion.div>

      {/* Competitive stat banner with slide in */}
      <motion.div
        className={styles.celebrationBanner}
        initial={{ opacity: 0, x: -100, rotate: -5 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 100 }}
      >
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>Top</span>
          <motion.span
            className={styles.bannerMain}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.7, type: 'spring', stiffness: 200 }}
          >
            {data.totalImpactPercentile}%
          </motion.span>
          <span className={styles.bannerPost}>of devs</span>
        </div>
      </motion.div>

      {/* Share button */}
      <ShareStatButton
        delay={3}
        isActive={isActive}
        statText={`I read ${data.totalPosts.toLocaleString()} posts on daily.dev this year — that's ${data.totalReadingTime} hours of learning! 📚\n\nTOP ${data.totalImpactPercentile}% of developers`}
      />
    </>
  );
}
