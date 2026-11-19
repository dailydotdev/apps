import { useEffect } from 'react';
import type { Squad } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePixelsContext } from '../../../contexts/PixelsContext';
import {
  isNewCompanyPageAdmin,
  trackStartupsSignup,
} from '../lib/startupsAdEvents';

/**
 * An agent creates the company page through the API, where no pixel runs, and
 * then opens it for the founder: that first visit reports the new page.
 */
export const useTrackNewCompanyPage = (squad?: Squad): void => {
  const { user } = useAuthContext();
  const { trackEvent } = usePixelsContext();
  const isNewPage = isNewCompanyPageAdmin(squad);

  useEffect(() => {
    if (!isNewPage || !user) {
      return;
    }

    trackStartupsSignup(trackEvent, {
      userId: user.id,
      email: user.email,
      plan: 'free',
    });
  }, [isNewPage, user, trackEvent]);
};
