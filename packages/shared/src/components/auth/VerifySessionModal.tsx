import React, { ReactElement, useState } from 'react';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { LoginFormParams } from './LoginForm';
import { KratosProviderData } from '../../lib/kratos';
import { AuthTriggers } from '../../lib/auth';
import { Modal, ModalProps } from '../modals/common/Modal';

interface VerifySessionModalProps extends ModalProps {
  isReady: boolean;
  userProviders?: KratosProviderData;
  onSocialLogin?: (provider: string) => void;
  onPasswordLogin?: (params: LoginFormParams) => void;
}

function VerifySessionModal({
  onSocialLogin,
  onRequestClose,
  onPasswordLogin,
  userProviders,
  isReady,
  ...props
}: VerifySessionModalProps): ReactElement {
  const [hint, setHint] = useState('Enter your password to login');
  const filteredProviders = providers.filter(
    ({ provider }) =>
      !userProviders?.result.indexOf(provider.toLocaleLowerCase()),
  );

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FixedCenter}
      size={Modal.Size.Small}
      onRequestClose={onRequestClose}
    >
      <AuthDefault
        isReady={isReady}
        signUpTitle="Verify it's you (security check)"
        providers={filteredProviders}
        disableRegistration
        disablePassword={!onPasswordLogin}
        onPasswordLogin={onPasswordLogin}
        onProviderClick={onSocialLogin}
        loginHint={[hint, setHint]}
        loginButton="Verify"
        trigger={AuthTriggers.VerifySession}
      />
    </Modal>
  );
}

export default VerifySessionModal;
