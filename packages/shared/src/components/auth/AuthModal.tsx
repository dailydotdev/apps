import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import AuthOptions from './AuthOptions';
import type { AuthProps } from './common';
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

  const getDefaultDisplay = (): Display => {
    if (loginState?.defaultDisplay) {
      return loginState.defaultDisplay;
    }
    if (loginState?.formValues?.email) {
      return Display.Registration;
    }
    // Always land on AuthDefault; `isLoginFlow` (tracked locally below)
    // decides whether it renders as Sign up or Log in. We deliberately do
    // NOT use OnboardingSignup here — that variant lives on /onboarding and
    // the bottom AuthenticationBanner; the inline modal should reuse the
    // same screen the rest of the app already shows for login/signup.
    return Display.Default;
  };
  const defaultDisplay = getDefaultDisplay();

  // `AuthOptionsInner` doesn't own `isLoginFlow` — it expects the parent to
  // track it via `onAuthStateUpdate`. `/onboarding` does this through a Jotai
  // atom; the modal needs its own state so flipping between the signup and
  // login screens (e.g. via the "Already have an account? Log in" link)
  // actually re-renders the inner component with the new flag.
  const [authState, setAuthState] = useState<Partial<AuthProps>>({
    isLoginFlow: loginState?.isLogin ?? false,
  });
  const onAuthStateUpdate = useCallback((next: Partial<AuthProps>) => {
    setAuthState((prev) => ({ ...prev, ...next }));
  }, []);

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
        isLoginFlow={authState.isLoginFlow ?? loginState?.isLogin}
        defaultDisplay={defaultDisplay}
        onAuthStateUpdate={onAuthStateUpdate}
        onDisplayChange={(display) => setScreenValue(display as Display)}
        initialEmail={loginState?.formValues?.email}
      />
    </Modal>
  );
}
