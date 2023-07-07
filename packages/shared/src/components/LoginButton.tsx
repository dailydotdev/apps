import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from './buttons/Button';
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
    showLogin(AuthTriggers.MainButton, { isLogin: copy === ButtonCopy.Login });
  };

  return (
    <span className="flex flex-row gap-4">
      <Button
        onClick={() => onClick(ButtonCopy.Login)}
        className={classNames(className, 'btn-secondary')}
      >
        {ButtonCopy.Login}
      </Button>
      <Button
        onClick={() => onClick(ButtonCopy.Signup)}
        className={classNames(className, 'btn-primary')}
      >
        {ButtonCopy.Signup}
      </Button>
    </span>
  );
}
