import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Action } from '../graphql/actions';
import type {
  ShellStateData,
  ShellStateVariables,
} from '../graphql/shellState';
import { SHELL_STATE_QUERY } from '../graphql/shellState';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey } from '../lib/query';
import { disabledRefetch } from '../lib/func';
import { featureFeedChips } from '../lib/featureManagement';
import {
  getFeedListQueryKey,
  getFeedListVariables,
  useFeedListVariables,
} from '../hooks/feed/useFeeds';
import {
  DATE_SINCE_ACTIONS_REQUIRED,
  onboardingCompletedActions,
} from '../hooks/auth/useOnboardingActions';
import { useConditionalFeature } from '../hooks/useConditionalFeature';
import { useGqlBatchingFlag } from '../hooks/useGqlBatchingFlag';
import { useRequestProtocol } from '../hooks/useRequestProtocol';
import { useAuthContext } from './AuthContext';
import { ShellStateContextProvider } from './ShellStateContext';

export type ShellStateProviderProps = {
  children?: ReactNode;
};

type ShellStateRequestProps = {
  onSettled: (userId: string) => void;
};

const isOnboardingCompleteFromActions = (
  user: LoggedUser | undefined,
  actions: Action[],
): boolean => {
  if (
    user?.createdAt &&
    new Date(user.createdAt) < DATE_SINCE_ACTIONS_REQUIRED
  ) {
    return true;
  }

  const completed = new Set(actions.map(({ type }) => type));

  return Object.values(onboardingCompletedActions).some((required) =>
    required.every((action) => completed.has(action)),
  );
};

const isSameFeedListVariables = (
  left: ShellStateVariables,
  right: ShellStateVariables,
): boolean =>
  left.includeTagChipFeeds === right.includeTagChipFeeds &&
  left.tagChipSeedStrategy === right.tagChipSeedStrategy;

const ShellStateRequest = ({ onSettled }: ShellStateRequestProps): null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { requestMethod } = useRequestProtocol();
  const variables = useFeedListVariables();
  const variablesRef = useRef(variables);
  variablesRef.current = variables;
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !!user,
  });
  const feedChipsVariantRef = useRef(feedChipsVariant);
  feedChipsVariantRef.current = feedChipsVariant;

  const { isFetched } = useQuery({
    queryKey: generateQueryKey(RequestKey.ShellState, user),
    queryFn: async () => {
      const feedListVariables = variablesRef.current;
      const data = await requestMethod<ShellStateData>(
        SHELL_STATE_QUERY,
        feedListVariables,
      );

      client.setQueryData(generateQueryKey(RequestKey.Actions, user), {
        actions: data.actions,
        serverLoaded: true,
      });
      client.setQueryData(
        generateQueryKey(RequestKey.UserStreak, user),
        data.userStreak,
      );

      // The request goes out before the actions are known, so only seed the
      // feed list key `useFeeds` ends up reading.
      const settledVariables = getFeedListVariables({
        feedChipsVariant: feedChipsVariantRef.current,
        isOnboardingComplete: isOnboardingCompleteFromActions(
          user,
          data.actions,
        ),
        isTagChipFeedsSeeded: !!user?.flags?.tagChipFeedsSeededAt,
      });

      if (isSameFeedListVariables(feedListVariables, settledVariables)) {
        client.setQueryData(getFeedListQueryKey(user, feedListVariables), {
          edges: data.feedList.edges,
          pageInfo: data.feedList.pageInfo,
        });
      }

      return data;
    },
    enabled: !!user,
    staleTime: Infinity,
    retry: false,
    ...disabledRefetch,
  });

  const userId = user?.id;

  useEffect(() => {
    if (isFetched && userId) {
      onSettled(userId);
    }
  }, [isFetched, onSettled, userId]);

  return null;
};

export const ShellStateProvider = ({
  children,
}: ShellStateProviderProps): ReactElement => {
  const { user } = useAuthContext();
  useGqlBatchingFlag();
  const [settledUserId, setSettledUserId] = useState<string>();
  const isSettled = !user || settledUserId === user.id;

  return (
    <ShellStateContextProvider isSettled={isSettled}>
      {!!user && (
        <ShellStateRequest key={user.id} onSettled={setSettledUserId} />
      )}
      {children}
    </ShellStateContextProvider>
  );
};
