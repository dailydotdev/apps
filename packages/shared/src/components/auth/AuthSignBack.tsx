import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import AuthHeader from './AuthHeader';
import type { AuthFormProps, SocialProvider } from './common';
import { providerMap } from './common';
import AuthModalFooter from './AuthModalFooter';
import AuthContainer from './AuthContainer';
import { useSignBack } from '../../hooks/auth/useSignBack';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { SignBackButton } from './SignBackButton';
import type { LoginFormProps } from './LoginForm';
import LoginForm from './LoginForm';
import ConditionalWrapper from '../ConditionalWrapper';

interface AuthSignBackProps extends AuthFormProps {
  children?: ReactNode;
  isLoginFlow?: boolean;
  isConnectedAccount?: boolean;
  onRegister?: () => void;
  onProviderClick?: (provider: string) => unknown;
  isProviderLoading?: boolean;
  loginFormProps?: LoginFormProps;
  onShowLoginOptions?: () => void;
}

export const AuthSignBack = ({
  loginFormProps,
  onRegister,
  isLoginFlow,
  onProviderClick,
  isProviderLoading,
  simplified,
  onShowLoginOptions,
  isConnectedAccount,
}: AuthSignBackProps): ReactElement | null => {
  const { signBack, provider, isLoaded } = useSignBack();
  const socialProvider =
    provider && provider !== 'password'
      ? (provider as SocialProvider)
      : undefined;
  const providerItem = socialProvider ? providerMap[socialProvider] : undefined;
  const isValid = signBack && (provider === 'password' || !!providerItem);
  const handleShowLoginOptions = (): void => {
    onShowLoginOptions?.();
  };
  const handleRegister = (): void => {
    onRegister?.();
  };
  const handleProviderClick = (): void => {
    if (!socialProvider || !onProviderClick) {
      return;
    }

    onProviderClick(socialProvider);
  };

  useEffect(() => {
    if (!isLoaded || isValid) {
      return;
    }

    if (isLoginFlow) {
      onShowLoginOptions?.();
      return;
    }

    onRegister?.();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isValid]);

  if (!isLoaded || !signBack || !isValid) {
    return null;
  }

  if (provider === 'password' && !loginFormProps) {
    return null;
  }

  const renderAuthAction = () => {
    if (provider === 'password') {
      if (!loginFormProps) {
        return null;
      }

      return (
        <LoginForm
          {...loginFormProps}
          email={loginFormProps.email ?? signBack.email}
        />
      );
    }

    if (!socialProvider) {
      return null;
    }

    return (
      <SignBackButton
        disabled={isProviderLoading}
        signBack={signBack}
        provider={socialProvider}
        onClick={handleProviderClick}
      />
    );
  };

  return (
    <span className="flex flex-1 flex-col">
      <AuthHeader simplified={simplified} title="Welcome back!" />
      <AuthContainer className="items-center">
        <p className="mb-2 text-center text-text-secondary typo-callout">
          Log in to access your account
          {isConnectedAccount ? (
            <>
              {' '}
              using previously connected method{' '}
              <strong>
                <em>(as shown below)</em>
              </strong>
            </>
          ) : (
            ''
          )}
        </p>
        <ConditionalWrapper
          condition={provider !== 'password'}
          wrapper={(component) => (
            <div className="relative" aria-hidden>
              {component}
              <span className="absolute bottom-0 right-0 rounded-8 bg-white p-1 text-surface-invert">
                {providerItem?.icon}
              </span>
            </div>
          )}
        >
          <ProfilePicture user={signBack} size={ProfileImageSize.XXXXLarge} />
        </ConditionalWrapper>
        <span className="typo-center mb-5 mt-1 font-bold">
          {signBack.email}
        </span>
        {renderAuthAction()}
        <div className="flex flex-1" />
        <AuthModalFooter
          text={{ body: 'Not you?', button: 'Use another account' }}
          onClick={handleShowLoginOptions}
        />
        <AuthModalFooter
          text={{ body: "Don't have an account?", button: 'Sign up' }}
          className={{ container: 'h-auto !border-none pt-0' }}
          onClick={handleRegister}
        />
      </AuthContainer>
    </span>
  );
};
