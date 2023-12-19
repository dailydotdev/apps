import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize, ButtonVariant } from '../buttons/ButtonV2';
import { useSquadTour } from '../../hooks/useSquadTour';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const onModalClose: typeof onRequestClose = (param) => {
    onCloseTour();
    onRequestClose(param);
  };

  return (
    <Modal
      {...props}
      onRequestClose={onModalClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
    >
      <SquadTour onClose={onModalClose} />
      <CloseButton
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        className="top-3 right-3 absolute"
        onClick={onModalClose}
      />
    </Modal>
  );
}

export default SquadTourModal;
