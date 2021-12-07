import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import classNames from 'classnames';
import { RankProgress } from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import AuthContext from '../contexts/AuthContext';
import { rankToColor, RANK_NAMES, STEPS_PER_RANK } from '../lib/rank';
import FeaturesContext from '../contexts/FeaturesContext';
import { getFeatureValue } from '../lib/featureManagement';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

const AccountDetailsModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "accountDetailsModal" */ './modals/AccountDetailsModal'
    ),
);

export default function SidebarRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { flags } = useContext(FeaturesContext);
  const devCardLimit = parseInt(
    getFeatureValue('feat_limit_dev_card', flags),
    10,
  );

  const {
    isLoading,
    rank,
    rankLastWeek,
    nextRank,
    progress,
    shouldShowRankModal,
    levelUp,
    confirmLevelUp,
    reads,
  } = useReadingRank();

  console.log('pg', progress);

  if (isLoading) {
    return <></>;
  }

  const showRankAnimation = levelUp && !shouldShowRankModal;
  const closeRanksModal = () => {
    setShowRanksModal(false);
  };

  return (
    <>
      <li
        className="flex items-center px-3 mt-4"
        style={
          {
            '--rank-color': rankToColor(rank),
          } as CSSProperties
        }
      >
        <button
          type="button"
          className={classNames(
            'flex items-center bg-theme-bg-secondary border border-theme-rank rounded-12 cursor-pointer focus-outline w-full p-3',
            className,
          )}
          onClick={() => setShowRanksModal(true)}
        >
          <RankProgress
            progress={
              showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress
            }
            rank={showRankAnimation ? nextRank : rank}
            showRankAnimation={showRankAnimation}
            fillByDefault
            onRankAnimationFinish={() =>
              setTimeout(() => confirmLevelUp(true), 1000)
            }
            smallVersion
          />
          <div className="flex flex-col ml-3 items-start">
            <span className="typo-callout text-theme-rank">
              {RANK_NAMES[rank > 0 ? rank - 1 : 0]}
            </span>
            <span className="typo-footnote text-theme-label-tertiary">
              Last week: {RANK_NAMES[rankLastWeek > 0 ? rankLastWeek - 1 : 0]}
            </span>
          </div>
        </button>
      </li>
      {showRanksModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showRanksModal}
          onRequestClose={closeRanksModal}
          onShowAccount={() => setShowAccountDetails(true)}
          reads={reads}
          devCardLimit={devCardLimit}
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
      {showAccountDetails && (
        <AccountDetailsModal
          isOpen={showAccountDetails}
          onRequestClose={() => setShowAccountDetails(false)}
        />
      )}
    </>
  );
}
