import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonVariant } from '../buttons/Button';
import { ModalClose } from './common/ModalClose';
import { Image } from '../image/Image';
import { opportunityLiveIllustration } from '../../lib/image';
import Link from '../utilities/Link';
import { opportunityUrl } from '../../lib/constants';

export interface JobOpportunityModalProps extends ModalProps {
  opportunityId: string;
}

export const JobOpportunityModal = ({
  opportunityId,
  onRequestClose,
  ...modalProps
}: JobOpportunityModalProps): ReactElement => {
  const onShowNow = (event: MouseEvent) => {
    onRequestClose(event);
  };

  const onMaybeLater = (event: MouseEvent) => {
    onRequestClose(event);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <Modal.Body className="items-center overflow-hidden !p-0">
        <ModalClose onClick={onRequestClose} className="top-4 z-1" />

        <div className="flex flex-col items-center justify-center gap-8 px-6 py-10 tablet:px-10 tablet:py-14">
          <div className="relative flex items-center justify-center">
            <Image
              src={opportunityLiveIllustration}
              alt="Job opportunity"
              className="h-48 w-auto tablet:h-64"
            />
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="typo-mega font-bold leading-tight tablet:typo-tera">
              <span className="from-purple-400 to-purple-600 bg-gradient-to-r bg-clip-text text-transparent">
                YOU GOT
              </span>
              <br />
              <span className="from-purple-400 to-purple-600 bg-gradient-to-r bg-clip-text text-transparent">
                A NEW
              </span>
              <br />
              <span className="from-purple-400 to-purple-600 bg-gradient-to-r bg-clip-text text-transparent">
                JOB OFFER
              </span>
            </h2>
            <p className="max-w-sm text-text-tertiary typo-body">
              We think this role deserves your attention, but your decision is
              private. If it's a fit, we'll handle it quietly. If not, it's gone
              for good.
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3">
            <Link href={`${opportunityUrl}/${opportunityId}`} passHref>
              <Button
                tag="a"
                className="w-full"
                variant={ButtonVariant.Primary}
                onClick={onShowNow}
              >
                Show me now
              </Button>
            </Link>
            <Button
              className="w-full"
              variant={ButtonVariant.Tertiary}
              onClick={onMaybeLater}
            >
              Maybe later
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default JobOpportunityModal;
