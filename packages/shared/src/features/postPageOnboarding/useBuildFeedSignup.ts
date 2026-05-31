import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { gqlClient } from '../../graphql/common';
import { ADD_FILTERS_TO_FEED_MUTATION } from '../../graphql/feedSettings';
import { AuthTriggers } from '../../lib/auth';
import { LogEvent } from '../../lib/log';
import { RequestKey } from '../../lib/query';
import type { AuthProps } from '../../components/auth/common';

export type BuildFeedSignupOrigin = 'sidebar' | 'feed';

interface UseBuildFeedSignup {
  /** Apply the followed topics to the new account's feed (best effort). */
  applyFollowedTags: (tags: string[]) => void;
  /** Open the auth modal from a button, carrying the followed topics. */
  triggerSignup: (tags: string[], origin: BuildFeedSignupOrigin) => void;
  /** Handler for inline AuthOptions' email-continue path (escalates to modal). */
  getAuthStateHandler: (
    tags: string[],
    origin: BuildFeedSignupOrigin,
  ) => (props: Partial<AuthProps>) => void;
}

/**
 * Signup wiring for the anonymous build-feed surfaces. The tags the visitor
 * followed (no-password, stored locally) are applied to their feed the moment
 * the account is created — whether they sign up via an inline social button
 * (onSuccessfulRegistration) or via the email→modal path (onRegistrationSuccess).
 */
export const useBuildFeedSignup = (): UseBuildFeedSignup => {
  const { showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const queryClient = useQueryClient();

  const applyFollowedTags = useCallback(
    (tags: string[]) => {
      if (!tags?.length) {
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
          // Onboarding lets them pick topics anyway; never block signup.
        });
    },
    [queryClient],
  );

  const logStart = useCallback(
    (tags: string[], origin: BuildFeedSignupOrigin) => {
      logEvent({
        event_name: LogEvent.Click,
        extra: JSON.stringify({ origin, tags }),
      });
    },
    [logEvent],
  );

  const triggerSignup = useCallback(
    (tags: string[], origin: BuildFeedSignupOrigin) => {
      logStart(tags, origin);
      showLogin({
        trigger: AuthTriggers.PostPage,
        options: { onRegistrationSuccess: () => applyFollowedTags(tags) },
      });
    },
    [showLogin, logStart, applyFollowedTags],
  );

  const getAuthStateHandler = useCallback(
    (tags: string[], origin: BuildFeedSignupOrigin) =>
      (props: Partial<AuthProps>) => {
        logStart(tags, origin);
        showLogin({
          trigger: AuthTriggers.PostPage,
          options: {
            isLogin: !!props.isLoginFlow,
            defaultDisplay: props.defaultDisplay,
            formValues: props.email ? { email: props.email } : undefined,
            onRegistrationSuccess: () => applyFollowedTags(tags),
          },
        });
      },
    [showLogin, logStart, applyFollowedTags],
  );

  return { applyFollowedTags, triggerSignup, getAuthStateHandler };
};
