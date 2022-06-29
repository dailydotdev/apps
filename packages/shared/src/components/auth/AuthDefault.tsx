import React, { ReactElement, ReactNode } from 'react';
import { ColumnContainer, providers } from './common';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  children?: ReactNode;
  onProviderClick?: (provider: string) => unknown;
}

export const AuthDefault = ({
  children,
  onProviderClick,
}: AuthDefaultProps): ReactElement => {
  return (
    <ColumnContainer>
      {providers.map(({ provider, ...props }) => (
        <ProviderButton
          key={provider}
          provider={provider}
          label="Connect with"
          onClick={() => onProviderClick(provider)}
          {...props}
        />
      ))}
      {children}
    </ColumnContainer>
  );
};
