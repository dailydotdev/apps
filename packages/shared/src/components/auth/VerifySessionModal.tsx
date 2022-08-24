import React, { ReactElement, useContext, useState } from 'react';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import { providers } from './common';
import AuthDefault from './AuthDefault';
import { ModalProps, StyledModal } from '../modals/StyledModal';
import styles from './VerifySessionModal.module.css';
import { LoginFormParams } from './LoginForm';
import AuthContext from '../../contexts/AuthContext';
import { getKratosProviders } from '../../lib/kratos';
import { disabledRefetch } from '../../lib/func';

interface VerifySessionModalProps extends ModalProps {
  onSocialLogin?: (provider: string) => void;
  onPasswordLogin?: (params: LoginFormParams) => void;
}

function VerifySessionModal({
  onSocialLogin,
  onRequestClose,
  onPasswordLogin,
  ...props
}: VerifySessionModalProps): ReactElement {
  const { user } = useContext(AuthContext);
  const [hint, setHint] = useState('Enter your password to login');
  const { data: userProviders } = useQuery(
    ['providers', user?.id],
    () => getKratosProviders(user.id),
    { ...disabledRefetch },
  );
  const filteredProviders = providers.filter(({ provider }) =>
    userProviders?.result.indexOf(provider.toLocaleLowerCase()),
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
      />
    </StyledModal>
  );
}

export default VerifySessionModal;
