import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { IconProps } from './Icon';
import { AuthTriggers } from '../lib/auth';

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): AnalyticsEvent => ({
  event_name: eventName,
  target_type: 'signup button',
  target_id: 'header',
  feed_item_title: copy,
});

interface LoginButtonProps {
  icon?: React.ReactElement<IconProps>;
  className?: string;
}

enum ButtonCopy {
  Login = 'Log in',
  Signup = 'Sign up',
}

export default function LoginButton({
  className,
}: LoginButtonProps): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const onClick = (copy: ButtonCopy) => {
    trackEvent(getAnalyticsEvent('click', copy));
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
