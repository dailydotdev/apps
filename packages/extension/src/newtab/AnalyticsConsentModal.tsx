import React, { ReactElement } from 'react';
import { ModalProps } from '@dailydotdev/shared/src/components/modals/StyledModal';
import {
  ConfirmationButtons,
  ConfirmationDescription,
  ConfirmationHeading,
  ConfirmationModal,
} from '@dailydotdev/shared/src/components/modals/ConfirmationModal';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';

export interface AnalyticsConsentProps extends ModalProps {
  onDecline: () => unknown;
  onAccept: () => unknown;
}

export default function AnalyticsConsentModal({
  onDecline,
  onAccept,
  ...props
}: AnalyticsConsentProps): ReactElement {
  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Your privacy stays yours</ConfirmationHeading>
      <ConfirmationDescription>
        We use 3rd party analytics platforms to improve daily.dev. Instead of
        just using it, we would like to ask for your approval. We promise to
        never misuse it. 🙏
        <br />
        <br />
        Do you agree to opt-in?
      </ConfirmationDescription>
      <ConfirmationButtons>
        <Button
          className="btn-secondary"
          onClick={onDecline}
          style={{ flex: 'none' }}
        >
          No
        </Button>
        <Button className="btn-primary-water" onClick={onAccept}>
          Yes, I&apos;d love to
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
