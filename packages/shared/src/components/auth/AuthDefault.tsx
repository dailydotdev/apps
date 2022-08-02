import React, { ReactElement, ReactNode, useState } from 'react';
import { CloseModalFunc } from '../modals/common';
import AuthModalFooter from './AuthModalFooter';
import AuthModalHeader from './AuthModalHeader';
import AuthModalHeading from './AuthModalHeading';
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
  isV2?: boolean;
}

const AuthDefault = ({
  onClose,
  onSignup,
  onProviderClick,
  onForgotPassword,
  isV2,
}: AuthDefaultProps): ReactElement => {
  const [shouldLogin, setShouldLogin] = useState(isV2);

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
        {isV2 && (
          <AuthModalHeading
            tag="h2"
            className="mb-14 text-center typo-large-title"
          >
            Unlock the full power of daily.dev!
          </AuthModalHeading>
        )}
        {!isV2 &&
          providers.map(({ provider, ...props }) => (
            <ProviderButton
              key={provider}
              provider={provider}
              label="Connect with"
              onClick={() => onProviderClick(provider.toLowerCase())}
              {...props}
            />
          ))}
        {!isV2 && <OrDivider />}
        {shouldLogin ? (
          <LoginForm
            onSuccessfulLogin={(e) => onClose(e)}
            onForgotPassword={onForgotPassword}
          />
        ) : (
          <EmailSignupForm onSubmit={onEmailSignup} isV2={isV2} />
        )}
        {isV2 && (
          <div className="flex flex-row gap-5 mt-10">
            {providers.map(({ provider, ...props }) => (
              <ProviderButton
                key={provider}
                provider={provider}
                onClick={() => onProviderClick(provider)}
                buttonSize="large"
                {...props}
              />
            ))}
          </div>
        )}
      </ColumnContainer>
      <div className="flex flex-1" />
      <AuthModalFooter
        className="mt-4"
        isLogin={shouldLogin}
        onIsLogin={setShouldLogin}
      />
    </>
  );
};

export default AuthDefault;
