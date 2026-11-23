import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import { getSquad } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePixelsContext } from '../../../contexts/PixelsContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { trackCompanyPageFirstPost } from '../lib/startupsAdEvents';
import { isUserAudience } from '../../../components/post/composer/useComposerAudience';

/**
 * Reports a post to a ready company page in its first month. The composer's audiences come from
 * boot, which has no company flag or creation date, so each squad is read
 * from the squad page's query.
 */
export const useTrackCompanyPageFirstPost = (): ((
  audiences: Squad[],
) => void) => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { trackEvent } = usePixelsContext();

  return useCallback(
    (audiences: Squad[]) => {
      audiences
        .filter((audience) => !isUserAudience(audience) && !!audience.handle)
        .forEach(({ handle }) =>
          queryClient
            .fetchQuery({
              queryKey: generateQueryKey(RequestKey.Squad, user, handle),
              queryFn: () => getSquad(handle),
            })
            .then((squad) =>
              trackCompanyPageFirstPost(trackEvent, squad, user?.email),
            )
            .catch(() => undefined),
        );
    },
    [queryClient, user, trackEvent],
  );
};
