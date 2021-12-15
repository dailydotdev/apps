import React, { ReactElement, useContext, useEffect } from 'react';
import { Button } from './buttons/Button';
import AuthContext from '../contexts/AuthContext';
import FeaturesContext from '../contexts/FeaturesContext';
import { getFeatureValue } from '../lib/featureManagement';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../hooks/analytics/useAnalyticsQueue';

const getAnalyticsEvent = (
  eventName: string,
  copy: string,
): Partial<AnalyticsEvent> => ({
  event_name: eventName,
  target_type: 'signup button',
  target_id: 'header',
  feed_item_title: copy,
});

export default function LoginButton(): ReactElement {
  const { showLogin } = useContext(AuthContext);
  const { flags } = useContext(FeaturesContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const copy = getFeatureValue('signup_button_copy', flags) || 'Login';

  useEffect(() => {
    trackEvent(getAnalyticsEvent('impression', copy));
  }, [copy]);

  const onClick = () => {
    trackEvent(getAnalyticsEvent('click', copy));
    showLogin('main button');
  };

  return (
    <Button onClick={onClick} className="btn-primary">
      <span className="hidden laptop:inline">{copy}</span>
      <span className="laptop:hidden">Login</span>
    </Button>
  );
}
