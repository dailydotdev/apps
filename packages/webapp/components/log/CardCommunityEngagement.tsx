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
import { useAnimatedNumber } from '../../hooks/log';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import type { BaseCardProps } from './types';

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
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
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
          className={styles.engagementHeader}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className={styles.engagementHeaderText}>COMMUNITY PULSE</span>
        </motion.div>

        {/* Main stat - Total engagement */}
        <motion.div
          className={styles.totalEngagementContainer}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            className={styles.totalEngagementNumber}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {largeNumberFormat(animatedTotal)}
          </motion.span>
          <span className={styles.totalEngagementLabel}>interactions</span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className={styles.loveSubtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          every action builds the community
        </motion.p>

        {/* Three equal engagement pillars */}
        <motion.div
          className={styles.engagementPillars}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <motion.div
            className={styles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={styles.pillarIcon}>
              <UpvoteIcon
                secondary
                size={IconSize.Medium}
                className="text-action-upvote-default"
              />
            </span>
            <span className={styles.pillarValue}>
              {largeNumberFormat(animatedUpvotes)}
            </span>
            <span className={styles.pillarLabel}>upvotes</span>
          </motion.div>

          <motion.div
            className={styles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={styles.pillarIcon}>
              <DiscussIcon
                secondary
                size={IconSize.Medium}
                className="text-action-comment-default"
              />
            </span>
            <span className={styles.pillarValue}>
              {largeNumberFormat(animatedComments)}
            </span>
            <span className={styles.pillarLabel}>comments</span>
          </motion.div>

          <motion.div
            className={styles.engagementPillar}
            whileHover={{ scale: 1.05 }}
          >
            <span className={styles.pillarIcon}>
              <BookmarkIcon
                secondary
                size={IconSize.Medium}
                className="text-action-bookmark-default"
              />
            </span>
            <span className={styles.pillarValue}>
              {largeNumberFormat(animatedBookmarks)}
            </span>
            <span className={styles.pillarLabel}>saved</span>
          </motion.div>
        </motion.div>

        {/* Best stat banner */}
        {bestStat && (
          <motion.div
            className={styles.communityBanner}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, type: 'spring' }}
          >
            <span className={styles.communityBannerEmoji}>{bestStat.icon}</span>
            <div>
              <span className={styles.communityBannerTop}>
                TOP {bestStat.value}%
              </span>
              <span className={styles.communityBannerLabel}>
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
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText="lurker? not me"
      />
    </>
  );
}
