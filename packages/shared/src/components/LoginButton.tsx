import React, { ReactElement, useContext, useEffect } from 'react';
import classNames from 'classnames';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import FeaturesContext from '../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';
import { IconProps } from './Icon';

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): Partial<AnalyticsEvent> => ({
  event_name: eventName,
  target_type: 'signup button',
  target_id: 'header',
  feed_item_title: copy,
});

interface LoginButtonProps {
  icon?: React.ReactElement<IconProps>;
  className?: string;
}
export default function LoginButton({
  icon,
  className,
}: LoginButtonProps): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { flags } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const buttonCopy = getFeatureValue(Features.SignupButtonCopy, flags);

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', buttonCopy));
  }, [buttonCopy]);

  const onClick = () => {
    trackEvent(getAnalyticsEvent('click', buttonCopy));
    showLogin('main button');
  };

  return (
    <Button
      onClick={onClick}
      icon={icon}
      className={classNames(className, 'btn-primary')}
    >
      <span className="hidden laptop:inline">{buttonCopy}</span>
      <span className="laptop:hidden">Sign up</span>
    </Button>
  );
}
