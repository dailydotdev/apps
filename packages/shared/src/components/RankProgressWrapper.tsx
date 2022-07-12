import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { RankProgress } from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import AuthContext from '../contexts/AuthContext';
import { getRank, RANKS } from '../lib/rank';
import useDebounce from '../hooks/useDebounce';

const RanksModal = dynamic(
  () =>
    import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal/index'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

export interface RankProgressWrapperProps {
  disableNewRankPopup?: boolean;
  sidebarExpanded?: boolean;
  className?: string;
}

export default function RankProgressWrapper({
  disableNewRankPopup,
  sidebarExpanded,
  className,
}: RankProgressWrapperProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const {
    rank,
    rankLastWeek,
    nextRank,
    progress,
    tags,
    shouldShowRankModal,
    levelUp,
    confirmLevelUp,
  } = useReadingRank(disableNewRankPopup);

  const [levelUpAnimation] = useDebounce(() => {
    confirmLevelUp(true);
  }, 1000);

  const showRankAnimation = levelUp && !shouldShowRankModal;
  const closeRanksModal = () => {
    setShowRanksModal(false);
  };

  return (
    <>
      <button
        type="button"
        className={classNames(
          className,
          'flex items-center cursor-pointer focus-outline w-full',
          sidebarExpanded ? 'rounded-12 p-3' : 'rounded-10',
        )}
        onClick={() => setShowRanksModal(true)}
      >
        <RankProgress
          progress={
            showRankAnimation ? RANKS[getRank(nextRank)].steps : progress
          }
          rank={showRankAnimation ? nextRank : rank}
          nextRank={nextRank}
          showRankAnimation={showRankAnimation}
          showRadialProgress={sidebarExpanded}
          fillByDefault
          onRankAnimationFinish={levelUpAnimation}
          showTextProgress={sidebarExpanded}
          smallVersion
          rankLastWeek={rankLastWeek}
        />
      </button>
      {showRanksModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          tags={tags}
          isOpen={showRanksModal}
          onRequestClose={closeRanksModal}
          previousRank={rankLastWeek}
          nextRank={nextRank}
        />
      )}
      {shouldShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && shouldShowRankModal}
          onRequestClose={confirmLevelUp}
        />
      )}
    </>
  );
}
