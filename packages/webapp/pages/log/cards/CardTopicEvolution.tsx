import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import styles from '../Log.module.css';
import cardStyles from './Cards.module.css';

interface CardProps {
  data: LogData;
  cardNumber: number;
  totalCards: number;
  cardLabel: string;
  isActive: boolean;
}

const TOPIC_COLORS = [
  '#ff6b35', '#f7c948', '#e637bf', '#c6f135', '#4d9dff', '#00d4ff',
  '#a855f7', '#ff6b9d', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6'
];

export default function CardTopicEvolution({
  data,
  cardNumber,
  cardLabel,
  isActive,
}: CardProps): ReactElement {
  const [activeMonth, setActiveMonth] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);
  
  const animatedTopics = useAnimatedNumber(data.uniqueTopics, {
    delay: 500,
    enabled: isActive,
  });

  // Auto-play through months
  useEffect(() => {
    if (!isActive) {
      setActiveMonth(0);
      setAutoPlaying(false);
      return;
    }

    const startTimer = setTimeout(() => setAutoPlaying(true), 800);
    
    return () => clearTimeout(startTimer);
  }, [isActive]);

  useEffect(() => {
    if (!autoPlaying) return;

    const interval = setInterval(() => {
      setActiveMonth((prev) => {
        if (prev >= data.topicJourney.length - 1) {
          setAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [autoPlaying, data.topicJourney.length]);

  const currentTopic = data.topicJourney[activeMonth];
  const isPivot = currentTopic?.month === data.pivotMonth;

  return (
    <>
      {/* Card indicator */}
      <motion.div 
        className={styles.cardIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className={styles.cardNum}>
          {String(cardNumber).padStart(2, '0')}
        </span>
        <span className={styles.cardSep}>—</span>
        <span className={styles.cardLabel}>{cardLabel}</span>
      </motion.div>

      {/* Evolution visualization */}
      <div className={cardStyles.evolutionContainer}>
        {/* Month indicator bar */}
        <div className={cardStyles.monthBar}>
          {data.topicJourney.map((item, index) => (
            <motion.div
              key={item.month}
              className={`${cardStyles.monthDot} ${index === activeMonth ? cardStyles.monthDotActive : ''} ${item.month === data.pivotMonth ? cardStyles.monthDotPivot : ''}`}
              initial={{ scale: 0 }}
              animate={{ 
                scale: index <= activeMonth ? 1 : 0.5,
                opacity: index <= activeMonth ? 1 : 0.3
              }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => {
                setAutoPlaying(false);
                setActiveMonth(index);
              }}
            />
          ))}
        </div>

        {/* Current month display */}
        <motion.div 
          className={cardStyles.currentMonth}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {currentTopic?.month} 2025
        </motion.div>

        {/* Topic display with animated swap */}
        <div className={cardStyles.topicDisplay}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMonth}
              className={cardStyles.topicBubble}
              style={{ 
                background: TOPIC_COLORS[activeMonth % TOPIC_COLORS.length],
                boxShadow: isPivot ? `0 0 40px ${TOPIC_COLORS[activeMonth % TOPIC_COLORS.length]}` : undefined
              }}
              initial={{ scale: 0, rotate: -20, y: 50 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0, rotate: 20, y: -50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span className={cardStyles.topicHash}>#</span>
              <span className={cardStyles.topicName}>{currentTopic?.topic}</span>
            </motion.div>
          </AnimatePresence>

          {isPivot && (
            <motion.div 
              className={cardStyles.pivotLabel}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🔥 THE PIVOT
            </motion.div>
          )}
        </div>

        {/* Journey path visualization */}
        <div className={cardStyles.journeyPath}>
          {data.topicJourney.map((item, index) => (
            <motion.div
              key={`path-${index}`}
              className={cardStyles.journeyNode}
              style={{ 
                background: index <= activeMonth 
                  ? TOPIC_COLORS[index % TOPIC_COLORS.length] 
                  : 'rgba(255,255,255,0.2)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: index <= activeMonth ? 1 : 0.5 }}
              transition={{ delay: 0.5 + index * 0.03 }}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <motion.div 
        className={styles.statsBadges}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className={styles.badge}>
          <span className={styles.badgeValue}>{animatedTopics}</span>
          <span className={styles.badgeLabel}>Topics Explored</span>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div 
        className={styles.celebrationBanner}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.3 }}
      >
        <div className={styles.bannerBg} />
        <div className={styles.bannerContent}>
          <span className={styles.bannerPre}>MORE CURIOUS THAN</span>
          <span className={styles.bannerMain}>{100 - data.evolutionPercentile}%</span>
          <span className={styles.bannerPost}>OF DEVS</span>
        </div>
      </motion.div>
    </>
  );
}
