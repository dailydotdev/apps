import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { gqlClient } from '../../graphql/common';
import { ADD_FILTERS_TO_FEED_MUTATION } from '../../graphql/feedSettings';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent } from '../../lib/log';
import { RequestKey } from '../../lib/query';

export type BuildFeedSignupOrigin =
  | 'sidebar'
  | 'value_moment'
  | 'exit_intent'
  | 'read_intent';

interface UseBuildFeedSignup {
  triggerSignup: (
    tags: string[],
    trackingOrigin: BuildFeedSignupOrigin,
  ) => void;
}

/**
 * Opens the signup flow framed as "build my feed" and applies the tags the
 * visitor followed (no-password, stored locally) the moment their account is
 * created — so the very first feed they see is already personalized to what
 * they were reading. This is the payoff of the progressive personalization.
 */
export const useBuildFeedSignup = (): UseBuildFeedSignup => {
  const { showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const queryClient = useQueryClient();

  const triggerSignup = useCallback(
    (tags: string[], trackingOrigin: BuildFeedSignupOrigin) => {
      logEvent({
        event_name: LogEvent.Click,
        extra: JSON.stringify({ origin: trackingOrigin, tags }),
      });

      showLogin({
        trigger: AuthTriggers.PostPage,
        options: {
          onRegistrationSuccess: () => {
            if (!tags.length) {
              return;
            }
            gqlClient
              .request(ADD_FILTERS_TO_FEED_MUTATION, {
                filters: { includeTags: tags },
              })
              .then(() =>
                queryClient.invalidateQueries({
                  predicate: (query) =>
                    query.queryKey.includes(RequestKey.FeedSettings),
                }),
              )
              .catch(() => {
                // Onboarding will let them pick tags anyway; never block signup.
              });
          },
        },
      });
    },
    [showLogin, logEvent, queryClient],
  );

  return { triggerSignup };
};
