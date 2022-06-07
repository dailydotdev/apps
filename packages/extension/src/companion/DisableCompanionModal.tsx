import React, { ReactElement, MouseEvent } from 'react';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from '@dailydotdev/shared/src/components/modals/ConfirmationModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';

export interface DisableCompanionModalProps extends ModalProps {
  onConfirm: () => unknown;
}
export default function DisableCompanionModal({
  onConfirm,
  ...props
}: DisableCompanionModalProps): ReactElement {
  const onDisableClick = async (event: MouseEvent): Promise<void> => {
    onConfirm();
    props.onRequestClose(event);
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Disable the companion widget?</ConfirmationHeading>
      <ConfirmationDescription>
        You can always re-enable it through the customize menu.
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button className="btn-primary" onClick={onDisableClick}>
          Disable
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
