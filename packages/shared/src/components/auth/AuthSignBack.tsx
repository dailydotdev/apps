import React, { ReactElement, ReactNode, useState } from 'react';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { ColumnContainer, Provider, providerMap } from './common';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthSignBackProps {
  children?: ReactNode;
  onClose?: CloseModalFunc;
}

const providers = Object.values(providerMap);

export const SIGNIN_METHOD_KEY = 'signin_method';

export const AuthSignBack = ({
  children,
  onClose,
}: AuthSignBackProps): ReactElement => {
  const [signback] = useState<Provider>(() => {
    const method = storage.getItem(SIGNIN_METHOD_KEY);
    storage.removeItem(SIGNIN_METHOD_KEY);
    return providerMap[method];
  });

  return (
    <>
      <AuthModalHeader title="Login to daily.dev" onClose={onClose} />
      <ColumnContainer>
        <ProviderButton
          provider={signback.provider}
          label="Login with"
          {...signback}
        />
        <OrDivider />
        <div className="grid grid-cols-4 gap-3 w-fit">
          {providers
            .filter(({ provider }) => provider !== signback.provider)
            .map(({ provider, style, ...props }) => (
              <ProviderButton
                key={provider}
                provider={provider}
                style={{ ...style, width: '3.875rem' }}
                {...props}
              />
            ))}
        </div>
        {children}
      </ColumnContainer>
    </>
  );
};
