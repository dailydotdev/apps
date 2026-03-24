import type { ReactElement } from 'react';
import React from 'react';
import SquadTour from '../squads/SquadTour';
import type { LazyModalCommonProps, ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { useSquadTour } from '../../hooks/useSquadTour';
import { ModalClose } from './common/ModalClose';

type SquadTourModalProps = Omit<ModalProps, 'onRequestClose'> & {
  onRequestClose?: LazyModalCommonProps['onRequestClose'];
};

function SquadTourModal({
  onRequestClose,
  ...props
}: SquadTourModalProps): ReactElement {
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
      <SquadTour onClose={() => onModalClose(undefined)} />
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
