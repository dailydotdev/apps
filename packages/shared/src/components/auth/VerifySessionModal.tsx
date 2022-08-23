import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { ModalProps, StyledModal } from '../modals/StyledModal';
import styles from './VerifySessionModal.module.css';
import { LoginFormParams } from './LoginForm';

interface VerifySessionModalProps extends ModalProps {
  onPasswordLogin: (
    params: LoginFormParams & { event: FormEvent<HTMLFormElement> },
  ) => void;
}

function VerifySessionModal({
  onRequestClose,
  onPasswordLogin,
  ...props
}: VerifySessionModalProps): ReactElement {
  const [hint, setHint] = useState('Enter your password to login');

  return (
    <StyledModal
      {...props}
      onRequestClose={onRequestClose}
      className={classNames(styles.verifyAuthModal)}
      contentClassName={classNames(
        'verifyAuth flex w-full rounded-16 bg-theme-bg-tertiary',
      )}
    >
      <AuthDefault
        title="Verify it's you (security check)"
        providers={providers}
        disableRegistration
        onClose={onRequestClose}
        onPasswordLogin={onPasswordLogin}
        loginHint={[hint, setHint]}
      />
    </StyledModal>
  );
}

export default VerifySessionModal;
