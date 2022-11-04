import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { ModalProps, StyledModal } from '../modals/StyledModal';
import styles from './VerifySessionModal.module.css';
import { LoginFormParams } from './LoginForm';
import { KratosProviderData } from '../../lib/kratos';
import { AuthTriggers } from '../../lib/auth';

interface VerifySessionModalProps extends ModalProps {
  userProviders?: KratosProviderData;
  onSocialLogin?: (provider: string) => void;
  onPasswordLogin?: (params: LoginFormParams) => void;
}

function VerifySessionModal({
  onSocialLogin,
  onRequestClose,
  onPasswordLogin,
  userProviders,
  ...props
}: VerifySessionModalProps): ReactElement {
  const [hint, setHint] = useState('Enter your password to login');
  const filteredProviders = providers.filter(
    ({ provider }) =>
      !userProviders?.result.indexOf(provider.toLocaleLowerCase()),
  );

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
        providers={filteredProviders}
        disableRegistration
        disablePassword={!onPasswordLogin}
        onClose={onRequestClose}
        onPasswordLogin={onPasswordLogin}
        onProviderClick={onSocialLogin}
        loginHint={[hint, setHint]}
        loginButton="Verify"
        trigger={AuthTriggers.VerifySession}
      />
    </StyledModal>
  );
}

export default VerifySessionModal;
