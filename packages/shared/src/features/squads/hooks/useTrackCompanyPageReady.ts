import { useEffect } from 'react';
import type { Squad } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePixelsContext } from '../../../contexts/PixelsContext';
import {
  isCompanyPageConversion,
  trackCompanyPageReady,
} from '../lib/startupsAdEvents';

/**
 * Reports the founder's company page as a registration from their browser
 * once it is ready, next to the server event, so Meta gets the ad click id.
 */
export const useTrackCompanyPageReady = (squad?: Squad): void => {
  const { user } = useAuthContext();
  const { trackEvent } = usePixelsContext();
  const isReady = isCompanyPageConversion(squad);

  useEffect(() => {
    trackCompanyPageReady(trackEvent, squad, user);
    // Runs again when the page turns ready or jev keeps it, not on every refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squad?.id, isReady, user?.id, trackEvent]);
};
