import React, { ReactElement, Ref, useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
import AuthContext from '../contexts/AuthContext';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  getFeedSettingsQueryKey,
  updateLocalFeedSettings,
} from '../hooks/useFeedSettings';
import { AllTagCategoriesData } from '../graphql/feedSettings';
import { Button, ButtonProps } from './buttons/Button';
import PlusIcon from '../../icons/plus.svg';

export default function CreateFeedFilterButton(
  { className, style, ...props }: ButtonProps<'button'>,
  ref: Ref<HTMLButtonElement>,
): ReactElement {

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
      buttonSize="medium"
      type="submit"
      icon={<PlusIcon />}
      onClick={onCreate}
    >
      Create
    </Button>
  );
}
