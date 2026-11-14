import { useEffect, useState } from 'react';
import { useFeature } from '../components/GrowthBookProvider';
import { featureAppStoreReview } from '../lib/featureManagement';
import { iOSSupportsReview, openIOSWriteReview } from '../lib/ios';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetType } from '../lib/log';

export const rateAppTitle = 'Show daily.dev some love ❤️';

interface UseRateAppRow {
  isVisible: boolean;
  onClick: () => void;
}

/**
 * The permanent "Rate daily.dev" row, shown only in the iOS app with the
 * review bridge. Apple's advice for a button like this: never request the
 * pop-up from a tap, since it may show nothing. The row opens the App
 * Store's write-a-review screen instead, which never spends the yearly
 * prompts.
 */
export const useRateAppRow = (source: string): UseRateAppRow => {
  const { logEvent } = useLogContext();
  const isEnabled = useFeature(featureAppStoreReview);
  // The bridge is only known on the client, so read it after mount.
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    setCanReview(iOSSupportsReview());
  }, []);

  return {
    isVisible: canReview && !!isEnabled,
    onClick: () => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.AppStoreReview,
        target_id: source,
      });
      openIOSWriteReview();
    },
  };
};
