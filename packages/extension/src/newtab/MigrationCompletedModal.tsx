import React, { ReactElement } from 'react';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from '@dailydotdev/shared/src/components/modals/ConfirmationModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import Icon from '@dailydotdev/shared/src/components/icons/V';
import { Styles } from 'react-modal';

const style: Styles = {
  content: { maxWidth: '26.25rem', paddingTop: '1rem', paddingBottom: '2rem' },
};

export default function MigrationCompletedModal(
  props: ModalProps,
): ReactElement {
  const { onRequestClose } = props;
  return (
    <ConfirmationModal {...props} style={style}>
      <Icon style={{ fontSize: '4rem' }} />
      <ConfirmationHeading>Merge settings completed</ConfirmationHeading>
      <ConfirmationDescription>
        Your account is now ready with all your previous settings, filters and
        bookmarks.
        <br />
        <br />
        Have a nice day 😊
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-primary-avocado" onClick={onRequestClose}>
          Cool, thanks!
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
