import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { AuthTriggers } from '../lib/auth';
import { TargetType } from '../lib/analytics';

interface Copy {
  login?: string;
  signup?: string;
}

interface LoginButtonProps {
  className?: string;
  showLoginButton?: boolean;
  copy?: Copy;
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
  showLoginButton = true,
  copy = {},
}: LoginButtonProps): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (trackingCopy: ButtonCopy) => {
    trackEvent(getAnalyticsEvent(trackingCopy));
    showLogin(AuthTriggers.MainButton, {
      isLogin: trackingCopy === ButtonCopy.Login,
    });
  };

  return (
    <span className="flex flex-row gap-4">
      {showLoginButton && (
        <Button
          onClick={() => onClick(ButtonCopy.Login)}
          className={classNames(className, 'btn-secondary')}
        >
          {copy?.login ?? ButtonCopy.Login}
        </Button>
      )}
      <Button
        onClick={() => onClick(ButtonCopy.Signup)}
        className={classNames(className, 'btn-primary')}
      >
        {copy?.signup ?? ButtonCopy.Signup}
      </Button>
    </span>
  );
}
