import type { ReactElement } from 'react';
import React from 'react';
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
import { AuthDisplay } from '../../auth/common';
import AuthOptions from '../../auth/AuthOptions';
import { useAuthContext } from '../../../contexts/AuthContext';

export type RecruiterSignInModalProps = ModalProps;

export const RecruiterSignInModal = ({
  onRequestClose,
  ...modalProps
}: RecruiterSignInModalProps): ReactElement => {
  const { showLogin } = useAuthContext();

  return (
    <Modal
      {...modalProps}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick
    >
      <Modal.Body className="flex flex-col items-center gap-6 p-6">
        <Logo />
        <Typography type={TypographyType.Title1} bold center>
          Ready to launch? Let&#39;s unlock your warm intros.
        </Typography>
        <Typography
          type={TypographyType.Body}
          color={TypographyColor.Tertiary}
          center
        >
          Sign in to activate your campaign and get first access to warm devs.
        </Typography>

        <AuthOptions
          ignoreMessages
          formRef={null}
          trigger={AuthTriggers.RecruiterSelfServe}
          simplified
          defaultDisplay={AuthDisplay.OnboardingSignup}
          forceDefaultDisplay
          className={{
            onboardingSignup: '!gap-4',
          }}
          onAuthStateUpdate={(props) => {
            showLogin({
              trigger: AuthTriggers.Onboarding,
              options: { isLogin: true, formValues: props },
            });
          }}
          onboardingSignupButton={{
            variant: ButtonVariant.Primary,
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default RecruiterSignInModal;
