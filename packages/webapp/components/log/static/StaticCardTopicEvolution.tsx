import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../../../types/log';
import styles from './StaticCards.module.css';

interface StaticCardProps {
  data: Pick<LogData, 'topicJourney' | 'uniqueTopics' | 'evolutionPercentile'>;
}

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

// Quarterly color palettes - each quarter has its own vibe
const QUARTERLY_PALETTES: Record<string, [string, string, string]> = {
  Q1: ['#64B5F6', '#90CAF9', '#CE93D8'],
  Q2: ['#81C784', '#AED581', '#FFD54F'],
  Q3: ['#FF7043', '#FFAB91', '#FFD54F'],
  Q4: ['#E91E63', '#F48FB1', '#FFAB40'],
};

const DEFAULT_COLORS: [string, string, string] = [
  '#ff6b35',
  '#f7c948',
  '#c6f135',
];

function getQuarterlyColors(quarter: string): [string, string, string] {
  return QUARTERLY_PALETTES[quarter] || DEFAULT_COLORS;
}

/**
 * Static Topic Evolution card for share image generation.
 * Shows all 4 quarters with top 3 topics each.
 */
export default function StaticCardTopicEvolution({
  data,
}: StaticCardProps): ReactElement {
  const quarters = data.topicJourney.slice(0, 4);

  return (
    <>
      {/* Header */}
      <div className={styles.headlineStack}>
        <span className={styles.headlineSmall}>
          Your interests, quarter by quarter
        </span>
      </div>

      {/* Quarters grid */}
      <div className={styles.quartersGrid}>
        {quarters.map((quarter) => {
          const colors = getQuarterlyColors(quarter.quarter);
          const isInactive = quarter.inactive === true;

          return (
            <div key={quarter.quarter} className={styles.quarterSection}>
              <div className={styles.quarterLabel}>{quarter.quarter}</div>

              {isInactive ? (
                <div className={styles.quarterInactive}>
                  <span className={styles.quarterInactiveEmoji}>😴</span>
                  <span className={styles.quarterInactiveText}>Break</span>
                </div>
              ) : (
                <div className={styles.quarterTopics}>
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={styles.topicTag}
                      style={{ background: colors[index] }}
                    >
                      <span className={styles.topicMedal}>
                        {MEDAL_EMOJIS[index]}
                      </span>
                      <span className={styles.topicName}>
                        {quarter.topics[index] || ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {quarter.comment && (
                <div className={styles.quarterComment}>{quarter.comment}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats badge */}
      <div className={styles.topicStatsBadge}>
        <span className={styles.topicStatsValue}>{data.uniqueTopics}</span>
        <span className={styles.topicStatsLabel}>Topics Explored</span>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>MORE CURIOUS THAN</span>
          <span className={styles.bannerMain}>
            {100 - data.evolutionPercentile}%
          </span>
          <span className={styles.bannerPost}>OF DEVS</span>
        </div>
      </div>
    </>
  );
}
