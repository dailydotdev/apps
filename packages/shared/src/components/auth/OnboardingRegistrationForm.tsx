import React, {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useMutation } from 'react-query';
import { checkKratosEmail } from '../../lib/kratos';
import { AuthFormProps, providerMap } from './common';
import OrDivider from './OrDivider';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthEventNames, AuthTriggersOrString } from '../../lib/auth';
import { ExperimentWinner } from '../../lib/featureValues';
import { Button } from '../buttons/Button';
import AuthForm from './AuthForm';
import { TextField } from '../fields/TextField';
import MailIcon from '../icons/Mail';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';

const signupProviders = [providerMap.google, providerMap.github];

interface OnboardingRegistrationFormProps extends AuthFormProps {
  onExistingEmail?: (email: string) => unknown;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  trigger: AuthTriggersOrString;
  isReady: boolean;
}

const OnboardingRegistrationForm = ({
  onSignup,
  onExistingEmail,
  onProviderClick,
  targetId,
  isReady,
  trigger,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shouldLogin, setShouldLogin] = useState(false);
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

  const getFormEmail = useCallback((e: React.FormEvent) => {
    const form = e.currentTarget as HTMLFormElement;
    const input = Array.from(form.elements).find(
      (el) => el.getAttribute('name') === 'email',
    ) as HTMLInputElement;

    return input?.value?.trim();
  }, []);

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
      return setShouldLogin(true);
    }

    return onSignup(email);
  };

  const onSocialClick = (provider: string) => {
    onProviderClick?.(provider, shouldLogin);
  };

  return (
    <>
      <AuthForm className="gap-8 mb-8" onSubmit={onEmailSignup}>
        <TextField
          leftIcon={<MailIcon size={IconSize.Small} />}
          inputId="email"
          label="Email"
          type="email"
          name="email"
        />

        {shouldLogin && (
          <>
            <Alert type={AlertType.Error} flexDirection="flex-row">
              <AlertParagraph className="flex-1 !mt-0">
                Email is taken. Existing user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    onExistingEmail(registerEmail);
                  }}
                  className="font-bold underline"
                >
                  Log in.
                </button>
              </AlertParagraph>
            </Alert>
          </>
        )}

        <Button className="w-full btn-primary" type="submit" loading={!isReady}>
          Sign up - it&rsquo;s free ➔
        </Button>
      </AuthForm>

      <OrDivider className="mb-8" label="Or sign up with" />

      <div className="flex gap-8">
        {signupProviders.map((provider) => (
          <Button
            key={provider.value}
            className="flex flex-1 text-white bg-theme-active"
            icon={provider.icon}
            loading={!isReady}
            onClick={() => onSocialClick(provider.value)}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default OnboardingRegistrationForm;
