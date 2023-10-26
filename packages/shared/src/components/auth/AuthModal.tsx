import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import AuthContext from '../../contexts/AuthContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Modal, ModalProps } from '../modals/common/Modal';

export interface AuthModalProps extends ModalProps {
  trigger?: AuthTriggersType;
}

export default function AuthModal({
  className,
  trigger,
  onRequestClose,
  ...props
}: AuthModalProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const [screenValue, setScreenValue] = useState<Display>(Display.Default);
  const { user, closeLogin, logout, loginState } = useContext(AuthContext);
  const onClose = (e) => {
    trackEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
    onRequestClose(e);
  };

  const closeAndLogout = (e) => {
    if (user && !user.username) {
      logout();
    }
    onClose(e);
  };

  const { onContainerChange, formRef, onDiscardAttempt } = useAuthForms({
    onDiscard: closeAndLogout,
  });
  const isLogoutFlow = trigger === 'legacy_logout';
  const onSuccessfulLogin = () => {
    loginState?.onLoginSuccess?.();
    closeLogin();
  };

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
        onClose={onClose}
        formRef={formRef}
        onSuccessfulLogin={onSuccessfulLogin}
        onSuccessfulRegistration={loginState?.onRegistrationSuccess}
        trigger={trigger}
        isLoginFlow={isLogoutFlow || loginState?.isLogin}
        onDisplayChange={(display: Display) => setScreenValue(display)}
      />
    </Modal>
  );
}
