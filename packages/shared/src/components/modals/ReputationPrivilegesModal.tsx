import React, { MouseEvent, ReactElement } from 'react';
import { Modal, ModalProps } from './common/Modal';
import { Button, ButtonVariant } from '../buttons/Button';
import { ModalClose } from './common/ModalClose';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import { reputation } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';

export const ReputationPrivilegesModal = ({
  onRequestClose,
  ...modalProps
}: ModalProps): ReactElement => {
  const { completeAction } = useActions();

  const onClose = (event: MouseEvent) => {
    completeAction(ActionType.AckRep250);

    onRequestClose(event);
  };

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      onRequestClose={onClose}
    >
      <ModalClose className="top-2" onClick={onClose} />
      <div className="flex flex-col items-center gap-10 p-6 text-center">
        <Image
          src={cloudinary.reputation.privilegesUnlocked}
          alt="Privileges unlocked!"
        />

        <div className="flex flex-col gap-5">
          <h3 className="font-bold text-theme-label-primary typo-title1">
            Privileges unlocked!
          </h3>
          <p className="text-theme-label-tertiary typo-body">
            Congratulations on your 250 reputation points achievement! Your
            meaningful contributions has propelled you into a realm of special
            privileges and superpowers. Keep up the fantastic work!
          </p>
        </div>
        <Button
          target="_blank"
          tag="a"
          rel={anchorDefaultRel}
          href={reputation}
          className="w-full"
          variant={ButtonVariant.Primary}
          onClick={onClose}
        >
          Tell me more
        </Button>
      </div>
    </Modal>
  );
};

export default ReputationPrivilegesModal;
