/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { ReactElement, useContext, useState } from 'react';
import RankProgress from './RankProgress';
import useReadingRank from '../lib/useReadingRank';
import { useHideOnModal } from '../lib/useHideOnModal';
import dynamic from 'next/dynamic';
import { focusOutline } from '../styles/helpers';
import AuthContext from './AuthContext';
import { STEPS_PER_RANK } from '../lib/rank';
import { headerRankHeight } from '../styles/sizes';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  useHideOnModal(() => showModal || true, [showModal]);

  const {
    isLoading,
    rank,
    nextRank,
    progress,
    neverShowRankModal,
    levelUp,
    confirmLevelUp,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  const showRankAnimation = levelUp && neverShowRankModal;

  return (
    <button
      className={className}
      css={css`
        display: flex;
        width: ${headerRankHeight};
        height: ${headerRankHeight};
        align-items: center;
        justify-content: center;
        margin: 0;
        padding: 0;
        border: none;
        background: var(--theme-background-primary);
        cursor: pointer;
        ${focusOutline}
      `}
      onClick={() => setShowModal(true)}
    >
      <RankProgress
        progress={showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress}
        rank={showRankAnimation ? nextRank : rank}
        showRankAnimation={showRankAnimation}
        fillByDefault={showRankAnimation}
        onRankAnimationFinish={() =>
          setTimeout(() => confirmLevelUp(true), 1000)
        }
      />
      {showModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
        />
      )}
      {levelUp && !neverShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && !neverShowRankModal}
          onRequestClose={confirmLevelUp}
        />
      )}
    </button>
  );
}
