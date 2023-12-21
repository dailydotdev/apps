import React, { ReactElement, useContext } from 'react';
import { Button, ButtonVariant } from './buttons/ButtonV2';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { AuthTriggers } from '../lib/auth';
import { TargetType } from '../lib/analytics';

interface LoginButtonProps {
  className?: string;
}

enum ButtonCopy {
  Login = 'Log in',
  Signup = 'Sign up',
}
const getAnalyticsEvent = (copy: ButtonCopy): AnalyticsEvent => ({
  event_name: 'click',
  target_type:
    copy === ButtonCopy.Login
      ? TargetType.LoginButton
      : TargetType.SignupButton,
  target_id: 'header',
});

export default function LoginButton({
  className,
}: LoginButtonProps): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (copy: ButtonCopy) => {
    trackEvent(getAnalyticsEvent(copy));
    showLogin({
      trigger: AuthTriggers.MainButton,
      options: { isLogin: copy === ButtonCopy.Login },
    });
  };

  return (
    <span className="flex flex-row gap-4">
      <Button
        onClick={() => onClick(ButtonCopy.Login)}
        variant={ButtonVariant.Secondary}
        className={className}
      >
        {ButtonCopy.Login}
      </Button>
      <Button
        onClick={() => onClick(ButtonCopy.Signup)}
        variant={ButtonVariant.Primary}
        className={className}
      >
        {ButtonCopy.Signup}
      </Button>
    </span>
  );
}
