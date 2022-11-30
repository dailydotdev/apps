import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useTrackModal } from '../../../hooks/useTrackModal';
import RanksBadges from './RanksBadges';
import RanksTags from './RanksTags';
import DevCardFooter from './DevCardFooter';
import { RanksModalProps } from './common';
import AuthContext from '../../../contexts/AuthContext';
import { Button } from '../../buttons/Button';
import { RANKS } from '../../../lib/rank';
import { AuthTriggers } from '../../../lib/auth';
import { Modal } from '../common/Modal';
import IntroSection from './IntroSection';

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
    <Modal
      {...props}
      size={Modal.Size.Medium}
      kind={Modal.Kind.FixedCenter}
      onRequestClose={onRequestClose}
    >
      <Modal.Header title="Weekly reading goal" />
      <Modal.Body>
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
              onClick={() => showLogin(AuthTriggers.RanksModal)}
            >
              Sign up
            </Button>
          </div>
        )}
        <RanksTags tags={tags} isColorPrimary />
        <DevCardFooter rank={rank} user={user} isLocked={!user} />
      </Modal.Body>
    </Modal>
  );
}
