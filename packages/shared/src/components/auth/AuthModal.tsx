import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import AuthOptions from './AuthOptions';
import { AuthDisplay as Display } from './common';
import useAuthForms, {
  type CloseAuthModalFunc,
} from '../../hooks/useAuthForms';
import { useAuthContext } from '../../contexts/AuthContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames, AuthTriggers } from '../../lib/auth';
import { useLogContext } from '../../contexts/LogContext';
import type { ModalProps } from '../modals/common/Modal';
import { Modal } from '../modals/common/Modal';
import type { AnonymousUser, LoggedUser } from '../../lib/user';
import { LogoutReason } from '../../lib/user';

export interface AuthModalProps extends ModalProps {
  trigger?: AuthTriggersType;
}

export default function AuthModal({
  className,
  trigger,
  onRequestClose,
  ...props
}: AuthModalProps): ReactElement {
  const { logEvent } = useLogContext();
  const [screenValue, setScreenValue] = useState<Display>(Display.Default);
  const { user, closeLogin, logout, loginState } = useAuthContext();

  const onClose: CloseAuthModalFunc = (e) => {
    logEvent({
      event_name: AuthEventNames.CloseSignUp,
      extra: JSON.stringify({ trigger, screenValue }),
    });
    onRequestClose?.(e as React.MouseEvent);
  };

  const closeAndLogout: CloseAuthModalFunc = (e) => {
    if (user && !user.username) {
      logout(LogoutReason.IncomleteOnboarding);
    }
    onClose(e);
  };

  const { onContainerChange, formRef, onDiscardAttempt } = useAuthForms({
    onDiscard: closeAndLogout,
  });

  const onSuccessfulLogin = () => {
    loginState?.onLoginSuccess?.();
    closeLogin();
  };

  const onSuccessfulRegistration = (
    newUser?: LoggedUser | AnonymousUser,
  ): void => {
    loginState?.onRegistrationSuccess?.(newUser);
    closeLogin();
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
        formRef={formRef!}
        onSuccessfulLogin={onSuccessfulLogin}
        onSuccessfulRegistration={onSuccessfulRegistration}
        trigger={trigger ?? AuthTriggers.MainButton}
        isLoginFlow={loginState?.isLogin}
        defaultDisplay={defaultDisplay}
        onDisplayChange={(display) => setScreenValue(display as Display)}
        initialEmail={loginState?.formValues?.email}
      />
    </Modal>
  );
}
