import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
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
import { ClickableText } from '../buttons/ClickableText';
import { AuthScreenTitle } from './AuthScreenTitle';

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
  logInDescription?: string;
  signUpDescription?: string;
  /** Sign-up's options, when they differ from log-in's. */
  signupProviders?: Provider[];
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
  /** The daily.dev for Startups page lays this out as its own full-page step. */
  isStartups?: boolean;
  onLogInChange?: (isLogIn: boolean) => void;
  /** Shown on the screen, for a page without toasts in its flow. */
  socialError?: string;
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
  signUpDescription,
  logInDescription,
  signupProviders,
  loginButton,
  simplified,
  onAuthOpenLogged,
  emailLogin,
  hasTopBarBack,
  loginEmail,
  isStartups,
  onLogInChange,
  socialError,
}: AuthDefaultProps): ReactElement => {
  const { logEvent } = useLogContext();
  const [shouldLogin, setShouldLogin] = useState(isLoginFlow);
  const fallbackLoginHint = useState<string | null>(null);
  const resolvedLoginHint = loginHint ?? fallbackLoginHint;
  const fallbackEmailLogin = useState(false);
  const [isEmailLogin, setIsEmailLogin] = emailLogin ?? fallbackEmailLogin;
  const socialLoginListRef = useRef<HTMLDivElement>(null);
  const [clickedProvider, setClickedProvider] = useState<string>();

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
    onLogInChange?.(!!shouldLogin);
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
    setClickedProvider(provider);
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
          email={loginEmail || undefined}
          loginButton={loginButton}
          autoFocus={!isStartups}
          aboveFooter={!simplified && !disableRegistration}
          loginButtonVariant={
            !isEmailLoginScreen && providers.length
              ? ButtonVariant.Secondary
              : ButtonVariant.Primary
          }
          loginHint={resolvedLoginHint}
          onPasswordLogin={onPasswordLogin}
          onForgotPassword={onForgotPassword}
          isStartups={isStartups}
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

  const listedProviders = shouldLogin
    ? providers
    : (signupProviders ?? providers);
  const orderedProviders = isStartups
    ? [...listedProviders].sort(
        (a, b) => Number(b.value === 'github') - Number(a.value === 'github'),
      )
    : listedProviders;

  const entryOptions = !isEmailLoginScreen && (
    <div
      aria-label="Social login buttons"
      className={classNames('flex flex-col', isStartups ? 'gap-3' : 'gap-4')}
      ref={socialLoginListRef}
      role="list"
    >
      {orderedProviders.map(({ label, value, icon }, index) => (
        <Button
          aria-label={`Continue with ${label}`}
          autoFocus={index === 0 && !signupProviders}
          disabled={!isReady || isSocialAuthLoading}
          icon={React.cloneElement(
            icon,
            isStartups
              ? { size: IconSize.XSmall, secondary: true }
              : { size: IconSize.Medium },
          )}
          key={label}
          loading={
            isStartups
              ? isSocialAuthLoading && clickedProvider === value
              : !isReady || isSocialAuthLoading
          }
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
          icon={
            <MailIcon
              secondary
              size={isStartups ? IconSize.XSmall : IconSize.Medium}
            />
          }
          onClick={onEmailClick}
          size={ButtonSize.Large}
          type="button"
          variant={ButtonVariant.Primary}
        >
          Continue with email
        </Button>
      )}
    </div>
  );

  if (isStartups) {
    const description = shouldLogin ? logInDescription : signUpDescription;

    return (
      <div className="flex flex-col gap-6">
        {isEmailLoginScreen ? (
          <AuthScreenTitle
            title="Log in with email"
            description="Then pick the page this plan is for."
          />
        ) : (
          <AuthScreenTitle title={listTitle} description={description} />
        )}
        {entryOptions}
        {form}
        {!isEmailLoginScreen && (
          <div className="flex flex-wrap items-center gap-1 text-text-secondary typo-callout">
            {shouldLogin ? 'New to daily.dev?' : 'Already have an account?'}
            <ClickableText inverseUnderline onClick={toggleLogin}>
              {shouldLogin ? 'Sign up' : 'Log in'}
            </ClickableText>
          </div>
        )}
        {isSignup && (
          <SignupDisclaimer className="!text-left !text-text-tertiary" />
        )}
        {socialError && (
          <p
            role="alert"
            className="rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3 typo-callout"
          >
            {socialError}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        simplified={simplified}
        title={title}
        onBack={getHeaderBack()}
      />
      {(shouldLogin ? logInDescription : signUpDescription) &&
        !isEmailLoginScreen && (
          <p className="mt-2 text-center text-text-secondary typo-callout">
            {shouldLogin ? logInDescription : signUpDescription}
          </p>
        )}
      <AuthContainer className={disableRegistration ? 'mb-6' : undefined}>
        {entryOptions}
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
