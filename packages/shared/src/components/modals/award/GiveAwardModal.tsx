import type { ReactElement } from 'react';
import React from 'react';

import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { Typography, TypographyType } from '../../typography/Typography';

const GiveAwardModal = ({ ...props }: ModalProps): ReactElement => {
  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...props}>
      <Modal.Header title="Give an Award" />
      <Modal.Body>
        <Typography type={TypographyType.Callout}>
          Show your appreciation! Pick an Award to send to John doe!
        </Typography>
      </Modal.Body>
    </Modal>
  );
};

export default GiveAwardModal;
