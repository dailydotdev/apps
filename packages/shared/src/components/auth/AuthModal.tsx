import React, { ReactElement, useContext, useState } from 'react';
import classNames from 'classnames';
import AuthOptions, { AuthDisplay as Display } from './AuthOptions';
import useAuthForms from '../../hooks/useAuthForms';
import AuthContext from '../../contexts/AuthContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { Modal, ModalProps } from '../modals/common/Modal';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { isOnboardingV4dot5 } from '../../lib/featureValues';

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
  const onboardingV4dot5 = useFeature(feature.onboardingV4dot5);
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

  const defaultDisplay =
    isOnboardingV4dot5(onboardingV4dot5) && !loginState?.isLogin
      ? Display.OnboardingSignupV4d5
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
        onSuccessfulRegistration={loginState?.onRegistrationSuccess}
        trigger={trigger}
        isLoginFlow={isLogoutFlow || loginState?.isLogin}
        defaultDisplay={defaultDisplay}
        onDisplayChange={(display: Display) => setScreenValue(display)}
      />
    </Modal>
  );
}
