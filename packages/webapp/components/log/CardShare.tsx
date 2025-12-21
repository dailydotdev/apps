import type { ReactElement } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { LogData } from '../../types/log';
import { ARCHETYPES, RECORDS } from '../../types/log';
import { shareLogImage } from '../../hooks/log/shareLogImage';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
  onShare?: () => void;
  cardType?: string;
  imageCache?: Map<string, Blob>;
  onImageFetched?: (cardType: string, blob: Blob) => void;
}

export default function CardShare({
  data,
  onShare,
  cardType,
  imageCache,
  onImageFetched,
}: CardProps): ReactElement {
  const { user, tokenRefreshed } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const archetype = ARCHETYPES[data.archetype];

  // Calculate total interactions (upvotes + comments + bookmarks)
  const totalInteractions =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  // Find peak reading hour from heatmap
  const peakHour = useMemo(() => {
    let maxActivity = 0;
    let bestHour = 0;
    for (let hour = 0; hour < 24; hour += 1) {
      let hourTotal = 0;
      for (let day = 0; day < 7; day += 1) {
        hourTotal += data.activityHeatmap[day]?.[hour] ?? 0;
      }
      if (hourTotal > maxActivity) {
        maxActivity = hourTotal;
        bestHour = hour;
      }
    }
    // Format as 12-hour time
    const suffix = bestHour >= 12 ? 'PM' : 'AM';
    const displayHour = bestHour % 12 || 12;
    return `${displayHour}${suffix}`;
  }, [data.activityHeatmap]);

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

  const shareUrl = 'https://app.daily.dev/log';
  const shareText = `I'm a ${archetype.name.toUpperCase()} ${
    archetype.emoji
  } on daily.dev

📚 ${data.totalPosts.toLocaleString()} posts read
📅 ${data.daysActive} days active
⚡ ${data.archetypeStat}

What's your developer archetype?
→ app.daily.dev/log`;

  const fetchShareImage = useCallback(async (): Promise<Blob | null> => {
    if (!user?.id || !cardType || !tokenRefreshed) {
      return null;
    }

    try {
      const response = await fetch(
        `${apiUrl}/log/images?card=${encodeURIComponent(
          cardType,
        )}&userId=${encodeURIComponent(user.id)}`,
        {
          credentials: 'include',
        },
      );

      if (!response.ok) {
        return null;
      }

      return response.blob();
    } catch {
      return null;
    }
  }, [user?.id, cardType, tokenRefreshed]);

  const shareTextOnly = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Developer Log 2025',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error - fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Ignore clipboard errors
    }
  }, [shareText]);

  const handleShare = useCallback(async () => {
    onShare?.();

    if (isLoading) {
      return;
    }

    if (!cardType || !user?.id) {
      await shareTextOnly();
      return;
    }

    let blob = imageCache?.get(cardType) ?? null;

    if (!blob) {
      setIsLoading(true);
      try {
        blob = await fetchShareImage();
        if (blob && onImageFetched) {
          onImageFetched(cardType, blob);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (blob) {
      const filename = `daily-log-2025-${cardType}.png`;
      const result = await shareLogImage(blob, filename, shareText);
      if (result === 'error') {
        await shareTextOnly();
      }
    } else {
      await shareTextOnly();
    }
  }, [
    onShare,
    isLoading,
    cardType,
    user?.id,
    imageCache,
    fetchShareImage,
    shareText,
    shareTextOnly,
    onImageFetched,
  ]);

  return (
    <>
      <div className={styles.cardContent}>
        {/* Hero Header - "IT'S OFFICIAL" stamp */}
        <motion.div
          className={cardStyles.shareOfficialStamp}
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <span className={cardStyles.shareOfficialText}>
            That&apos;s a wrap
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.div
          className={cardStyles.shareMainHeadline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span className={cardStyles.shareYouAre}>YOU ARE</span>
          <span className={cardStyles.shareArchetypeTitle}>
            {archetype.name.toUpperCase()}
          </span>
        </motion.div>

        {/* Archetype Avatar with glow */}
        <motion.div
          className={cardStyles.shareAvatarWrapper}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 150 }}
        >
          <div
            className={cardStyles.shareAvatarGlow}
            style={{ background: archetype.color }}
          />
          <img
            src={archetype.imageUrl}
            alt={archetype.name}
            className={cardStyles.shareAvatarImage}
          />
          <motion.div
            className={cardStyles.shareAvatarRing}
            style={{ borderColor: archetype.color }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Archetype description */}
        <motion.p
          className={cardStyles.shareArchetypeDescription}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {archetype.description}
        </motion.p>

        {/* Receipt-style stats card - compact version */}
        <motion.div
          className={cardStyles.shareReceiptCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>📚 POSTS READ</span>
            <span className={cardStyles.shareReceiptValue}>
              {data.totalPosts.toLocaleString()}
            </span>
          </div>

          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>📅 DAYS ACTIVE</span>
            <span className={cardStyles.shareReceiptValue}>
              {data.daysActive}
            </span>
          </div>

          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>🕐 PEAK HOUR</span>
            <span className={cardStyles.shareReceiptValue}>{peakHour}</span>
          </div>

          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>
              🏷️ TOPICS EXPLORED
            </span>
            <span className={cardStyles.shareReceiptValue}>
              {data.uniqueTopics}
            </span>
          </div>

          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>
              📰 SOURCES READ
            </span>
            <span className={cardStyles.shareReceiptValue}>
              {data.uniqueSources}
            </span>
          </div>

          <div className={cardStyles.shareReceiptRow}>
            <span className={cardStyles.shareReceiptLabel}>
              💬 INTERACTIONS
            </span>
            <span className={cardStyles.shareReceiptValue}>
              {totalInteractions.toLocaleString()}
            </span>
          </div>

          {bestRecord && (
            <div className={cardStyles.shareReceiptRow}>
              <span className={cardStyles.shareReceiptLabel}>
                {RECORDS[bestRecord.type].emoji}{' '}
                {bestRecord.label.toUpperCase()}
              </span>
              <span className={cardStyles.shareReceiptValue}>
                {bestRecord.value}
              </span>
            </div>
          )}

          <div className={cardStyles.shareReceiptFooter}>
            <span className={cardStyles.shareReceiptRank}>
              TOP {data.archetypePercentile}% OF DEVS
            </span>
          </div>
        </motion.div>
      </div>

      {/* Share button */}
      <motion.div
        className={cardStyles.shareWrapButtons}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <motion.button
          className={`${cardStyles.shareWrapButton} ${cardStyles.shareWrapButtonPrimary}`}
          onClick={handleShare}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.05, rotate: 0 } : undefined}
          whileTap={!isLoading ? { scale: 0.98, rotate: 1 } : undefined}
          style={isLoading ? { opacity: 0.7, cursor: 'wait' } : undefined}
        >
          <span className={cardStyles.shareWrapButtonIcon}>
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
