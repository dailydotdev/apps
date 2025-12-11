import type { ReactElement } from 'react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { LogData } from '../types';
import { useAnimatedNumber } from '../hooks';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
}

// Floating heart component
function FloatingHeart({
  delay,
  x,
}: {
  delay: number;
  x: number;
}): ReactElement {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '20%',
        fontSize: '1.5rem',
        pointerEvents: 'none',
      }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: -200,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.8],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 2,
        delay,
        ease: 'easeOut',
      }}
    >
      💜
    </motion.div>
  );
}

export default function CardCommunityEngagement({
  data,
  isActive,
}: CardProps): ReactElement {
  const [showHearts, setShowHearts] = useState(false);

  const animatedUpvotes = useAnimatedNumber(data.upvotesGiven, {
    delay: 500,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsWritten, {
    delay: 800,
    enabled: isActive,
  });
  const animatedBookmarks = useAnimatedNumber(data.postsBookmarked, {
    delay: 1100,
    enabled: isActive,
  });

  // Find the best percentile
  const bestStat = [
    { label: 'UPVOTERS', value: data.upvotePercentile, emoji: '💜' },
    { label: 'COMMENTERS', value: data.commentPercentile, emoji: '💬' },
    { label: 'CURATORS', value: data.bookmarkPercentile, emoji: '📚' },
  ]
    .filter((s) => s.value !== undefined && s.value <= 50)
    .sort((a, b) => (a.value || 100) - (b.value || 100))[0];

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowHearts(true), 1000);
      return () => clearTimeout(timer);
    }
    setShowHearts(false);
    return () => {
      // Cleanup when inactive
    };
  }, [isActive]);

  return (
    <>
      {/* Floating hearts */}
      {showHearts && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {[...Array(12)].map((_, i) => {
            const x = 20 + Math.random() * 60;
            return (
              <FloatingHeart
                key={`heart-${x}-${i * 0.15}`}
                delay={i * 0.15}
                x={x}
              />
            );
          })}
        </div>
      )}

      {/* Main stat - Upvotes with heart burst */}
      <motion.div
        className={cardStyles.loveContainer}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className={cardStyles.loveEmoji}
          animate={
            showHearts
              ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, -10, 10, 0],
                }
              : {}
          }
          transition={{ duration: 0.5 }}
        >
          💜
        </motion.div>
        <div className={cardStyles.loveStats}>
          <motion.span
            className={cardStyles.loveNumber}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {animatedUpvotes}
          </motion.span>
          <span className={cardStyles.loveLabel}>upvotes given</span>
        </div>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className={cardStyles.loveSubtitle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        spreading the love across the community
      </motion.p>

      {/* Secondary stats as icons */}
      <motion.div
        className={cardStyles.engagementGrid}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className={cardStyles.engagementItem}
          whileHover={{ scale: 1.1 }}
        >
          <span className={cardStyles.engagementEmoji}>💬</span>
          <span className={cardStyles.engagementValue}>{animatedComments}</span>
          <span className={cardStyles.engagementLabel}>comments</span>
        </motion.div>
        <motion.div
          className={cardStyles.engagementItem}
          whileHover={{ scale: 1.1 }}
        >
          <span className={cardStyles.engagementEmoji}>🔖</span>
          <span className={cardStyles.engagementValue}>
            {animatedBookmarks}
          </span>
          <span className={cardStyles.engagementLabel}>bookmarked</span>
        </motion.div>
      </motion.div>

      {/* Best stat banner */}
      {bestStat && (
        <motion.div
          className={cardStyles.communityBanner}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, type: 'spring' }}
        >
          <span className={cardStyles.communityBannerEmoji}>
            {bestStat.emoji}
          </span>
          <div>
            <span className={cardStyles.communityBannerTop}>
              TOP {bestStat.value}%
            </span>
            <span className={cardStyles.communityBannerLabel}>
              {bestStat.label}
            </span>
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <ShareStatButton
        delay={2.1}
        isActive={isActive}
        statText={`Spreading the love on daily.dev 💜\n\n👍 ${
          data.upvotesGiven
        } upvotes given\n💬 ${data.commentsWritten} comments\n🔖 ${
          data.postsBookmarked
        } bookmarked${
          bestStat
            ? `\n\nTOP ${bestStat.value}% ${bestStat.label.toLowerCase()}!`
            : ''
        }`}
      />
    </>
  );
}
