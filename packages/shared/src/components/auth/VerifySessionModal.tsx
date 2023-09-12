import React, { ReactElement, useState } from 'react';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { AuthTriggers } from '../../lib/auth';
import { Modal, ModalProps } from '../modals/common/Modal';
import useLogin from '../../hooks/useLogin';

interface VerifySessionModalProps extends ModalProps {
  userProviders?: string[];
  onVerified: () => void;
}

function VerifySessionModal({
  onRequestClose,
  userProviders = [],
  onVerified,
  ...props
}: VerifySessionModalProps): ReactElement {
  const [hint, setHint] = useState('Enter your password to login');
  const filteredProviders = providers.filter(
    ({ provider }) => !userProviders?.indexOf(provider.toLocaleLowerCase()),
  );
  const { isReady, onSocialLogin, onPasswordLogin } = useLogin({
    enableSessionVerification: true,
    queryParams: { refresh: 'true' },
    onSuccessfulLogin: () => {
      onVerified();
      onRequestClose(null);
    },
  });

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
