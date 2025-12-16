import type { ReactElement } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UpvoteIcon,
  DiscussIcon,
  BookmarkIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { LogData } from '../../types/log';
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import cardStyles from './Cards.module.css';
import ShareStatButton from './ShareStatButton';

interface CardProps {
  data: LogData;
  isActive: boolean;
  subcard?: number;
  isTouchDevice?: boolean;
}

// Mixed floating icons component
function FloatingIcon({
  delay,
  x,
  type,
}: {
  delay: number;
  x: number;
  type: 'upvote' | 'comment' | 'bookmark';
}): ReactElement {
  const icons = {
    upvote: (
      <UpvoteIcon
        secondary
        size={IconSize.Small}
        className="text-action-upvote-default"
      />
    ),
    comment: (
      <DiscussIcon
        secondary
        size={IconSize.Small}
        className="text-action-comment-default"
      />
    ),
    bookmark: (
      <BookmarkIcon
        secondary
        size={IconSize.Small}
        className="text-action-bookmark-default"
      />
    ),
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: '15%',
        pointerEvents: 'none',
      }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: -180,
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0.8],
        x: [0, Math.random() * 30 - 15],
      }}
      transition={{
        duration: 2.2,
        delay,
        ease: 'easeOut',
      }}
    >
      {icons[type]}
    </motion.div>
  );
}

export default function CardCommunityEngagement({
  data,
  isActive,
}: CardProps): ReactElement {
  const [showParticles, setShowParticles] = useState(false);

  // Total engagement actions
  const totalEngagement =
    data.upvotesGiven + data.commentsWritten + data.postsBookmarked;

  const animatedTotal = useAnimatedNumber(totalEngagement, {
    delay: 300,
    enabled: isActive,
  });
  const animatedUpvotes = useAnimatedNumber(data.upvotesGiven, {
    delay: 600,
    enabled: isActive,
  });
  const animatedComments = useAnimatedNumber(data.commentsWritten, {
    delay: 800,
    enabled: isActive,
  });
  const animatedBookmarks = useAnimatedNumber(data.postsBookmarked, {
    delay: 1000,
    enabled: isActive,
  });

  // All stats for percentile display
  const allStats = useMemo(
    () =>
      [
        {
          label: 'UPVOTERS',
          value: data.upvotePercentile,
          icon: (
            <UpvoteIcon
              secondary
              size={IconSize.Large}
              className="text-action-upvote-default"
            />
          ),
        },
        {
          label: 'COMMENTERS',
          value: data.commentPercentile,
          icon: (
            <DiscussIcon
              secondary
              size={IconSize.Large}
              className="text-action-comment-default"
            />
          ),
        },
        {
          label: 'CURATORS',
          value: data.bookmarkPercentile,
          icon: (
            <BookmarkIcon
              secondary
              size={IconSize.Large}
              className="text-action-bookmark-default"
            />
          ),
        },
      ]
        .filter((s) => s.value !== undefined && s.value <= 50)
        .sort((a, b) => (a.value || 100) - (b.value || 100)),
    [data],
  );

  const bestStat = allStats[0];

  // Generate mixed floating icons
  const floatingIcons = useMemo(() => {
    const types: Array<'upvote' | 'comment' | 'bookmark'> = [
      'upvote',
      'comment',
      'bookmark',
    ];
    return [...Array(15)].map((_, i) => ({
      x: 15 + Math.random() * 70,
      delay: i * 0.12,
      type: types[i % 3],
      key: `icon-${i}`,
    }));
  }, []);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setShowParticles(true), 800);
      return () => clearTimeout(timer);
    }
    setShowParticles(false);
    return () => {};
  }, [isActive]);

  return (
    <>
      {/* Mixed floating icons */}
      {showParticles && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {floatingIcons.map(({ x, delay, type, key }) => (
            <FloatingIcon key={key} delay={delay} x={x} type={type} />
          ))}
        </div>
      )}

      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        {/* Total engagement header */}
        <motion.div
          className={cardStyles.engagementHeader}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={cardStyles.engagementHeaderText}>
            COMMUNITY PULSE
          </span>
        </motion.div>

        {/* Main stat - Total engagement */}
        <motion.div
          className={cardStyles.totalEngagementContainer}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            className={cardStyles.totalEngagementNumber}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {largeNumberFormat(animatedTotal)}
          </motion.span>
          <span className={cardStyles.totalEngagementLabel}>interactions</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className={cardStyles.loveSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          every action builds the community
        </motion.p>

        {/* Three equal engagement pillars */}
        <motion.div
          className={cardStyles.engagementPillars}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className={cardStyles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={cardStyles.pillarIcon}>
              <UpvoteIcon
                secondary
                size={IconSize.Medium}
                className="text-action-upvote-default"
              />
            </span>
            <span className={cardStyles.pillarValue}>
              {largeNumberFormat(animatedUpvotes)}
            </span>
            <span className={cardStyles.pillarLabel}>upvotes</span>
          </motion.div>

          <motion.div
            className={cardStyles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={cardStyles.pillarIcon}>
              <DiscussIcon
                secondary
                size={IconSize.Medium}
                className="text-action-comment-default"
              />
            </span>
            <span className={cardStyles.pillarValue}>
              {largeNumberFormat(animatedComments)}
            </span>
            <span className={cardStyles.pillarLabel}>comments</span>
          </motion.div>

          <motion.div
            className={cardStyles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={cardStyles.pillarIcon}>
              <BookmarkIcon
                secondary
                size={IconSize.Medium}
                className="text-action-bookmark-default"
              />
            </span>
            <span className={cardStyles.pillarValue}>
              {largeNumberFormat(animatedBookmarks)}
            </span>
            <span className={cardStyles.pillarLabel}>saved</span>
          </motion.div>
        </motion.div>

        {/* Best stat banner */}
        {bestStat && (
          <motion.div
            className={cardStyles.communityBanner}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring' }}
          >
            <span className={cardStyles.communityBannerEmoji}>
              {bestStat.icon}
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
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={1.8}
        isActive={isActive}
        statText={`My community pulse on daily.dev 💜\n\n🎯 ${largeNumberFormat(
          totalEngagement,
        )} total interactions\n👍 ${largeNumberFormat(
          data.upvotesGiven,
        )} upvotes\n💬 ${largeNumberFormat(
          data.commentsWritten,
        )} comments\n🔖 ${largeNumberFormat(data.postsBookmarked)} saved${
          bestStat
            ? `\n\nTOP ${bestStat.value}% ${bestStat.label.toLowerCase()}!`
            : ''
        }`}
      />
    </>
  );
}
