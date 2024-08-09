import React, { ReactElement } from 'react';
import { ModalSize } from '../../modals/common/types';
import { ModalBody } from '../../modals/common/ModalBody';
import { Modal } from '../../modals/common/Modal';
import { useToggle } from '../../../hooks/useToggle';

export interface StreakRecoverPopupProps {}

export const StreakRecoverPopup = (
  props: StreakRecoverPopupProps,
): ReactElement => {
  const [isOpen, toggle] = useToggle(true);
  const onRequestClose = () => {};

  return (
    <Modal
      isDrawerOnMobile={isOpen}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      <ModalBody />
    </Modal>
  );
};

export default StreakRecoverPopup;
