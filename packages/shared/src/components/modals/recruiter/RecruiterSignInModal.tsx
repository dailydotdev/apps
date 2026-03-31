import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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
import { claimOpportunitiesMutationOptions } from '../../../features/opportunity/mutations';
import { useAuthContext } from '../../../contexts/AuthContext';

export type RecruiterSignInModalProps = ModalProps & {
  onSuccess?: () => void;
};

export const RecruiterSignInModal = ({
  onRequestClose,
  onSuccess,
  ...modalProps
}: RecruiterSignInModalProps): ReactElement => {
  const { trackingId, user } = useAuthContext();
  const [trackingIdState] = useState(trackingId); // save initial trackingId before login/registration
  const { mutateAsync: claimOpportunities } = useMutation(
    claimOpportunitiesMutationOptions(),
  );

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
    // Close the modal and trigger success callback
    onRequestClose?.(null);
    onSuccess?.();
  }, [onRequestClose, onSuccess]);

  const handleSuccessfulLogin = useCallback(async () => {
    try {
      // Claim opportunities with both trackingId and user email via Promise.all
      // This ensures opportunities are claimed whether they were created with trackingId or email
      const claimPromises: Promise<unknown>[] = [];

      if (trackingIdState) {
        claimPromises.push(claimOpportunities({ identifier: trackingIdState }));
      }

      if (user?.email) {
        claimPromises.push(claimOpportunities({ identifier: user.email }));
      }

      if (claimPromises.length > 0) {
        await Promise.all(claimPromises);
      }
    } catch {
      // if we can't claim at this time we move on
    }

    // Close the modal and trigger success callback
    onRequestClose?.(null);
    onSuccess?.();
  }, [
    claimOpportunities,
    onRequestClose,
    onSuccess,
    trackingIdState,
    user?.email,
  ]);

  // Derive the display from auth state - login flow should show default display
  const authDisplay = authState.isLoginFlow
    ? AuthDisplay.Default
    : authState.defaultDisplay ?? AuthDisplay.OnboardingSignup;

  // Show header content only on the initial signup screen
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

export default RecruiterSignInModal;
