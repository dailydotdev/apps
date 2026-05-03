import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ButtonV2, ButtonVariant } from '../buttons/ButtonV2';
import { ModalClose } from './common/ModalClose';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { Image } from '../image/Image';
import { cloudinaryReputationPrivilegesUnlocked } from '../../lib/image';
import { reputation } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export const ReputationPrivilegesModal = ({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement => {
  const { completeAction } = useActions();

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
        <ButtonV2
          target="_blank"
          tag="a"
          rel={anchorDefaultRel}
          href={reputation}
          className="w-full"
          variant={ButtonVariant.Primary}
          onClick={onClose}
        >
          Tell me more
        </ButtonV2>
      </div>
    </Modal>
  );
};

export default ReputationPrivilegesModal;
