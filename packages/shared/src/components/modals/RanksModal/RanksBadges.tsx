import React, { ReactElement } from 'react';
import {
  getNextRankText,
  getShowRank,
  isFinalRank,
  RANKS,
  RANK_OFFSET,
} from '../../../lib/rank';
import {
  RanksBadgesList,
  RanksBadgesProps,
  RanksBadgesSection,
} from './common';
import RankBadgeItem from './RankBadgeItem';
import { ModalText } from '../common';

const RanksBadges = ({
  rank,
  progress,
  previousRank,
}: RanksBadgesProps): ReactElement => {
  const finalRank = isFinalRank(rank);
  const showRank = getShowRank(rank, progress);

  return (
    <RanksBadgesSection>
      <RanksBadgesList
        style={{
          transform: `translate(${RANK_OFFSET[showRank]})`,
        }}
        data-testId="badgesContainer"
      >
        {RANKS.map((itemRank) => (
          <RankBadgeItem
            key={itemRank.name}
            showRank={showRank}
            itemRank={itemRank}
            progress={progress}
            previousRank={previousRank}
          />
        ))}
      </RanksBadgesList>
      <ModalText className="mt-1 mb-3 text-center">
        {getNextRankText({
          nextRank: rank + 1,
          rank,
          finalRank,
          progress,
          showNextLevel: false,
        })}
      </ModalText>
    </RanksBadgesSection>
  );
};
export default RanksBadges;
