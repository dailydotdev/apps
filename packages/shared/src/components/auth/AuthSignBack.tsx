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
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
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
            <div className="relative">
              {component}
              <span className="absolute bottom-0 right-0 rounded-8 bg-white p-1 text-surface-invert">
                {providerItem.icon}
              </span>
            </div>
          )}
        >
          <ProfilePicture user={signBack} size={ProfileImageSize.XXXXLarge} />
        </ConditionalWrapper>
        <span className="typo-center mb-5 mt-1 font-bold">
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
          className={{ container: 'h-auto !border-none pt-0' }}
          onClick={onRegister}
        />
      </AuthContainer>
    </span>
  );
};
