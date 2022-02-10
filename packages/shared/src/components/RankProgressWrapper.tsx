import React, { ReactElement, useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { RankProgress } from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import AuthContext from '../contexts/AuthContext';
import { RANKS } from '../lib/rank';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';

const RanksModal = dynamic(
  () =>
    import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal/index'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

export default function RankProgressWrapper({
  sidebarExpanded,
  className,
}: {
  sidebarExpanded?: boolean;
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { flags } = useContext(FeaturesContext);
  const devCardLimit = parseInt(
    getFeatureValue(Features.DevcardLimit, flags),
    10,
  );
  const {
    rank,
    rankLastWeek,
    nextRank,
    progress,
    tags,
    shouldShowRankModal,
    levelUp,
    confirmLevelUp,
    reads,
  } = useReadingRank();

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
          progress={showRankAnimation ? RANKS[nextRank - 1].steps : progress}
          rank={showRankAnimation ? nextRank : rank}
          nextRank={nextRank}
          showRankAnimation={showRankAnimation}
          showRadialProgress={sidebarExpanded}
          fillByDefault
          onRankAnimationFinish={() =>
            setTimeout(() => confirmLevelUp(true), 1000)
          }
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
          reads={reads}
          previousRank={rankLastWeek}
          devCardLimit={devCardLimit}
          nextRank={nextRank}
        />
      )}
      {levelUp && shouldShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && shouldShowRankModal}
          onRequestClose={confirmLevelUp}
          showDevCard={reads >= devCardLimit || !devCardLimit}
        />
      )}
    </>
  );
}
