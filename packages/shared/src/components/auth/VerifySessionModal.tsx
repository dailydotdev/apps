import React, { ReactElement, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { AuthTriggers } from '../../lib/auth';
import { Modal, ModalProps } from '../modals/common/Modal';
import useLogin from '../../hooks/useLogin';
import { AuthSession } from '../../lib/kratos';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

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
    ({ value }) => !userProviders?.indexOf(value),
  );
  const client = useQueryClient();
  const { user } = useAuthContext();
  const session = client.getQueryData<AuthSession>(
    generateQueryKey(RequestKey.CurrentSession, user),
  );
  const { isReady, onSocialLogin, onPasswordLogin } = useLogin({
    session,
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
