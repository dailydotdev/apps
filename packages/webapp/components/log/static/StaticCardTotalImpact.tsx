import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';
import {
  HeadlineStack,
  StatBadgeGroup,
  Divider,
  shouldShowPercentileBanner,
} from '../primitives';
import TopPercentileBanner from '../TopPercentileBanner';

interface StaticCardProps {
  data: Pick<
    LogData,
    'totalPosts' | 'totalReadingTime' | 'daysActive' | 'totalImpactPercentile'
  >;
}

/**
 * Static Total Impact card for share image generation.
 * No animations - displays final state.
 * Uses shared primitives with animated=false for consistency with interactive card.
 */
export default function StaticCardTotalImpact({
  data,
}: StaticCardProps): ReactElement {
  return (
    <>
      {/* Main headline stack */}
      <HeadlineStack
        rows={[
          { content: 'You read', variant: 'small' },
          { content: data.totalPosts.toLocaleString(), variant: 'big' },
          { content: 'POSTS', variant: 'medium' },
          { content: 'this year', variant: 'accent' },
        ]}
        animated={false}
        customStyles={{
          headlineStack: styles.headlineStack,
          headlineRow: styles.headlineRow,
          headlineSmall: styles.headlineSmall,
          headlineBig: styles.headlineBig,
          headlineMedium: styles.headlineMedium,
          headlineAccent: styles.headlineAccent,
        }}
      />

      {/* Divider */}
      <Divider
        animated={false}
        customStyles={{
          divider: styles.divider,
          dividerLine: styles.dividerLine,
          dividerIcon: styles.dividerIcon,
        }}
      />

      {/* Secondary stats */}
      <StatBadgeGroup
        badges={[
          { value: `${data.totalReadingTime}h`, label: 'Reading' },
          { value: data.daysActive, label: 'Days Active' },
        ]}
        animated={false}
        customStyles={{
          statsBadges: styles.statsBadges,
          badge: styles.badge,
          badgeValue: styles.badgeValue,
          badgeLabel: styles.badgeLabel,
        }}
      />

      {/* Competitive stat banner */}
      {shouldShowPercentileBanner(data.totalImpactPercentile) && (
        <TopPercentileBanner
          preText="Top"
          mainText={`${data.totalImpactPercentile}%`}
          postText="of devs"
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
