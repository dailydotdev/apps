import React, { ReactElement } from 'react';
import { Modal, ModalProps } from '../common/Modal';
import { ModalSize } from '../common/types';
import { ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';
import { privacyPolicy } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';

export interface FirefoxPrivacyModalProps extends ModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

function FirefoxPrivacyModal({
  onAccept,
  onDecline,
  onRequestClose,
  ...props
}: FirefoxPrivacyModalProps): ReactElement {
  const actionAndClose = (action: () => void, e: React.MouseEvent) => {
    action();
    onRequestClose(e);
  };

  return (
    <Modal {...props} shouldCloseOnOverlayClick={false} size={ModalSize.Medium}>
      <Modal.Body>
        <h1 className="text-center font-bold typo-title3">
          Your privacy stays yours
        </h1>
        <div className="mb-6 mt-4 text-center text-text-secondary typo-callout">
          <p>
            We collect{' '}
            <a
              href={privacyPolicy}
              target="_blank"
              rel={anchorDefaultRel}
              className="font-bold underline"
            >
              user data
            </a>{' '}
            to provide a personalized experience on daily.dev. Instead of just
            collecting data right away, we would like to ask for your approval.
            We promise to never misuse it.
            <br />
            <br />
            Do you agree to opt-in?
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 self-stretch tablet:flex-row">
          <Button
            variant={ButtonVariant.Secondary}
            onClick={(e) => actionAndClose(onDecline, e)}
            className="w-full tablet:w-auto"
          >
            Decline and uninstall
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            onClick={(e) => actionAndClose(onAccept, e)}
            className="w-full tablet:w-auto"
          >
            Yes, thanks for asking
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default FirefoxPrivacyModal;
