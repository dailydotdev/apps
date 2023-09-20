import React, {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useEffect,
} from 'react';
import AuthHeader from './AuthHeader';
import { AuthFormProps, providerMap } from './common';
import AuthModalFooter from './AuthModalFooter';
import AuthContainer from './AuthContainer';
import { useSignBack } from '../../hooks/auth/useSignBack';
import { ProfilePicture } from '../ProfilePicture';
import { SignBackButton } from './SignBackButton';
import LoginForm, { LoginFormProps } from './LoginForm';
import ConditionalWrapper from '../ConditionalWrapper';

interface AuthSignBackProps extends AuthFormProps {
  children?: ReactNode;
  isLoginFlow?: boolean;
  isConnectedAccount?: boolean;
  onRegister?: () => void;
  onProviderClick?: (provider: string) => unknown;
  loginFormProps?: LoginFormProps;
  onShowLoginOptions?: MouseEventHandler;
}

export const AuthSignBack = ({
  loginFormProps,
  onRegister,
  isLoginFlow,
  onProviderClick,
  simplified,
  onShowLoginOptions,
  isConnectedAccount,
}: AuthSignBackProps): ReactElement => {
  const { signBack, provider, isLoaded } = useSignBack();
  const providerItem = providerMap[provider];
  const isValid = signBack && (provider === 'password' || !!providerItem);

  useEffect(() => {
    if (!isLoaded || isValid) {
      return;
    }

    const showLoginFn = isLoginFlow ? onShowLoginOptions : onRegister;
    showLoginFn?.(null);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, isValid]);

  if (!isLoaded || !signBack || !isValid) {
    return null;
  }

  return (
    <span className="flex flex-col flex-1">
      <AuthHeader simplified={simplified} title="Welcome back!" />
      <AuthContainer className="items-center">
        <p className="mb-2 text-center typo-callout text-theme-label-secondary">
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
            <div className="relative">
              {component}
              <span className="absolute right-0 bottom-0 p-1 bg-white rounded-8 text-theme-label-invert">
                {providerItem.icon}
              </span>
            </div>
          )}
        >
          <ProfilePicture user={signBack} size="xxxxlarge" />
        </ConditionalWrapper>
        <span className="mt-1 mb-5 font-bold typo-center">
          {signBack.email}
        </span>
        {provider === 'password' ? (
          <LoginForm
            {...loginFormProps}
            email={loginFormProps.email || signBack.email}
          />
        ) : (
          <SignBackButton
            signBack={signBack}
            provider={provider}
            onClick={() => onProviderClick(provider)}
          />
        )}
        <div className="flex flex-1" />
        <AuthModalFooter
          text={{ body: 'Not you?', button: 'Use another account' }}
          onClick={onShowLoginOptions}
        />
        <AuthModalFooter
          text={{ body: "Don't have an account?", button: 'Sign up' }}
          className={{ container: '!border-none pt-0 h-auto' }}
          onClick={onRegister}
        />
      </AuthContainer>
    </span>
  );
};
