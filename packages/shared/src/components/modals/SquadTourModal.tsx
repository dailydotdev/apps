import React, { ReactElement } from 'react';
import SquadTour from '../squads/SquadTour';
import { Modal, ModalProps } from './common/Modal';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { useSquadTour } from '../../hooks/useSquadTour';
import { ModalClose } from './common/ModalClose';
import { useViewSize, ViewSize } from '../../hooks';
import { Drawer } from '../drawers';

function SquadTourModal({
  onRequestClose,
  ...props
}: ModalProps): ReactElement {
  const { onCloseTour } = useSquadTour();
  const isMobile = useViewSize(ViewSize.MobileL);
  const onModalClose: typeof onRequestClose = (param) => {
    onCloseTour();
    onRequestClose?.(param);
  };

  if (isMobile) {
    return (
      <Drawer
        isOpen
        displayCloseButton
        onClose={() => onModalClose(null)}
        className={{ drawer: 'pb-4' }}
      >
        <SquadTour onClose={() => onModalClose(null)} />
      </Drawer>
    );
  }

  return (
    <Modal
      {...props}
      onRequestClose={onModalClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
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
