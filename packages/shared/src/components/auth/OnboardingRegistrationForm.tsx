import React, { ReactElement, useContext, useEffect, useState } from 'react';
import classNames from 'classnames';
import { AuthFormProps, providerMap } from './common';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthEventNames, AuthTriggersType } from '../../lib/auth';
import { Button, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';

const signupProviders = [providerMap.google, providerMap.github];

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
  className?: string;
}

const OnboardingRegistrationForm = ({
  onProviderClick,
  targetId,
  isReady,
  trigger,
  className,
}: OnboardingRegistrationFormProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shouldLogin] = useState(false);

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

  const onSocialClick = (provider: string) => {
    onProviderClick?.(provider, shouldLogin);
  };

  return (
    <div className={classNames('flex flex-col gap-8 pb-8', className)}>
      {signupProviders.map((provider) => (
        <Button
          key={provider.value}
          icon={provider.icon}
          loading={!isReady}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          onClick={() => onSocialClick(provider.value)}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  );
};

export default OnboardingRegistrationForm;
