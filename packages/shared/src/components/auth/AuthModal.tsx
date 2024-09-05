import classNames from 'classnames';
import React, { ReactElement, useContext, useState } from 'react';

import AuthContext from '../../contexts/AuthContext';
import LogContext from '../../contexts/LogContext';
import useAuthForms from '../../hooks/useAuthForms';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import { AnonymousUser, LoggedUser, LogoutReason } from '../../lib/user';
import { Modal, ModalProps } from '../modals/common/Modal';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import { logSignUp } from './OnboardingLogs';

export interface AuthModalProps extends ModalProps {
  trigger?: AuthTriggersType;
}

export default function AuthModal({
  className,
  trigger,
  onRequestClose,
  ...props
}: AuthModalProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const [screenValue, setScreenValue] = useState<Display>(Display.Default);
  const { user, closeLogin, logout, loginState } = useContext(AuthContext);
  const onClose = (e) => {
    logEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
    onRequestClose(e);
  };

  const closeAndLogout = (e) => {
    if (user && !user.username) {
      logout(LogoutReason.IncomleteOnboarding);
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

  const onSuccessfulRegistration = (newUser?: LoggedUser | AnonymousUser) => {
    loginState?.onRegistrationSuccess?.(newUser);

    logSignUp({ experienceLevel: (newUser as LoggedUser)?.experienceLevel });
  };

  const defaultDisplay = loginState?.formValues?.email
    ? Display.Registration
    : Display.Default;

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
        className={{ container: 'h-full' }}
        onClose={onClose}
        formRef={formRef}
        onSuccessfulLogin={onSuccessfulLogin}
        onSuccessfulRegistration={onSuccessfulRegistration}
        trigger={trigger}
        isLoginFlow={isLogoutFlow || loginState?.isLogin}
        defaultDisplay={defaultDisplay}
        onDisplayChange={(display: Display) => setScreenValue(display)}
        initialEmail={loginState?.formValues?.email}
      />
    </Modal>
  );
}
