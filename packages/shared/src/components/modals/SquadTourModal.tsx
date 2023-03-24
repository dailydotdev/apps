import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';
import { useSquadTour } from '../../hooks/useSquadTour';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { onTourIndexChange } = useSquadTour();
  const onModalClose: typeof onRequestClose = (param) => {
    onTourIndexChange(-1);
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
        buttonSize={ButtonSize.Small}
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onModalClose}
      />
    </Modal>
  );
}

export default SquadTourModal;
