import React, { ReactElement, ReactNode } from 'react';
import { CloseModalFunc } from '../modals/common';
import AuthModalHeader from './AuthModalHeader';
import { ColumnContainer, providerMap } from './common';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthSignBackProps {
  children?: ReactNode;
  onClose?: CloseModalFunc;
}

const { twitter, ...rest } = providerMap;
const providers = Object.values(rest);

export const AuthSignBack = ({
  children,
  onClose,
}: AuthSignBackProps): ReactElement => {
  return (
    <>
      <AuthModalHeader title="Login to daily.dev" onClose={onClose} />
      <ColumnContainer>
        <ProviderButton
          provider={twitter.provider}
          label="Login with"
          {...twitter}
        />
        <OrDivider />
        <div className="grid grid-cols-4 gap-3 w-fit">
          {providers.map(({ provider, style, ...props }) => (
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
