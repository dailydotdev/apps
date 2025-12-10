import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { LogData } from '../types';
import { ARCHETYPES } from '../types';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

export default function CardShare({
  data,
  cardNumber,
  cardLabel,
}: CardProps): ReactElement {
  const archetype = ARCHETYPES[data.archetype];

  const shareText = `I'm a ${archetype.name.toUpperCase()} ${archetype.emoji} on daily.dev

📚 ${data.totalPosts.toLocaleString()} posts read
🔥 ${data.records.find((r) => r.type === 'streak')?.value || 'Epic'} streak
⚡ ${data.archetypeStat}

What's your developer archetype?
→ app.daily.dev/log`;

  const handleShare = useCallback(
    async (platform: 'twitter' | 'linkedin' | 'copy' | 'download') => {
      const url = 'https://app.daily.dev/log';

      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
            '_blank',
          );
          break;
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank',
          );
          break;
        case 'copy':
          try {
            await navigator.clipboard.writeText(shareText);
            // Could add toast notification here
          } catch {
            // Fallback for older browsers
          }
          break;
        case 'download':
          // TODO: Implement image generation and download
          break;
      }
    },
    [shareText],
  );

  return (
    <>
      {/* Card indicator */}
      <div className={styles.cardIndicator}>
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </div>

      <div className={styles.shareCard}>
        <h2 className={styles.shareHeader}>Time to flex.</h2>

        {/* Preview card */}
        <div className={styles.sharePreview}>
          <div className={styles.shareArchetype}>
            {archetype.emoji} {archetype.name.toUpperCase()}
          </div>

          <div className={styles.shareStats}>
            <div className={styles.shareStat}>
              <div className={styles.shareStatValue}>
                {data.totalPosts.toLocaleString()}
              </div>
              <div className={styles.shareStatLabel}>Posts</div>
            </div>
            <div className={styles.shareStat}>
              <div className={styles.shareStatValue}>
                {data.records.find((r) => r.type === 'streak')?.value || '—'}
              </div>
              <div className={styles.shareStatLabel}>Streak</div>
            </div>
            <div className={styles.shareStat}>
              <div className={styles.shareStatValue}>
                #{data.globalRank.toLocaleString()}
              </div>
              <div className={styles.shareStatLabel}>Rank</div>
            </div>
          </div>
        </div>

        {/* Share buttons */}
        <div className={styles.shareButtons}>
          <button
            type="button"
            className={styles.shareButton}
            onClick={() => handleShare('linkedin')}
          >
            LinkedIn
          </button>
          <button
            type="button"
            className={styles.shareButton}
            onClick={() => handleShare('twitter')}
          >
            Twitter/X
          </button>
          <button
            type="button"
            className={styles.shareButton}
            onClick={() => handleShare('copy')}
          >
            Copy Link
          </button>
          <button
            type="button"
            className={styles.shareButton}
            onClick={() => handleShare('download')}
          >
            Download
          </button>
        </div>

        {/* Social proof */}
        <p className={styles.socialProof}>
          <strong>{data.shareCount.toLocaleString()}</strong> developers have
          shared their Log
        </p>
      </div>
    </>
  );
}
