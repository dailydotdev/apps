import React, { ReactElement, useContext } from 'react';
import { ModalCloseButton } from '../ModalCloseButton';
import { ResponsiveModal } from '../ResponsiveModal';
import { useTrackModal } from '../../../hooks/useTrackModal';
import RanksBadges from './RanksBadges';
import RanksTags from './RanksTags';
import DevCardFooter from './DevCardFooter';
import IntroSection from './IntroSection';
import { RanksModalProps } from './common';
import AuthContext from '../../../contexts/AuthContext';
import { ModalHeader } from '../common';

export default function RanksModal({
  rank,
  progress,
  tags,
  hideProgress,
  confirmationText,
  reads,
  devCardLimit,
  onRequestClose,
  onShowAccount,
  className,
  ...props
}: RanksModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  useTrackModal({ isOpen: props.isOpen, title: 'ranks modal' });
  const currentRank = rank;

  return (
    <ResponsiveModal
      {...props}
      onRequestClose={onRequestClose}
      padding={false}
      style={{ content: { maxWidth: '26.25rem' } }}
    >
      <ModalHeader>
        <h3 className="font-bold typo-title3">Weekly reading goal</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </ModalHeader>
      <IntroSection onShowAccount={onShowAccount} user={user} />
      <RanksBadges rank={currentRank} progress={progress} />
      <RanksTags tags={tags} isAtModal />
      <DevCardFooter
        rank={rank}
        user={user}
        reads={reads}
        devCardLimit={devCardLimit}
        isLocked={!user || reads < devCardLimit}
      />
    </ResponsiveModal>
  );
}
