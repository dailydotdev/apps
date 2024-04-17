import React, { ReactElement } from 'react';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { useSquadTour } from '../../hooks/useSquadTour';
import { ModalClose } from './common/ModalClose';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const onModalClose: typeof onRequestClose = (param) => {
    onCloseTour();
    onRequestClose?.(param);
  };

  return (
    <Modal
      {...props}
      onRequestClose={onModalClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-accent-cabbage-default"
      isDrawerOnMobile
      drawerProps={{ className: { drawer: 'pb-4', close: 'mx-4' } }}
    >
      <SquadTour onClose={() => onModalClose(null)} />
      <ModalClose
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        top="3"
        right="3"
        onClick={onModalClose}
      />
    </Modal>
  );
}

export default SquadTourModal;
