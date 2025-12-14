import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../../types/log';
import { ARCHETYPES } from '../../types/log';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

export default function CardShare({ data }: CardProps): ReactElement {
  const [copied, setCopied] = useState(false);
  const archetype = ARCHETYPES[data.archetype];
  const streakRecord = data.records.find((r) => r.type === 'streak');

  const shareText = `I'm a ${archetype.name.toUpperCase()} ${
    archetype.emoji
  } on daily.dev

📚 ${data.totalPosts.toLocaleString()} posts read
🔥 ${streakRecord?.value || 'Epic streak'}
⚡ ${data.archetypeStat}

What's your developer archetype?
→ app.daily.dev/log`;

  const handleShare = useCallback(
    async (platform: 'twitter' | 'linkedin' | 'copy') => {
      const url = 'https://app.daily.dev/log';

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              shareText,
            )}`,
            '_blank',
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url,
            )}`,
            '_blank',
          );
          break;
        case 'copy':
          try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Fallback
          }
          break;
        default:
          break;
      }
    },
    [shareText],
  );

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

        {/* Share buttons */}
        <motion.div
          className={cardStyles.shareWrapButtons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <motion.button
            className={`${cardStyles.shareWrapButton} ${cardStyles.shareWrapButtonPrimary}`}
            onClick={() => handleShare('twitter')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className={cardStyles.shareWrapButtonIcon}>𝕏</span>
            <span>Share on X</span>
          </motion.button>
          <motion.button
            className={`${cardStyles.shareWrapButton} ${cardStyles.shareWrapButtonLinkedIn}`}
            onClick={() => handleShare('linkedin')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className={cardStyles.shareWrapButtonIcon}>in</span>
            <span>LinkedIn</span>
          </motion.button>
          <motion.button
            className={`${cardStyles.shareWrapButton} ${cardStyles.shareWrapButtonCopy}`}
            onClick={() => handleShare('copy')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className={cardStyles.shareWrapButtonIcon}>
              {copied ? '✓' : '📋'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </motion.button>
        </motion.div>

        {/* Swipe back hint */}
        <motion.div
          className={cardStyles.shareSwipeHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.span
            className={cardStyles.shareSwipeArrow}
            animate={{ x: [-3, 3, -3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ←
          </motion.span>
          <span>Swipe back to revisit your journey</span>
        </motion.div>
      </div>
    </>
  );
}
