import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { useTrackModal } from '../../../hooks/useTrackModal';
import RanksBadges from './RanksBadges';
import RanksTags from './RanksTags';
import DevCardFooter from './DevCardFooter';
import { RanksModalProps } from './common';
import AuthContext from '../../../contexts/AuthContext';
import { Button, ButtonVariant } from '../../buttons/ButtonV2';
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
          <div className="mb-7 mt-2 flex flex-col items-center">
            <span className="typo-footnote">
              Sign up to add your weekly achievements to your profile.
            </span>
            <Button
              className={classNames(
                'mt-3 w-40',
                rank && RANKS[rank].background,
              )}
              variant={ButtonVariant.Primary}
              onClick={() => showLogin({ trigger: AuthTriggers.RanksModal })}
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
