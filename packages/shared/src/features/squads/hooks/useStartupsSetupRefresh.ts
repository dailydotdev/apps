import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { Squad } from '../../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { getSquadId } from '../lib/features';

/** How often the onboarding checks for what the founder's agent changed. */
export const STARTUPS_SETUP_REFRESH_MS = 30 * 1000;

/**
 * Keeps the onboarding's checklist and page preview close to live while the
 * founder's agent edits the page over MCP in another window: refetches when the
 * window gets focus back and every 30 seconds while the tab is visible.
 */
export const useStartupsSetupRefresh = ({
  squad,
  enabled = true,
}: {
  squad: Pick<Squad, 'id' | 'handle'>;
  /** Off while a row is open, so a refetch doesn't reset what's being typed. */
  enabled?: boolean;
}): void => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const sourceId = getSquadId(squad);
  const { handle } = squad;

  useEffect(() => {
    if (!enabled || !user) {
      return undefined;
    }

    let lastRefresh = 0;
    const refresh = () => {
      // Switching tabs fires both focus and visibilitychange
      if (Date.now() - lastRefresh < 1000) {
        return;
      }

      lastRefresh = Date.now();
      [
        // The page itself, its products and its branding
        generateQueryKey(RequestKey.Squad, user, handle),
        generateQueryKey(RequestKey.SquadSubscription, user, sourceId),
        generateQueryKey(RequestKey.SquadSeats, user, sourceId),
        generateQueryKey(RequestKey.SquadIntel, user, sourceId, 'settings'),
        // The agent signing in or using an API token
        generateQueryKey(RequestKey.OAuthConsents),
        generateQueryKey(RequestKey.PersonalAccessTokens),
      ].forEach((queryKey) => client.invalidateQueries({ queryKey }));
    };
    const isVisible = () => document.visibilityState !== 'hidden';
    const onVisibilityChange = () => {
      if (isVisible()) {
        refresh();
      }
    };

    // The agent usually runs in another app, so coming back to the browser
    // window doesn't change the tab's visibility, only the window's focus.
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);
    const interval = setInterval(() => {
      if (isVisible()) {
        refresh();
      }
    }, STARTUPS_SETUP_REFRESH_MS);

    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(interval);
    };
  }, [client, enabled, handle, sourceId, user]);
};
