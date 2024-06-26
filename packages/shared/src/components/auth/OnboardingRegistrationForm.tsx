import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { checkKratosEmail } from '../../lib/kratos';
import { AuthFormProps, getFormEmail, providerMap } from './common';
import OrDivider from './OrDivider';
import LogContext from '../../contexts/LogContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import AuthForm from './AuthForm';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';

const signupProviders = [providerMap.google, providerMap.github];

interface ClassName {
  onboardingSignup?: string;
  onboardingForm?: string;
  onboardingDivider?: string;
}

interface OnboardingRegistrationFormProps extends AuthFormProps {
  onExistingEmail?: (email: string) => unknown;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  trigger: AuthTriggersType;
  isReady: boolean;
  className?: ClassName;
  onboardingSignupButton?: ButtonProps<'button'>;
}

const OnboardingRegistrationForm = ({
  onSignup,
  onExistingEmail,
  onProviderClick,
  targetId,
  isReady,
  trigger,
  className,
  onboardingSignupButton,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const [shouldLogin, setShouldLogin] = useState(false);
  const [registerEmail, setRegisterEmail] = useState<string>(null);
  const { mutateAsync: checkEmail, isLoading } = useMutation(
    (emailParam: string) => checkKratosEmail(emailParam),
  );
  const onboardingSignupButtonProps = {
    size: ButtonSize.Large,
    variant: ButtonVariant.Primary,
    ...onboardingSignupButton,
  };

  useEffect(() => {
    logEvent({
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
    if (isLoading) {
      return null;
    }

    logEvent({
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
      <AuthForm
        className={classNames('mb-8 gap-8', className?.onboardingForm)}
        onSubmit={onEmailSignup}
      >
        <TextField
          leftIcon={<MailIcon size={IconSize.Small} />}
          required
          inputId="email"
          label="Email"
          type="email"
          name="email"
        />

        {shouldLogin && (
          <>
            <Alert type={AlertType.Error} flexDirection="flex-row">
              <AlertParagraph className="!mt-0 flex-1">
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

        <Button
          className="w-full"
          variant={ButtonVariant.Primary}
          type="submit"
          loading={!isReady || isLoading}
        >
          Sign up - Free forever ➔
        </Button>
      </AuthForm>
      <OrDivider
        className={classNames('mb-8', className?.onboardingDivider)}
        label="Or sign up with"
      />

      <div
        className={classNames(
          'flex flex-col gap-8 pb-8',
          className.onboardingSignup,
        )}
      >
        {signupProviders.map((provider) => (
          <Button
            key={provider.value}
            icon={provider.icon}
            loading={!isReady}
            onClick={() => onSocialClick(provider.value)}
            {...onboardingSignupButtonProps}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default OnboardingRegistrationForm;
