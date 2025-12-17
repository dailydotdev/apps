import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';
import type { LogData } from '../../types/log';
import { ARCHETYPES } from '../../types/log';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
  onShare?: () => void;
}

export default function CardShare({ data, onShare }: CardProps): ReactElement {
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

  const handleShare = useCallback(async () => {
    // Track share event
    onShare?.();

    // Try Web Share API first
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
  }, [shareText, onShare]);

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
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.98, rotate: 1 }}
          >
            <span className={cardStyles.shareWrapButtonIcon}>
              <ShareIcon secondary />
            </span>
            <span>Share Your Log</span>
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
