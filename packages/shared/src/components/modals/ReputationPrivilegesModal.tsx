import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { Button, ButtonVariant } from '../buttons/Button';
import { ModalClose } from './common/ModalClose';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { Image } from '../image/Image';
import { cloudinaryReputationPrivilegesUnlocked } from '../../lib/image';
import { reputation, webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureReputationAnalytics } from '../../lib/featureManagement';

export const ReputationPrivilegesModal = ({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement => {
  const { completeAction } = useActions();
  const { value: hasReputationAnalytics } = useConditionalFeature({
    feature: featureReputationAnalytics,
  });

  const onClose = (event: MouseEvent) => {
    completeAction(ActionType.AckRep250);

    onRequestClose?.(event);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onClose} />
      <div className="flex flex-col items-center gap-10 p-0 text-center tablet:p-6">
        <Image
          src={cloudinaryReputationPrivilegesUnlocked}
          alt="Privileges unlocked!"
        />

        <div className="flex flex-col gap-5">
          <h3 className="font-bold text-text-primary typo-title1">
            Privileges unlocked!
          </h3>
          <p className="text-text-tertiary typo-body">
            Congratulations on your 250 reputation points achievement! Your
            meaningful contributions has propelled you into a realm of special
            privileges and superpowers. Keep up the fantastic work!
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          {hasReputationAnalytics && (
            <Button
              tag="a"
              href={`${webappUrl}analytics/reputation`}
              className="w-full"
              variant={ButtonVariant.Primary}
              onClick={onClose}
            >
              See your reputation
            </Button>
          )}
          <Button
            target="_blank"
            tag="a"
            rel={anchorDefaultRel}
            href={reputation}
            className="w-full"
            variant={
              hasReputationAnalytics
                ? ButtonVariant.Float
                : ButtonVariant.Primary
            }
            onClick={onClose}
          >
            Tell me more
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReputationPrivilegesModal;
