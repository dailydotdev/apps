import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';
import { useSquadTourClose } from '../../hooks/useSquadTourClose';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const [onSquadTourClose] = useSquadTourClose();
  const onModalClose: typeof onRequestClose = (param) => {
    onSquadTourClose();
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
