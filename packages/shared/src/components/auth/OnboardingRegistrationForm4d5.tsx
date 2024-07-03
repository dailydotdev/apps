import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { checkKratosEmail } from '../../lib/kratos';
import { AuthFormProps, getFormEmail, providerMap } from './common';
import OrDivider from './OrDivider';
import LogContext from '../../contexts/LogContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import { Button, ButtonVariant } from '../buttons/Button';
import AuthForm from './AuthForm';
import { TextField } from '../fields/TextField';
import { MailIcon } from '../icons';
import { IconSize } from '../Icon';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { OnboardingHeadline } from './OnboardingHeadline';
import AuthModalFooter from './AuthModalFooter';
import Logo, { LogoPosition } from '../Logo';
import { ModalClose } from '../modals/common/ModalClose';
import { CloseAuthModalFunc } from '../../hooks/useAuthForms';

const signupProviders = [providerMap.google, providerMap.github];

interface OnboardingRegistrationForm4d5Props extends AuthFormProps {
  onExistingEmail?: (email: string) => unknown;
  onSignup?: (email: string) => unknown;
  onProviderClick?: (provider: string, login?: boolean) => unknown;
  targetId?: string;
  isLoginFlow?: boolean;
  logInTitle?: string;
  signUpTitle?: string;
  trigger: AuthTriggersType;
  isReady: boolean;
  className?: string;
  onClose?: CloseAuthModalFunc;
  onShowLoginOptions?: () => void;
}

export const OnboardingRegistrationForm4d5 = ({
  onSignup,
  onExistingEmail,
  onProviderClick,
  targetId,
  isReady,
  trigger,
  className,
  onClose,
  onShowLoginOptions,
}: OnboardingRegistrationForm4d5Props): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const [shouldLogin, setShouldLogin] = useState(false);
  const [registerEmail, setRegisterEmail] = useState<string>(null);
  const { mutateAsync: checkEmail, isLoading } = useMutation(
    (emailParam: string) => checkKratosEmail(emailParam),
  );

  useEffect(() => {
    logEvent({
      event_name: AuthEventNames.OpenSignup,
      extra: JSON.stringify({ trigger }),
      target_id: targetId,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className={classNames(className, 'flex flex-1 flex-col p-6')}>
        <div className="relative mb-auto flex items-center justify-between">
          <Logo
            position={LogoPosition.Relative}
            logoClassName={{ container: 'h-6' }}
            linkDisabled
          />
          <ModalClose right="0" onClick={onClose} />
        </div>

        <OnboardingHeadline
          className={{
            title: 'typo-large-title',
            description: 'typo-body',
          }}
        />

        <AuthForm className="mb-8 gap-8" onSubmit={onEmailSignup}>
          <TextField
            leftIcon={<MailIcon size={IconSize.Small} />}
            required
            inputId="email"
            label="Email address"
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

        <OrDivider className="mb-8" label="Or sign up with" />

        <div className="flex gap-8">
          {signupProviders.map((provider) => (
            <Button
              key={provider.value}
              className="flex flex-1 bg-theme-active text-white"
              icon={provider.icon}
              loading={!isReady}
              onClick={() => onSocialClick(provider.value)}
            >
              {provider.label}
            </Button>
          ))}
        </div>
      </div>

      <AuthModalFooter
        text={{
          body: 'Already using daily.dev?',
          button: 'Log in',
        }}
        onClick={onShowLoginOptions}
      />
    </>
  );
};
