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
import { Button } from '../../buttons/Button';

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
  const color = `var(--theme-rank-${rank || 1}-color)`;
  const { user, showLogin } = useContext(AuthContext);
  useTrackModal({ isOpen: props.isOpen, title: 'ranks modal' });

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
      <RanksBadges rank={rank} progress={progress} />
      {!user && (
        <div className="flex flex-col items-center mt-2">
          <span className="typo-footnote">
            Sign up to add your weekly achievements to your profile.
          </span>
          <Button
            className="mt-3 w-40 btn-primary"
            onClick={() => showLogin('ranks modal')}
            style={{ background: color }}
          >
            Sign up
          </Button>
        </div>
      )}
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
