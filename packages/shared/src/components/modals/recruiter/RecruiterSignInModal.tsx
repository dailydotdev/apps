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

export type RecruiterSignInModalProps = ModalProps & {
  onSuccess?: () => void;
};

export const RecruiterSignInModal = ({
  onRequestClose,
  onSuccess,
  ...modalProps
}: RecruiterSignInModalProps): ReactElement => {
  const [authDisplay, setAuthDisplay] = useState<AuthDisplay>(
    AuthDisplay.OnboardingSignup,
  );

  const handleAuthStateUpdate = useCallback((props: Partial<AuthProps>) => {
    // Handle display changes within the modal (e.g., switching to email registration)
    if (props.defaultDisplay) {
      setAuthDisplay(props.defaultDisplay);
    }
  }, []);

  const handleSuccessfulRegistration = useCallback(() => {
    // Close the modal and trigger success callback
    onRequestClose?.(null);
    onSuccess?.();
  }, [onRequestClose, onSuccess]);

  const handleSuccessfulLogin = useCallback(() => {
    // Close the modal and trigger success callback
    onRequestClose?.(null);
    onSuccess?.();
  }, [onRequestClose, onSuccess]);

  // Show header content only on the initial signup screen
  const showHeader = authDisplay === AuthDisplay.OnboardingSignup;

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6">
        {showHeader && (
          <>
            <Logo />
            <Typography type={TypographyType.Title1} bold center>
              Last step to see your matches
            </Typography>
            <Typography
              type={TypographyType.Body}
              color={TypographyColor.Tertiary}
              center
            >
              We&apos;re analyzing your job now. Sign up to see developers who
              already opted in to hear about roles like yours.
            </Typography>
          </>
        )}

        <AuthOptions
          formRef={null}
          trigger={AuthTriggers.RecruiterSelfServe}
          simplified
          defaultDisplay={authDisplay}
          forceDefaultDisplay
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

export default RecruiterSignInModal;
