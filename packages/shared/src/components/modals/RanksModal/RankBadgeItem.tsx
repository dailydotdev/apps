import React, { CSSProperties, ReactElement } from 'react';
import classNames from 'classnames';
import {
  isFinalRankCompleted,
  isRankCompleted,
  RANKS,
} from '../../../lib/rank';
import RadialProgress from '../../RadialProgress';
import Rank from '../../Rank';
import styles from '../../RankProgress.module.css';
import {
  RankBadge,
  RankBadgeContainer,
  RankBadgeItemProps,
  RankBadgeLine,
  RankBadgeName,
} from './common';

const RankBadgeItem = ({
  showRank,
  itemRank,
  progress,
  previousRank,
}: RankBadgeItemProps): ReactElement => {
  const rankCompleted = isRankCompleted(showRank, itemRank.level, progress);
  const finalRankCompleted = isFinalRankCompleted(showRank, progress);

  const getLabelColor = () => {
    if (showRank > itemRank.level) {
      return itemRank.color;
    }

    if (itemRank.level > showRank) {
      return 'text-theme-label-quaternary';
    }

    return showRank === itemRank.level && rankCompleted
      ? itemRank.color
      : 'text-theme-label-tertiary';
  };

  return (
    <RankBadge>
      {itemRank.level !== RANKS.length && (
        <RankBadgeLine
          className={rankCompleted ? itemRank.background : 'bg-white'}
        />
      )}
      <RankBadgeContainer
        className={classNames(
          rankCompleted ? itemRank.border : '',
          showRank === itemRank.level
            ? 'w-16 h-16'
            : 'w-10 h-10 border rounded-12',
        )}
      >
        {showRank === itemRank.level && (
          <RadialProgress
            progress={progress}
            steps={finalRankCompleted ? 0 : itemRank.steps}
            className={classNames(
              styles.radialProgress,
              'w-full h-full absolute inset-0',
            )}
            style={
              {
                '--radial-progress-completed-step': `var(--theme-rank-${
                  finalRankCompleted || previousRank === itemRank.level
                    ? showRank
                    : showRank - 1
                }-color)`,
                opacity: previousRank < itemRank.level ? 0.8 : 1,
              } as CSSProperties
            }
          />
        )}
        <Rank
          rank={itemRank.level}
          className={classNames(
            showRank === itemRank.level ? 'w-10 h-10' : 'w-8 h-8',
          )}
          colorByRank={
            finalRankCompleted ||
            previousRank >= itemRank.level ||
            showRank > itemRank.level
          }
        />
      </RankBadgeContainer>
      <RankBadgeName
        className={classNames(
          getLabelColor(),
          showRank === itemRank.level ? 'typo-callout' : 'typo-footnote',
        )}
      >
        {itemRank.name}
      </RankBadgeName>
    </RankBadge>
  );
};
export default RankBadgeItem;
