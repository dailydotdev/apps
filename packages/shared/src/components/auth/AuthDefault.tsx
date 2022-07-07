import React, { ReactElement, ReactNode, useState } from 'react';
import { CloseModalFunc } from '../modals/common';
import AuthModalFooter from './AuthModalFooter';
import AuthModalHeader from './AuthModalHeader';
import { ColumnContainer, providers } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';

interface AuthDefaultProps {
  children?: ReactNode;
  onClose?: CloseModalFunc;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string) => unknown;
  onForgotPassword?: () => unknown;
}

export const AuthDefault = ({
  onClose,
  onSignup,
  onProviderClick,
  onForgotPassword,
}: AuthDefaultProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(false);

  const onLogin = () => {};

  const onEmailSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'email',
    ) as HTMLInputElement;

    if (!input?.value?.trim()) {
      return null;
    }

    return onSignup(input.value.trim());
  };

  return (
    <>
      <AuthModalHeader title="Sign up to daily.dev" onClose={onClose} />
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
        <OrDivider />
        {shouldLogin ? (
          <LoginForm onSubmit={onLogin} onForgotPassword={onForgotPassword} />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} />
        )}
      </ColumnContainer>
      <div className="flex flex-1" />
      <AuthModalFooter
        className="mt-4"
        shouldLogin={shouldLogin}
        onShouldLogin={setShouldLogin}
      />
    </>
  );
};
