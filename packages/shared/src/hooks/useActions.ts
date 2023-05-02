import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Action,
  ActionType,
  completeUserAction,
  getUserActions,
} from '../graphql/actions';
import { generateQueryKey, RequestKey } from '../lib/query';

interface UseActions {
  actions: Action[];
  checkHasCompleted: (type: ActionType) => boolean;
  completeAction: (type: ActionType) => Promise<void>;
}

export const useActions = (): UseActions => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { data: actions } = useQuery(
    generateQueryKey(RequestKey.Actions, user),
    getUserActions,
    { enabled: !!user },
  );
  const { mutateAsync: completeAction } = useMutation(completeUserAction, {
    onMutate: (type) => {
      client.setQueryData<Action[]>(
        generateQueryKey(RequestKey.Actions, user),
        (data) => {
          if (!data?.length) return [];

          return [...data, { userId: user.id, type, completedAt: new Date() }];
        },
      );

      return () =>
        client.setQueryData<Action[]>(
          generateQueryKey(RequestKey.Actions, user),
          actions,
        );
    },
    onError: (_, __, rollback: () => void) => {
      if (rollback) rollback();
    },
  });

  return useMemo<UseActions>(
    () => ({
      actions,
      completeAction,
      checkHasCompleted: (type) =>
        actions?.some((action) => action.type === type),
    }),
    [actions, completeAction],
  );
};
