import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import type { LogData } from '../../types/log';
import { ARCHETYPES } from '../../types/log';
import { useShareLogImage } from '../../hooks/log/useShareLogImage';
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
  const { shareImage } = useShareLogImage();
  const [isLoading, setIsLoading] = useState(false);

  const archetype = ARCHETYPES[data.archetype];
  const streakRecord = data.records.find((r) => r.type === 'streak');

  const shareUrl = 'https://app.daily.dev/log';
  const shareText = `I'm a ${archetype.name.toUpperCase()} ${
    archetype.emoji
  } on daily.dev

📚 ${data.totalPosts.toLocaleString()} posts read
🔥 ${streakRecord?.value || 'Epic streak'}
⚡ ${data.archetypeStat}

What's your developer archetype?
→ app.daily.dev/log`;

  /**
   * Fetch the share image from the API.
   */
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

  /**
   * Fall back to text-only sharing.
   */
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

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Ignore clipboard errors
    }
  }, [shareText]);

  const handleShare = useCallback(async () => {
    // Track share event
    onShare?.();

    if (isLoading) {
      return;
    }

    // If no cardType provided or user not authenticated, fall back to text share
    if (!cardType || !user?.id) {
      await shareTextOnly();
      return;
    }

    // Check if image is in cache
    let blob = imageCache?.get(cardType) ?? null;

    // If not cached, fetch on demand
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

    // If we have the image, share it
    if (blob) {
      const filename = `daily-log-2025-${cardType}.png`;

      const result = await shareImage(blob, filename, shareText);

      // If sharing failed or was cancelled, don't fall back to text
      if (result === 'error') {
        await shareTextOnly();
      }
    } else {
      // Fall back to text-only share if image fetch failed
      await shareTextOnly();
    }
  }, [
    onShare,
    isLoading,
    cardType,
    user?.id,
    imageCache,
    fetchShareImage,
    shareImage,
    shareText,
    shareTextOnly,
    onImageFetched,
  ]);

  return (
    <>
      <div className={cardStyles.shareWrapContainer}>
        {/* Header */}
        <motion.div
          className={cardStyles.shareWrapHeader}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className={cardStyles.shareWrapLabel}>THAT&apos;S</span>
          <span className={cardStyles.shareWrapTitle}>A WRAP</span>
          <span className={cardStyles.shareWrapYear}>— 2025 —</span>
        </motion.div>

        {/* Archetype Display - Gentle, organic layout */}
        <motion.div
          className={cardStyles.shareArchetypeContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {/* Archetype image with soft glow */}
          <motion.div
            className={cardStyles.shareArchetypeImageWrap}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 150 }}
          >
            <img
              src={archetype.imageUrl}
              alt={archetype.name}
              className={cardStyles.shareArchetypeImage}
            />
          </motion.div>

          {/* Archetype name */}
          <motion.div
            className={cardStyles.shareArchetypeName}
            style={{ color: archetype.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {archetype.name.toUpperCase()}
          </motion.div>

          {/* Stats - Gentle, flowing layout */}
          <motion.div
            className={cardStyles.shareStatsFlow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className={cardStyles.shareStatItem}>
              <span className={cardStyles.shareStatValue}>
                {data.totalPosts.toLocaleString()}
              </span>
              <span className={cardStyles.shareStatLabel}>posts</span>
            </div>
            <span className={cardStyles.shareStatDot}>•</span>
            <div className={cardStyles.shareStatItem}>
              <span className={cardStyles.shareStatValue}>
                {streakRecord?.value || '—'}
              </span>
              <span className={cardStyles.shareStatLabel}>streak</span>
            </div>
            <span className={cardStyles.shareStatDot}>•</span>
            <div className={cardStyles.shareStatItem}>
              <span className={cardStyles.shareStatValue}>
                {data.daysActive}
              </span>
              <span className={cardStyles.shareStatLabel}>days</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Thank you message */}
        <motion.div
          className={cardStyles.shareThankYou}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <p className={cardStyles.shareThankYouText}>
            Thanks for an incredible 2025.
          </p>
          <p className={cardStyles.shareThankYouSubtext}>
            Can&apos;t wait to see what you&apos;ll read in 2026 🚀
          </p>
        </motion.div>

        {/* Share button */}
        <motion.div
          className={cardStyles.shareWrapButtons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
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
      </div>
    </>
  );
}
