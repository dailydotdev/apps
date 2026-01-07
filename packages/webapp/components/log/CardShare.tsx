import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { ARCHETYPES, RECORDS } from '../../types/log';
import { shareLog } from '../../hooks/log/shareLogImage';
import styles from './Log.module.css';
import type { ShareableCardProps } from './types';
import { usePeakReadingHour } from '../../hooks/log/useLogStats';

export default function CardShare({
  data,
  onShare,
  cardType,
  imageCache,
  onImageFetched,
}: ShareableCardProps): ReactElement {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [isLoading, setIsLoading] = useState(false);

  const archetype = ARCHETYPES[data.archetype];

  // Calculate total interactions (upvotes + comments + bookmarks)
  const totalInteractions =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  const { formatted: peakHour } = usePeakReadingHour(data.activityHeatmap);

  // Get the best record (prefer one with a percentile, or first available)
  const bestRecord = useMemo(() => {
    if (!data.records.length) {
      return null;
    }
    // Pick the record with best percentile, or first one
    const withPercentile = data.records.filter((r) => r.percentile != null);
    if (withPercentile.length > 0) {
      return withPercentile.reduce((best, curr) =>
        (curr.percentile ?? 100) < (best.percentile ?? 100) ? curr : best,
      );
    }
    return data.records[0];
  }, [data.records]);

  const shareText = `my 2025 on daily.dev`;

  const handleShare = useCallback(async () => {
    onShare?.();

    if (isLoading || !user?.id || !cardType) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await shareLog({
        userId: user.id,
        cardType,
        shareText,
        imageCache,
        onImageFetched,
      });

      if (result === 'image_failed') {
        displayToast(
          'Image generator returned 500. Time for a manual screenshot! 📸',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    onShare,
    isLoading,
    user?.id,
    cardType,
    imageCache,
    onImageFetched,
    displayToast,
    shareText,
  ]);

  return (
    <>
      <div className={styles.cardContent}>
        {/* Hero Header - "IT'S OFFICIAL" stamp */}
        <motion.div
          className={styles.shareOfficialStamp}
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <span className={styles.shareOfficialText}>That&apos;s a wrap</span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          className={styles.shareMainHeadline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className={styles.shareYouAre}>YOU ARE</span>
          <span className={styles.shareArchetypeTitle}>
            {archetype.name.toUpperCase()}
          </span>
        </motion.div>

        {/* Archetype Avatar with glow */}
        <motion.div
          className={styles.shareAvatarWrapper}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
        >
          <div
            className={styles.shareAvatarGlow}
            style={{ background: archetype.color }}
          />
          <img
            src={archetype.imageUrl}
            alt={archetype.name}
            className={styles.shareAvatarImage}
          />
          <motion.div
            className={styles.shareAvatarRing}
            style={{ borderColor: archetype.color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Archetype description */}
        <motion.p
          className={styles.shareArchetypeDescription}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {archetype.description}
        </motion.p>

        {/* Receipt-style stats card - compact version */}
        <motion.div
          className={styles.shareReceiptCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>📚 POSTS READ</span>
            <span className={styles.shareReceiptValue}>
              {data.totalPosts.toLocaleString()}
            </span>
          </div>

          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>📅 DAYS ACTIVE</span>
            <span className={styles.shareReceiptValue}>{data.daysActive}</span>
          </div>

          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>🕐 PEAK HOUR</span>
            <span className={styles.shareReceiptValue}>{peakHour}</span>
          </div>

          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>🏷️ TOPICS EXPLORED</span>
            <span className={styles.shareReceiptValue}>
              {data.uniqueTopics}
            </span>
          </div>

          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>📰 SOURCES READ</span>
            <span className={styles.shareReceiptValue}>
              {data.uniqueSources}
            </span>
          </div>

          <div className={styles.shareReceiptRow}>
            <span className={styles.shareReceiptLabel}>💬 INTERACTIONS</span>
            <span className={styles.shareReceiptValue}>
              {totalInteractions.toLocaleString()}
            </span>
          </div>

          {bestRecord && (
            <div className={styles.shareReceiptRow}>
              <span className={styles.shareReceiptLabel}>
                {RECORDS[bestRecord.type].emoji}{' '}
                {bestRecord.label.toUpperCase()}
              </span>
              <span className={styles.shareReceiptValue}>
                {bestRecord.value}
              </span>
            </div>
          )}

          <div className={styles.shareReceiptFooter}>
            <span className={styles.shareReceiptRank}>
              TOP {data.archetypePercentile}% OF DEVS
            </span>
          </div>
        </motion.div>
      </div>

      {/* Share button */}
      <motion.div
        className={styles.shareWrapButtons}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <motion.button
          className={`${styles.shareWrapButton} ${styles.shareWrapButtonPrimary}`}
          onClick={handleShare}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.05, rotate: 0 } : undefined}
          whileTap={!isLoading ? { scale: 0.98, rotate: 1 } : undefined}
          style={isLoading ? { opacity: 0.7, cursor: 'wait' } : undefined}
        >
          <span className={styles.shareWrapButtonIcon}>
            {isLoading ? (
              <Loader innerClassName="before:!border-pepper-90 after:!border-t-pepper-90 !w-4 !h-4" />
            ) : (
              <ShareIcon secondary />
            )}
          </span>
          <span>{isLoading ? 'Loading...' : 'Share Your Log'}</span>
        </motion.button>
      </motion.div>
    </>
  );
}
