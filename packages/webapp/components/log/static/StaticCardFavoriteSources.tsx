import type { ReactElement } from 'react';
import React from 'react';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<
    LogData,
    'topSources' | 'uniqueSources' | 'sourcePercentile' | 'sourceLoyaltyName'
  >;
}

const PODIUM_MEDALS = ['🥈', '🥇', '🥉'];
const PODIUM_HEIGHTS = [180, 240, 140]; // 2nd, 1st, 3rd place bar heights

/**
 * Static Favorite Sources card for share image generation.
 * Shows podium-style top 3 sources with proper height alignment.
 */
export default function StaticCardFavoriteSources({
  data,
}: StaticCardProps): ReactElement {
  // Reorder for podium display: [2nd, 1st, 3rd]
  const podiumOrder = [
    data.topSources[1],
    data.topSources[0],
    data.topSources[2],
  ];

  return (
    <>
      {/* Header */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>Your favorite trio</span>
      </div>

      {/* Podium */}
      <div className={styles.podiumStage}>
        {podiumOrder.map((source, index) => {
          const rankMap = [2, 1, 3];
          const rank = rankMap[index];
          const height = PODIUM_HEIGHTS[index];
          const isFirst = index === 1;

          return (
            <div key={source.name} className={styles.podiumColumn}>
              {/* Medal */}
              <div className={styles.podiumMedal}>{PODIUM_MEDALS[index]}</div>

              {/* Source info above bar */}
              <div className={styles.podiumSource}>
                {source.logoUrl && (
                  <img
                    src={source.logoUrl}
                    alt={source.name}
                    className={styles.podiumSourceLogo}
                  />
                )}
                <span className={styles.podiumSourceName}>{source.name}</span>
              </div>

              {/* Bar */}
              <div
                className={`${styles.podiumBar} ${
                  isFirst ? styles.podiumBarFirst : ''
                }`}
                style={{ height }}
              >
                <span className={styles.podiumRank}>{rank}</span>
                <span className={styles.podiumCount}>
                  {source.postsRead} posts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discovery stat */}
      <div className={styles.discoveryBadge}>
        <div className={styles.discoveryIcon}>
          <EarthIcon />
        </div>
        <div className={styles.discoveryContent}>
          <span className={styles.discoveryValue}>{data.uniqueSources}</span>
          <span className={styles.discoveryLabel}>sources read</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>TOP</span>
          <span className={styles.bannerMain}>{data.sourcePercentile}%</span>
          <span className={styles.bannerPost}>EXPLORER</span>
        </div>
      </div>
    </>
  );
}
