import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import AuthContext from '../../contexts/AuthContext';
import { AuthEventNames, AuthTriggersOrString } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Modal, ModalProps } from '../modals/common/Modal';

export interface AuthModalProps extends ModalProps {
  trigger?: AuthTriggersOrString;
}

const DiscardActionModal = dynamic(
  () =>
    import(
      /* webpackChunkName: "discardActionModal" */ '../modals/DiscardActionModal'
    ),
);

export default function AuthModal({
  className,
  trigger,
  onRequestClose,
  ...props
}: AuthModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [screenValue, setScreenValue] = useState<Display>(Display.Default);
  const { user, closeLogin, logout } = useContext(AuthContext);
  const onClose = (e) => {
    trackEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
    onRequestClose(e);
  };

  const closeAndLogout = (e) => {
    if (user) {
      logout();
    }
    onClose(e);
  };

  const {
    onDiscardAttempt,
    onDiscardCanceled,
    onContainerChange,
    formRef,
    container,
    isDiscardOpen,
  } = useAuthForms({
    onDiscard: onClose,
  });
  const isLogoutFlow = trigger === 'legacy_logout';

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      overlayRef={onContainerChange}
      onRequestClose={onDiscardAttempt}
      className={classNames(className, 'auth')}
    >
      <AuthOptions
        className="h-full"
        onClose={onDiscardAttempt}
        formRef={formRef}
        onSuccessfulLogin={closeLogin}
        trigger={trigger}
        isLoginFlow={isLogoutFlow}
        onDisplayChange={(display: Display) => setScreenValue(display)}
      />
      {isDiscardOpen && (
        <DiscardActionModal
          isOpen={isDiscardOpen}
          rightButtonAction={onDiscardCanceled}
          leftButtonAction={closeAndLogout}
          parentSelector={() => container}
          onRequestClose={onDiscardCanceled}
          title="Discard changes?"
          description="If you leave your changes will not be saved"
          leftButtonText="Leave"
          rightButtonText="Stay"
          rightButtonClass="btn-primary-cabbage"
        />
      )}
    </Modal>
  );
}
