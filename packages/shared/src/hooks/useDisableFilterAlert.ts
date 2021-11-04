import { useEffect } from 'react';
import request from 'graphql-request';
import { UPDATE_ALERTS } from '../graphql/alerts';
import { apiUrl } from '../lib/config';
import { FeedSettings } from '../graphql/feedSettings';
import useAlertContext from './useAlertContext';

export default function useDisableFilterAlert(
  feedSettings: FeedSettings,
): void {
  const { alerts, setAlerts } = useAlertContext();

  useEffect(() => {
    if (
      alerts?.filter &&
      (feedSettings?.includeTags?.length ||
        feedSettings?.blockedTags?.length ||
        feedSettings?.excludeSources?.length ||
        feedSettings?.advancedSettings?.length)
    ) {
      request(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: { filter: false },
      }).then(() => setAlerts({ ...alerts, filter: false }));
    }
  }, [alerts?.filter, feedSettings]);
}
