import React from 'react';
import classed from '../../lib/classed';
import { Modal, ModalProps } from './common/Modal';

export function ConfirmationModal({ children, ...props }: ModalProps) {
  return (
    <Modal
      isOpen
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.XSmall}
      {...props}
    >
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}

export const ConfirmationButtons = classed(
  'div',
  'flex items-center justify-around self-stretch',
);
export const ConfirmationHeading = classed(
  'h1',
  'font-bold typo-title3 text-center',
);
export const ConfirmationDescription = classed(
  'div',
  'mt-4 mb-6 text-theme-label-secondary text-center typo-callout',
);
