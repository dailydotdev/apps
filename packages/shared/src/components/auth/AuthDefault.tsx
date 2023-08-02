import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import { checkKratosEmail } from '../../lib/kratos';
import { storageWrapper as storage } from '../../lib/storageWrapper';
import AuthModalFooter from './AuthModalFooter';
import { SIGNIN_METHOD_KEY } from './AuthSignBack';
import { AuthFormProps, Provider } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm, { LoginFormParams } from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthEventNames, AuthTriggersOrString } from '../../lib/auth';
import AuthContainer from './AuthContainer';
import AuthModalHeader from './AuthModalHeader';
import { ExperimentWinner } from '../../lib/featureValues';
import ConditionalWrapper from '../ConditionalWrapper';
import { useToastNotification } from '../../hooks/useToastNotification';

interface AuthDefaultProps extends AuthFormProps {
  children?: ReactNode;
  loginHint?: ReturnType<typeof useState>;
  onPasswordLogin?: (params: LoginFormParams) => void;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  onForgotPassword?: () => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  providers: Provider[];
  trigger: AuthTriggersOrString;
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
  signUpTitle = 'Sign up to daily.dev',
  logInTitle = 'Log in to daily.dev',
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
      target_id: targetId || ExperimentWinner.AuthVersion,
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

    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'email',
    ) as HTMLInputElement;
    const email = input?.value?.trim();

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

    return onSignup(input.value.trim());
  };

  const onSocialClick = (provider: string) => {
    storage.setItem(SIGNIN_METHOD_KEY, provider);
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
      {!simplified && <AuthModalHeader title={title} />}
      <AuthContainer className={disableRegistration && 'mb-6'}>
        {providers.map(({ provider, ...props }) => (
          <ProviderButton
            key={provider}
            provider={provider}
            label={shouldLogin ? 'Log in with' : 'Sign up with'}
            className="border-0 mb-1"
            onClick={() => onSocialClick(provider.toLowerCase())}
            loading={!isReady}
            {...props}
          />
        ))}
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
            className="mt-4"
            isLogin={shouldLogin}
            onIsLogin={(value) => {
              if (!value) {
                setRegisterEmail(null);
              }
              setShouldLogin(value);
            }}
          />
        </ConditionalWrapper>
      )}
    </>
  );
};

export default AuthDefault;
