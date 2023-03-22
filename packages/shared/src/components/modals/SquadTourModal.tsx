import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  return (
    <Modal
      {...props}
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
    >
      <SquadTour onClose={onRequestClose} />
      <CloseButton
        buttonSize={ButtonSize.Small}
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onRequestClose}
      />
    </Modal>
  );
}

export default SquadTourModal;
