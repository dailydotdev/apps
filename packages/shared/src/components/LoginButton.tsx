import React, { HTMLAttributes, ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button, ButtonVariant } from './buttons/ButtonV2';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { AuthTriggers } from '../lib/auth';
import { TargetType } from '../lib/analytics';

interface ClassName {
  container?: string;
  button?: string;
}

interface LoginButtonProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  className?: ClassName;
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
  className = {},
  ...props
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
    <span
      {...props}
      className={classNames('flex flex-row', className?.container)}
    >
      <Button
        onClick={() => onClick(ButtonCopy.Login)}
        variant={ButtonVariant.Secondary}
        className={className?.button}
      >
        {ButtonCopy.Login}
      </Button>
      <Button
        onClick={() => onClick(ButtonCopy.Signup)}
        variant={ButtonVariant.Primary}
        className={className?.button}
      >
        {ButtonCopy.Signup}
      </Button>
    </span>
  );
}
