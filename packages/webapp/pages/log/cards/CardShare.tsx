import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import { ARCHETYPES } from '../types';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

export default function CardShare({ data }: CardProps): ReactElement {
  const [copied, setCopied] = useState(false);
  const archetype = ARCHETYPES[data.archetype];

  const shareText = `I'm a ${archetype.name.toUpperCase()} ${
    archetype.emoji
  } on daily.dev

📚 ${data.totalPosts.toLocaleString()} posts read
🔥 ${data.records.find((r) => r.type === 'streak')?.value || 'Epic streak'}
⚡ ${data.archetypeStat}

What's your developer archetype?
→ app.daily.dev/log`;

  const handleShare = useCallback(
    async (platform: 'twitter' | 'linkedin' | 'copy' | 'download') => {
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
        case 'download':
          // TODO: Implement image generation
          break;
        default:
          // No action for unknown platform
          break;
      }
    },
    [shareText],
  );

  return (
    <>
      <div className={cardStyles.shareContainer}>
        {/* Header */}
        <motion.h2
          className={cardStyles.shareTitle}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Time to flex 💪
        </motion.h2>

        {/* Phone frame mockup */}
        <motion.div
          className={cardStyles.phoneFrame}
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
        >
          <div className={cardStyles.phoneNotch} />
          <div className={cardStyles.phoneScreen}>
            {/* Mini preview of share content */}
            <div className={cardStyles.previewContent}>
              <span className={cardStyles.previewLogo}>daily.dev</span>
              <span className={cardStyles.previewEmoji}>{archetype.emoji}</span>
              <span className={cardStyles.previewArchetype}>
                {archetype.name}
              </span>
              <div className={cardStyles.previewStats}>
                <span>📚 {data.totalPosts}</span>
                <span>
                  🔥{' '}
                  {data.records.find((r) => r.type === 'streak')?.value || '—'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          className={cardStyles.shareButtons}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.button
            className={`${cardStyles.shareButton} ${cardStyles.shareLinkedIn}`}
            onClick={() => handleShare('linkedin')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>LinkedIn</span>
          </motion.button>
          <motion.button
            className={`${cardStyles.shareButton} ${cardStyles.shareTwitter}`}
            onClick={() => handleShare('twitter')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Twitter/X</span>
          </motion.button>
          <motion.button
            className={`${cardStyles.shareButton} ${cardStyles.shareCopy}`}
            onClick={() => handleShare('copy')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{copied ? '✓ Copied!' : 'Copy'}</span>
          </motion.button>
          <motion.button
            className={`${cardStyles.shareButton} ${cardStyles.shareDownload}`}
            onClick={() => handleShare('download')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Download</span>
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className={cardStyles.socialProof}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            className={cardStyles.socialProofNumber}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
          >
            {data.shareCount.toLocaleString()}
          </motion.span>
          <span>developers have shared their Log</span>
        </motion.div>

        {/* Restart hint */}
        <motion.div
          className={cardStyles.restartHint}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span>Swipe back to revisit your journey</span>
        </motion.div>
      </div>
    </>
  );
}
