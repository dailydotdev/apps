import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
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
import { RANKS } from '../../../lib/rank';

export default function RanksModal({
  rank,
  progress,
  tags,
  hideProgress,
  confirmationText,
  onRequestClose,
  className,
  previousRank,
  nextRank,
  ...props
}: RanksModalProps): ReactElement {
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
      <IntroSection />
      <RanksBadges
        rank={rank}
        progress={progress}
        nextRank={nextRank}
        previousRank={previousRank}
      />
      {!user && (
        <div className="flex flex-col items-center mt-2">
          <span className="typo-footnote">
            Sign up to add your weekly achievements to your profile.
          </span>
          <Button
            className={classNames(
              'mt-3 w-40 btn-primary',
              rank && RANKS[rank].background,
            )}
            onClick={() => showLogin('ranks modal')}
          >
            Sign up
          </Button>
        </div>
      )}
      <RanksTags tags={tags} isColorPrimary />
      <DevCardFooter rank={rank} user={user} isLocked={!user} />
    </ResponsiveModal>
  );
}
