import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import type { ModalProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { ButtonVariant } from '../../buttons/Button';
import Logo from '../../Logo';
import { AuthTriggers } from '../../../lib/auth';
import type { AuthProps } from '../../auth/common';
import { AuthDisplay } from '../../auth/common';
import AuthOptions from '../../auth/AuthOptions';

export type CandidateSignInModalProps = ModalProps & {
  opportunityId: string;
  onSuccess?: () => void;
};

export const CandidateSignInModal = ({
  onRequestClose,
  onSuccess,
  opportunityId,
  ...modalProps
}: CandidateSignInModalProps): ReactElement => {
  const [authState, setAuthState] = useState<AuthProps>(() => {
    return {
      isAuthenticating: false,
      isLoginFlow: false,
      isLoading: false,
      defaultDisplay: AuthDisplay.OnboardingSignup,
    };
  });

  const handleAuthStateUpdate = useCallback((props: Partial<AuthProps>) => {
    setAuthState((prev) => ({ ...prev, ...props }));
  }, []);

  const handleSuccessfulRegistration = useCallback(() => {
    onRequestClose?.(null);
    onSuccess?.();
  }, [onRequestClose, onSuccess]);

  const handleSuccessfulLogin = useCallback(() => {
    onRequestClose?.(null);
    onSuccess?.();
  }, [onRequestClose, onSuccess]);

  const authDisplay = authState.isLoginFlow
    ? AuthDisplay.Default
    : authState.defaultDisplay ?? AuthDisplay.OnboardingSignup;

  const showHeader = authDisplay === AuthDisplay.OnboardingSignup;

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6">
        {showHeader && (
          <>
            <Logo />
            <Typography type={TypographyType.Title1} bold center>
              Sign up to show your interest
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
              center
            >
              Create an account to let the recruiter know you&apos;re
              interested. It only takes a moment.
            </Typography>
          </>
        )}

        <AuthOptions
          formRef={null}
          trigger={AuthTriggers.Opportunity}
          simplified
          defaultDisplay={authDisplay}
          forceDefaultDisplay
          isLoginFlow={authState.isLoginFlow}
          className={{
            onboardingSignup: '!gap-4',
          }}
          onAuthStateUpdate={handleAuthStateUpdate}
          onSuccessfulRegistration={handleSuccessfulRegistration}
          onSuccessfulLogin={handleSuccessfulLogin}
          onboardingSignupButton={{
            variant: ButtonVariant.Primary,
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default CandidateSignInModal;
