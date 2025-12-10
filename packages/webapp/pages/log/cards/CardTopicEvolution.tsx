import type { ReactElement } from 'react';
import React from 'react';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import styles from '../Log.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

export default function CardTopicEvolution({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const animatedTopics = useAnimatedNumber(data.uniqueTopics, {
    delay: 1500,
    enabled: isActive,
  });

  // Group consecutive same topics
  const groupedJourney = data.topicJourney.reduce<
    Array<{ months: string[]; topic: string; isPivot: boolean }>
  >((acc, item) => {
    const last = acc[acc.length - 1];
    const isPivot = item.month === data.pivotMonth;

    if (last && last.topic === item.topic && !isPivot) {
      last.months.push(item.month);
    } else {
      acc.push({
        months: [item.month],
        topic: item.topic,
        isPivot,
      });
    }
    return acc;
  }, []);

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

      {/* Main headline */}
      <div className={styles.headlineStack}>
        <div className={styles.headlineRow}>
          <span className={styles.headlineSmall}>Your interests evolved</span>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timelineContainer}>
        <div className={styles.timelinePath}>
          {groupedJourney.map((group, index) => (
            <div
              key={`${group.topic}-${index}`}
              className={styles.timelineItem}
              style={{
                animationDelay: isActive ? `${0.4 + index * 0.15}s` : '0s',
              }}
            >
              <span className={styles.timelineMonth}>
                {group.months.length > 1
                  ? `${group.months[0]}-${group.months[group.months.length - 1]}`
                  : group.months[0]}
              </span>
              <div
                className={`${styles.timelineDot} ${group.isPivot ? styles.pivot : ''}`}
              />
              <span
                className={`${styles.timelineTopic} ${group.isPivot ? styles.pivot : ''}`}
              >
                #{group.topic}
                {group.isPivot && ' ← THE PIVOT'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats badges */}
      <div className={styles.statsBadges}>
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedTopics}</span>
          <span className={styles.badgeLabel}>Topics Explored</span>
        </div>
      </div>

      {/* Competitive stat banner */}
      <div className={styles.celebrationBanner}>
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>MORE EVOLUTION THAN</span>
          <span className={styles.bannerMain}>{100 - data.evolutionPercentile}%</span>
          <span className={styles.bannerPost}>OF DEVS</span>
        </div>
      </div>
    </>
  );
}
