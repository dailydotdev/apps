import React, { ReactElement } from 'react';
import {
  getNextRankText,
  getRank,
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
  nextRank,
  previousRank,
}: RanksBadgesProps): ReactElement => {
  const finalRank = isFinalRank(rank);
  const showRank =
    progress === RANKS[getRank(rank)].steps && rank !== RANKS.length
      ? rank + 1
      : rank;

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
          rankLastWeek: previousRank,
          rank,
          finalRank,
          nextRank,
          progress,
          showNextLevel: false,
        })}
      </ModalText>
    </RanksBadgesSection>
  );
};
export default RanksBadges;
