import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import CloseButton from '../../CloseButton';
import { ButtonSize } from '../../buttons/Button';
import PromotionTour from '../../squads/PromotionTour';
import { Source } from '../../../graphql/sources';
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
  const onClose = () => {
    console.log('on close');
    onRequestClose(null);
  };

  console.log(squad, isFetched);

  if (!isFetched) return null;

  return (
    <Modal
      {...props}
      isOpen
      onRequestClose={onClose}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      className="overflow-hidden !border-theme-color-cabbage"
    >
      <PromotionTour onClose={onClose} source={squad} />
      <CloseButton
        buttonSize={ButtonSize.Small}
        className="top-3 right-3 !absolute !btn-secondary"
        onClick={onClose}
      />
    </Modal>
  );
}

export default SquadPromotionModal;
