import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import { checkKratosEmail } from '../../lib/kratos';
import AuthModalFooter from './AuthModalFooter';
import { AuthFormProps, Provider, getFormEmail } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm, { LoginFormParams } from './LoginForm';
import OrDivider from './OrDivider';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import AuthContainer from './AuthContainer';
import AuthHeader from './AuthHeader';
import ConditionalWrapper from '../ConditionalWrapper';
import { useToastNotification } from '../../hooks/useToastNotification';
import { Button, ButtonSize } from '../buttons/Button';

interface AuthDefaultProps extends AuthFormProps {
  children?: ReactNode;
  loginHint?: ReturnType<typeof useState>;
  onPasswordLogin?: (params: LoginFormParams) => void;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  onForgotPassword?: (email?: string) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  providers: Provider[];
  trigger: AuthTriggersType;
  disableRegistration?: boolean;
  disablePassword?: boolean;
  isLoading?: boolean;
  isReady: boolean;
  loginButton?: string;
}

const AuthDefault = ({
  loginHint,
  onSignup,
  onProviderClick,
  onForgotPassword,
  onPasswordLogin,
  targetId,
  isLoginFlow,
  providers,
  disableRegistration,
  disablePassword,
  isLoading,
  isReady,
  trigger,
  signUpTitle = 'Sign up',
  logInTitle = 'Log in',
  loginButton,
  simplified,
}: AuthDefaultProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shouldLogin, setShouldLogin] = useState(isLoginFlow);
  const title = shouldLogin ? logInTitle : signUpTitle;
  const { displayToast } = useToastNotification();
  const [registerEmail, setRegisterEmail] = useState<string>(null);
  const { mutateAsync: checkEmail } = useMutation((emailParam: string) =>
    checkKratosEmail(emailParam),
  );

  useEffect(() => {
    trackEvent({
      event_name: shouldLogin
        ? AuthEventNames.OpenLogin
        : AuthEventNames.OpenSignup,
      extra: JSON.stringify({ trigger }),
      target_id: targetId,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldLogin]);

  const onEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    trackEvent({
      event_name: 'click',
      target_type: AuthEventNames.SignUpProvider,
      target_id: 'email',
      extra: JSON.stringify({ trigger }),
    });

    const email = getFormEmail(e);

    if (!email) {
      return null;
    }

    const res = await checkEmail(email);

    if (res?.result) {
      setRegisterEmail(email);
      displayToast(
        "There's already an account for the same credentials. Can you please try logging in instead?",
      );
      return setShouldLogin(true);
    }

    return onSignup(email);
  };

  const onSocialClick = (provider: string) => {
    onProviderClick?.(provider, shouldLogin);
  };

  const getForm = () => {
    if (disablePassword && disableRegistration) {
      return null;
    }

    if (!disablePassword && (shouldLogin || disableRegistration)) {
      return (
        <LoginForm
          isReady={isReady}
          isLoading={isLoading}
          email={registerEmail}
          loginButton={loginButton}
          loginHint={loginHint}
          onPasswordLogin={onPasswordLogin}
          onForgotPassword={onForgotPassword}
          onSignup={() => setShouldLogin(false)}
        />
      );
    }

    return <EmailSignupForm onSubmit={onEmailSignup} isReady={isReady} />;
  };

  const getOrDivider = () => {
    if (!providers.length || disablePassword) {
      return null;
    }

    return <OrDivider />;
  };

  return (
    <>
      <AuthHeader simplified={simplified} title={title} />
      {simplified && !shouldLogin && (
        <p className="px-6 mt-3 text-center whitespace-pre-line text-theme-label-secondary typo-body">
          Once you sign up, your personal feed will be ready to explore.
        </p>
      )}
      <AuthContainer className={disableRegistration && 'mb-6'}>
        <div className="flex flex-col gap-4">
          {providers.map(({ label, value, icon }) => (
            <Button
              key={label}
              icon={icon}
              className="btn-primary"
              buttonSize={ButtonSize.Large}
              onClick={() => onSocialClick(value)}
              loading={!isReady}
            >
              {label}
            </Button>
          ))}
        </div>
        {getOrDivider()}
        {getForm()}
      </AuthContainer>
      <div className="flex flex-1" />
      {!disableRegistration && (
        <ConditionalWrapper
          condition={simplified}
          wrapper={(component) => <AuthContainer>{component}</AuthContainer>}
        >
          <AuthModalFooter
            className={{ container: 'mt-4' }}
            text={{
              body: shouldLogin
                ? 'Not a member yet?'
                : 'Already a daily.dev member?',
              button: shouldLogin ? 'Sign up' : 'Log in',
            }}
            onClick={() => {
              if (!shouldLogin) {
                setRegisterEmail(null);
              }
              setShouldLogin(!shouldLogin);
            }}
          />
        </ConditionalWrapper>
      )}
    </>
  );
};

export default AuthDefault;
