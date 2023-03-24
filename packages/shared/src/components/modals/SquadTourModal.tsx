import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import SquadTour, { CarouselMinimalProps } from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize } from '../buttons/Button';

function SquadTourModal({
  onRequestClose,
  onScreenIndexChange,
  ...props
}: ModalProps & CarouselMinimalProps): ReactElement {
  const onModalClose: typeof onRequestClose = (param) => {
    onScreenIndexChange?.(-1);
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
      <SquadTour
        onClose={onModalClose}
        onScreenIndexChange={onScreenIndexChange}
      />
      <CloseButton
        buttonSize={ButtonSize.Small}
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onModalClose}
      />
    </Modal>
  );
}

export default SquadTourModal;
