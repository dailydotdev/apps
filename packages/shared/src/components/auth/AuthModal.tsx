import type { ReactElement } from 'react';
import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import AuthContext from '../../contexts/AuthContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import LogContext from '../../contexts/LogContext';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import type { AnonymousUser, LoggedUser } from '../../lib/user';
import { LogoutReason } from '../../lib/user';
import { logPixelSignUp } from '../Pixels';

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

    logPixelSignUp({
      experienceLevel: (newUser as LoggedUser)?.experienceLevel,
    });
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
