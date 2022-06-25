import React, { ReactElement, ReactNode } from 'react';
import { ColumnContainer, providers } from './common';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  children?: ReactNode;
}

export const AuthDefault = ({ children }: AuthDefaultProps): ReactElement => {
  return (
    <ColumnContainer>
      {providers.map(({ provider, ...props }) => (
        <ProviderButton
          key={provider}
          provider={provider}
          label="Connect with"
          {...props}
        />
      ))}
      {children}
    </ColumnContainer>
  );
};
