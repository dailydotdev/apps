import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

const RECORD_ICONS: Record<string, string> = {
  streak: '🔥',
  binge: '📚',
  lateNight: '🌙',
  earlyMorning: '🌅',
  consistency: '📅',
  marathon: '🏃',
};

const RECORD_COLORS = ['#ff6b35', '#e637bf', '#4d9dff'];

export default function CardRecords({
  data,
  isActive,
}: CardProps): ReactElement {
  return (
    <>
      {/* Trophy header */}
      <motion.div
        className={cardStyles.trophyHeader}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <motion.span
          className={cardStyles.trophyEmoji}
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          🏆
        </motion.span>
        <span className={cardStyles.trophyTitle}>PERSONAL BESTS</span>
      </motion.div>

      {/* Records as trophy cards */}
      <div className={cardStyles.recordsGrid}>
        {data.records.map((record, index) => (
          <motion.div
            key={record.type}
            className={cardStyles.recordCard}
            style={{ borderColor: RECORD_COLORS[index] }}
            initial={{
              opacity: 0,
              x: index % 2 === 0 ? -50 : 50,
              rotate: index % 2 === 0 ? -5 : 5,
            }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{
              delay: 0.4 + index * 0.2,
              type: 'spring',
              stiffness: 100,
            }}
            whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
          >
            <motion.span
              className={cardStyles.recordIcon}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.6 + index * 0.2,
                type: 'spring',
                stiffness: 300,
              }}
            >
              {RECORD_ICONS[record.type] || '🎯'}
            </motion.span>

            <div className={cardStyles.recordContent}>
              <span className={cardStyles.recordLabel}>{record.label}</span>
              <span className={cardStyles.recordValue}>{record.value}</span>
            </div>

            {record.percentile && (
              <motion.span
                className={cardStyles.recordBadge}
                style={{ background: RECORD_COLORS[index] }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 + index * 0.2, type: 'spring' }}
              >
                TOP {record.percentile}%
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Share button */}
      <ShareStatButton
        delay={1.8}
        isActive={isActive}
        statText={`My 2025 records on daily.dev 🏆\n\n${data.records
          .map(
            (r) =>
              `${RECORD_ICONS[r.type] || '🎯'} ${r.label}: ${r.value}${
                r.percentile ? ` (TOP ${r.percentile}%)` : ''
              }`,
          )
          .join('\n')}`}
      />

      {/* Teaser for next card */}
      <motion.div
        className={cardStyles.nextTeaser}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
      >
        <span>Now for the big reveal...</span>
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          →
        </motion.span>
      </motion.div>
    </>
  );
}
