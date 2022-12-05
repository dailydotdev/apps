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
import AuthModalHeading from './AuthModalHeading';
import { SIGNIN_METHOD_KEY } from './AuthSignBack';
import { Provider } from './common';
import EmailSignupForm from './EmailSignupForm';
import LoginForm, { LoginFormParams } from './LoginForm';
import OrDivider from './OrDivider';
import ProviderButton from './ProviderButton';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthEventNames, AuthTriggersOrString } from '../../lib/auth';
import AuthContainer from './AuthContainer';
import FeaturesContext from '../../contexts/FeaturesContext';
import AuthModalHeader from './AuthModalHeader';

interface AuthDefaultProps {
  children?: ReactNode;
  loginHint?: ReturnType<typeof useState>;
  onPasswordLogin?: (params: LoginFormParams) => void;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  onForgotPassword?: () => unknown;
  targetId?: string;
  isV2?: boolean;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  providers: Provider[];
  trigger: AuthTriggersOrString;
  disableRegistration?: boolean;
  disablePassword?: boolean;
  isLoading?: boolean;
  loginButton?: string;
}

const AuthDefault = ({
  loginHint,
  onSignup,
  onProviderClick,
  onForgotPassword,
  onPasswordLogin,
  targetId,
  isV2,
  isLoginFlow,
  providers,
  disableRegistration,
  disablePassword,
  isLoading,
  trigger,
  signUpTitle = 'Sign up to daily.dev',
  logInTitle = 'Log in to daily.dev',
  loginButton,
}: AuthDefaultProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shouldLogin, setShouldLogin] = useState(isLoginFlow || isV2);
  const { authVersion } = useContext(FeaturesContext);
  const title = shouldLogin ? logInTitle : signUpTitle;

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
      target_id: targetId || authVersion,
    });
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
          isLoading={isLoading}
          email={registerEmail}
          loginButton={loginButton}
          loginHint={loginHint}
          onPasswordLogin={onPasswordLogin}
          onForgotPassword={onForgotPassword}
        />
      );
    }

    return <EmailSignupForm onSubmit={onEmailSignup} isV2={isV2} />;
  };

  const getOrDivider = () => {
    if (isV2 || !providers.length || disablePassword) {
      return null;
    }

    return <OrDivider />;
  };

  return (
    <>
      <AuthModalHeader title={title} />
      <AuthContainer className={disableRegistration && 'mb-6'}>
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
              label={shouldLogin ? 'Log in with' : 'Sign up with'}
              className="mb-1"
              onClick={() => onSocialClick(provider.toLowerCase())}
              {...props}
            />
          ))}
        {getOrDivider()}
        {getForm()}
        {isV2 && (
          <div className="flex flex-row gap-5 justify-center mt-10">
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
      </AuthContainer>
      <div className="flex flex-1" />
      {!disableRegistration && (
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
      )}
    </>
  );
};

export default AuthDefault;
