import React, { ReactElement, ReactNode, useState } from 'react';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { Provider, providerMap } from './common';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';
import AuthModalFooter from './AuthModalFooter';
import AuthContainer from './AuthContainer';

interface AuthSignBackProps {
  children?: ReactNode;
  onClose?: CloseModalFunc;
  onRegister?: () => void;
  onProviderClick?: (provider: string) => unknown;
}

const providers = Object.values(providerMap);

export const SIGNIN_METHOD_KEY = 'signin_method';

export const AuthSignBack = ({
  children,
  onClose,
  onRegister,
  onProviderClick,
}: AuthSignBackProps): ReactElement => {
  const [signback] = useState<Provider>(() => {
    const method = storage.getItem(SIGNIN_METHOD_KEY);
    storage.removeItem(SIGNIN_METHOD_KEY);
    const provider = providerMap[method];
    return provider || providerMap.google;
  });

  return (
    <>
      <AuthModalHeader title="Login to daily.dev" onClose={onClose} />
      <AuthContainer>
        <p className="mb-2 text-center typo-callout text-theme-label-tertiary">
          Sign back in with
        </p>
        <ProviderButton
          provider={signback.provider}
          label="Login with"
          onClick={() => onProviderClick?.(signback.provider)}
          {...signback}
        />
        <OrDivider />
        <div className="flex flex-row gap-3 justify-center">
          {providers
            .filter(({ provider }) => provider !== signback.provider)
            .map(({ provider, style, ...props }) => (
              <ProviderButton
                key={provider}
                provider={provider}
                buttonSize="large"
                style={{ ...style, width: '3.875rem' }}
                onClick={() => onProviderClick?.(provider)}
                {...props}
              />
            ))}
        </div>
        {children}
      </AuthContainer>
      <div className="flex flex-1" />
      <AuthModalFooter className="mt-4" isLogin onIsLogin={onRegister} />
    </>
  );
};
