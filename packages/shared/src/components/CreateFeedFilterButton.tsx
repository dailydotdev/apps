import React, { ReactElement, useContext } from 'react';
import { useQueryClient } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from '../hooks/useFeedSettings';
import { AllTagCategoriesData } from '../graphql/feedSettings';
import { Button, ButtonProps } from './buttons/Button';

export default function CreateFeedFilterButton({
  icon,
  buttonSize,
  className,
}: ButtonProps<'button'>): ReactElement {
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const client = useQueryClient();

  const onCreate = () => {
    trackEvent({
      event_name: 'click',
      target_type: 'create feed filters',
      target_id: 'feed-filters',
    });
    const key = getFeedSettingsQueryKey(user);
    const { feedSettings } = client.getQueryData(key) as AllTagCategoriesData;
    updateLocalFeedSettings(feedSettings);
    showLogin('create feed filters');
  };
  return (
    <Button
      className={className}
      icon={icon}
      buttonSize={buttonSize}
      type="submit"
      onClick={onCreate}
    >
      Create
    </Button>
  );
}
