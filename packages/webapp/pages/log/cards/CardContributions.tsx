import type { ReactElement } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

export default function CardContributions({
  data,
  isActive,
}: CardProps): ReactElement {
  const animatedPosts = useAnimatedNumber(data.postsCreated || 0, {
    delay: 500,
    enabled: isActive,
  });
  const animatedViews = useAnimatedNumber(data.totalViews || 0, {
    delay: 800,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsReceived || 0, {
    delay: 1000,
    enabled: isActive,
  });
  const animatedRep = useAnimatedNumber(data.reputationEarned || 0, {
    delay: 1200,
    enabled: isActive,
  });

  return (
    <>
      {/* Spotlight effect */}
      <motion.div
        className={cardStyles.spotlight}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      />

      {/* Creator spotlight header */}
      <motion.div
        className={cardStyles.creatorHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className={cardStyles.creatorStar}>⭐</span>
        <span className={cardStyles.creatorTitle}>CREATOR SPOTLIGHT</span>
        <span className={cardStyles.creatorStar}>⭐</span>
      </motion.div>

      {/* Main stat */}
      <motion.div
        className={cardStyles.creatorMain}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <span className={cardStyles.creatorNumber}>{animatedPosts}</span>
        <span className={cardStyles.creatorLabel}>POSTS CREATED</span>
      </motion.div>

      {/* Impact metrics */}
      <motion.div
        className={cardStyles.impactGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className={cardStyles.impactItem}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <span className={cardStyles.impactIcon}>👁️</span>
          <span className={cardStyles.impactValue}>
            {animatedViews.toLocaleString()}
          </span>
          <span className={cardStyles.impactLabel}>views</span>
        </motion.div>

        <motion.div
          className={cardStyles.impactItem}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <span className={cardStyles.impactIcon}>💬</span>
          <span className={cardStyles.impactValue}>{animatedComments}</span>
          <span className={cardStyles.impactLabel}>comments</span>
        </motion.div>

        <motion.div
          className={cardStyles.impactItem}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <span className={cardStyles.impactIcon}>⚡</span>
          <span className={cardStyles.impactValue}>
            {animatedRep.toLocaleString()}
          </span>
          <span className={cardStyles.impactLabel}>reputation</span>
        </motion.div>
      </motion.div>

      {/* Creator ranking */}
      {data.creatorPercentile && (
        <motion.div
          className={cardStyles.creatorRank}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, type: 'spring', stiffness: 200 }}
        >
          <span className={cardStyles.creatorRankBadge}>🏆</span>
          <div>
            <span className={cardStyles.creatorRankTop}>
              TOP {data.creatorPercentile}%
            </span>
            <span className={cardStyles.creatorRankLabel}>CONTENT CREATOR</span>
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <ShareStatButton
        delay={2.2}
        isActive={isActive}
        statText={`Creator spotlight on daily.dev ⭐\n\n📝 ${
          data.postsCreated
        } posts created\n👁️ ${(
          data.totalViews || 0
        ).toLocaleString()} views\n💬 ${
          data.commentsReceived
        } comments received\n⚡ ${(
          data.reputationEarned || 0
        ).toLocaleString()} reputation${
          data.creatorPercentile
            ? `\n\nTOP ${data.creatorPercentile}% content creator!`
            : ''
        }`}
      />
    </>
  );
}
