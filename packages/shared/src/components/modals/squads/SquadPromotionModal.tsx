import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import CloseButton from '../../CloseButton';
import { ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';
import PromotionTour from '../../squads/PromotionTour';
import { useSquad } from '../../../hooks';

interface SquadPromotionModalProps extends ModalProps {
  handle: string;
}

export function SquadPromotionModal({
  onRequestClose,
  handle,
  ...props
}: SquadPromotionModalProps): ReactElement {
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
      className="overflow-hidden !border-theme-color-cabbage"
    >
      <PromotionTour onClose={onRequestClose} source={squad} />
      <CloseButton
        size={ButtonSize.Small}
        variant={ButtonVariant.Secondary}
        className="top-3 right-3 absolute"
        onClick={onRequestClose}
      />
    </Modal>
  );
}

export default SquadPromotionModal;
