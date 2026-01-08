import type { ReactElement } from 'react';
import React from 'react';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';
import {
  SimpleHeadline,
  Podium,
  shouldShowPercentileBanner,
} from '../primitives';
import TopPercentileBanner from '../TopPercentileBanner';

interface StaticCardProps {
  data: Pick<
    LogData,
    'topSources' | 'uniqueSources' | 'sourcePercentile' | 'sourceLoyaltyName'
  >;
}

/**
 * Static Favorite Sources card for share image generation.
 * Shows podium-style top 3 sources with proper height alignment.
 * Uses shared primitives with animated=false for consistency.
 */
export default function StaticCardFavoriteSources({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Header */}
      <SimpleHeadline animated={false} className={styles.headlineStack}>
        Your favorite trio
      </SimpleHeadline>

      {/* Podium */}
      <Podium
        sources={data.topSources}
        animated={false}
        customStyles={{
          podiumStage: styles.podiumStage,
          podiumColumn: styles.podiumColumn,
          podiumMedal: styles.podiumMedal,
          podiumSource: styles.podiumSource,
          podiumSourceLogo: styles.podiumSourceLogo,
          podiumSourceName: styles.podiumSourceName,
          podiumBar: styles.podiumBar,
          podiumBarFirst: styles.podiumBarFirst,
          podiumRank: styles.podiumRank,
          podiumCount: styles.podiumCount,
        }}
      />

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
      {shouldShowPercentileBanner(data.sourcePercentile) && (
        <TopPercentileBanner
          preText="TOP"
          mainText={`${data.sourcePercentile}%`}
          postText="EXPLORER"
          animated={false}
          customStyles={{
            celebrationBanner: styles.celebrationBanner,
            bannerBg: styles.bannerBg,
            bannerContent: styles.bannerContent,
            bannerPre: styles.bannerPre,
            bannerMain: styles.bannerMain,
            bannerPost: styles.bannerPost,
          }}
        />
      )}
    </>
  );
}
