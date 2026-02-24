import type { ReactElement } from 'react';
import React from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ButtonSize, ButtonVariant } from '../../buttons/Button';
import PromotionTour from '../../squads/PromotionTour';
import { useSquad } from '../../../hooks';
import { ModalClose } from '../common/ModalClose';

interface SquadPromotionModalProps extends ModalProps {
  handle: string;
}

export function SquadPromotionModal({
  onRequestClose,
  handle,
  ...props
}: SquadPromotionModalProps): ReactElement | null {
  const { squad, isFetched } = useSquad({ handle });

  if (!isFetched) {
    return null;
  }

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onRequestClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-accent-cabbage-default"
      isDrawerOnMobile
      drawerProps={{ className: { drawer: 'pb-4' } }}
    >
      <PromotionTour onClose={onRequestClose} source={squad} />
      <ModalClose
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        top="3"
        right="3"
        onClick={(event) => onRequestClose?.(event)}
      />
    </Modal>
  );
}

export default SquadPromotionModal;
