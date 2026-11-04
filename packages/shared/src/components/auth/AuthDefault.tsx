import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AuthFormProps, Provider } from './common';
import { MailIcon } from '../icons';
import SignupDisclaimer from './SignupDisclaimer';
import LoginForm from './LoginForm';
import type { LoginFormParams, LoginHintState } from './LoginForm';
import { useLogContext } from '../../contexts/LogContext';
import type { AuthTriggersType } from '../../lib/auth';
import { AuthEventNames } from '../../lib/auth';
import AuthContainer from './AuthContainer';
import AuthHeader from './AuthHeader';
import ConditionalWrapper from '../ConditionalWrapper';
import OrDivider from './OrDivider';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';

const AuthModalFooter = dynamic(
  () => import(/* webpackChunkName: "authModalFooter" */ './AuthModalFooter'),
);

type EmailLoginState = [boolean, Dispatch<SetStateAction<boolean>>];

interface AuthDefaultProps extends AuthFormProps {
  children?: ReactNode;
  loginHint?: LoginHintState;
  onPasswordLogin?: (params: LoginFormParams) => void;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  onForgotPassword?: (email?: string) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  initialLoginFlow?: boolean;
  onBack?: () => void;
  logInTitle?: string;
  signUpTitle?: string;
  providers: Provider[];
  trigger: AuthTriggersType;
  disableRegistration?: boolean;
  disablePassword?: boolean;
  isLoading?: boolean;
  isSocialAuthLoading?: boolean;
  isReady: boolean;
  loginButton?: string;
  onAuthOpenLogged?: () => void;
  emailLogin?: EmailLoginState;
  hasTopBarBack?: boolean;
  loginEmail?: string;
}

const AuthDefault = ({
  loginHint,
  onSignup,
  onProviderClick,
  onForgotPassword,
  onPasswordLogin,
  targetId,
  isLoginFlow,
  initialLoginFlow,
  onBack,
  providers,
  disableRegistration,
  disablePassword,
  isLoading,
  isSocialAuthLoading,
  isReady,
  trigger,
  signUpTitle = 'Sign up for daily.dev',
  logInTitle = 'Log in to daily.dev',
  loginButton,
  simplified,
  onAuthOpenLogged,
  emailLogin,
  hasTopBarBack,
  loginEmail,
}: AuthDefaultProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [shouldLogin, setShouldLogin] = useState(isLoginFlow);
  const fallbackLoginHint = useState<string | null>(null);
  const resolvedLoginHint = loginHint ?? fallbackLoginHint;
  const fallbackEmailLogin = useState(false);
  const [isEmailLogin, setIsEmailLogin] = emailLogin ?? fallbackEmailLogin;
  const socialLoginListRef = useRef<HTMLDivElement>(null);

  const focusFirstSocialLink = () => {
    if (!socialLoginListRef.current) {
      return;
    }
    const firstChild = socialLoginListRef.current.children[0];
    if (!(firstChild instanceof HTMLElement)) {
      return;
    }
    firstChild.focus();
  };

  useEffect(() => {
    logEvent({
      event_name: shouldLogin
        ? AuthEventNames.OpenLogin
        : AuthEventNames.OpenSignup,
      extra: JSON.stringify({ trigger }),
      target_id: targetId,
    });

    onAuthOpenLogged?.();
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLogin]);

  const onEmailClick = () => {
    logEvent({
      event_name: 'click',
      target_type: shouldLogin
        ? AuthEventNames.LoginProvider
        : AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger }),
    });

    if (shouldLogin) {
      resolvedLoginHint[1](null);
      setIsEmailLogin(true);
      return;
    }

    onSignup?.('');
  };

  const toggleLogin = () => {
    focusFirstSocialLink();
    setIsEmailLogin(false);
    setShouldLogin(!shouldLogin);
  };

  const isInitialMode =
    initialLoginFlow === undefined || !!shouldLogin === initialLoginFlow;
  const onHeaderBack = isInitialMode ? onBack : toggleLogin;

  const onSocialClick = (provider: string) => {
    onProviderClick?.(provider, shouldLogin);
  };

  const hasEmailLoginScreen =
    !!shouldLogin && !disableRegistration && !disablePassword;
  const isEmailLoginScreen = hasEmailLoginScreen && isEmailLogin;
  const listTitle = shouldLogin ? logInTitle : signUpTitle;
  const title = isEmailLoginScreen ? 'Log in' : listTitle;

  const getHeaderBack = () => {
    if (isEmailLoginScreen) {
      return hasTopBarBack ? undefined : () => setIsEmailLogin(false);
    }

    return simplified ? undefined : onHeaderBack;
  };

  const getForm = () => {
    if (isEmailLoginScreen || (disableRegistration && !disablePassword)) {
      return (
        <LoginForm
          isReady={isReady}
          isLoading={isLoading}
          email={loginEmail}
          loginButton={loginButton}
          aboveFooter={!simplified && !disableRegistration}
          loginButtonVariant={
            !isEmailLoginScreen && providers.length
              ? ButtonVariant.Secondary
              : ButtonVariant.Primary
          }
          loginHint={resolvedLoginHint}
          onPasswordLogin={onPasswordLogin}
          onForgotPassword={onForgotPassword}
          onSignup={() => {
            setIsEmailLogin(false);
            setShouldLogin(false);
          }}
        />
      );
    }

    return null;
  };

  const form = getForm();
  const isSignup = !shouldLogin && !disableRegistration;

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title={title}
        onBack={getHeaderBack()}
      />
      <AuthContainer className={disableRegistration ? 'mb-6' : undefined}>
        {!isEmailLoginScreen && (
          <div
            aria-label="Social login buttons"
            className="flex flex-col gap-4"
            ref={socialLoginListRef}
            role="list"
          >
            {providers.map(({ label, value, icon }, index) => (
              <Button
                aria-label={`Continue with ${label}`}
                autoFocus={index === 0}
                disabled={!isReady || isSocialAuthLoading}
                icon={React.cloneElement(icon, { size: IconSize.Medium })}
                key={label}
                loading={!isReady || isSocialAuthLoading}
                onClick={() => onSocialClick(value)}
                size={ButtonSize.Large}
                type="button"
                variant={ButtonVariant.Primary}
              >
                Continue with {label}
              </Button>
            ))}
            {(isSignup || hasEmailLoginScreen) && (
              <Button
                aria-label="Continue with email"
                disabled={!isReady || isSocialAuthLoading}
                icon={<MailIcon secondary size={IconSize.Medium} />}
                onClick={onEmailClick}
                size={ButtonSize.Large}
                type="button"
                variant={ButtonVariant.Primary}
              >
                Continue with email
              </Button>
            )}
          </div>
        )}
        {form && !isEmailLoginScreen && providers.length > 0 && <OrDivider />}
        {form}
      </AuthContainer>
      <div className="flex flex-1" />
      {isSignup && (
        <SignupDisclaimer className="mt-6 text-balance px-6 !text-text-tertiary" />
      )}
      {!disableRegistration && (
        <ConditionalWrapper
          condition={simplified ?? false}
          wrapper={(component) => <AuthContainer>{component}</AuthContainer>}
        >
          <AuthModalFooter
            className={{ container: 'mt-4' }}
            pinned={!simplified}
            text={{
              body: shouldLogin
                ? "Don't have an account?"
                : 'Already have an account?',
              button: shouldLogin ? 'Sign up' : 'Log in',
            }}
            onClick={toggleLogin}
          />
        </ConditionalWrapper>
      )}
    </>
  );
};

export default AuthDefault;
