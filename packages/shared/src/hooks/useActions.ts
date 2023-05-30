import { useCallback, useMemo } from 'react';
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
  isFetched: boolean;
  checkHasCompleted: (type: ActionType) => boolean;
  completeAction: (type: ActionType) => Promise<void>;
  isActionsFetched: boolean;
}

export const useActions = (): UseActions => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { data: actions, isFetched: isActionsFetched } = useQuery(
    generateQueryKey(RequestKey.Actions, user),
    getUserActions,
    { enabled: !!user },
  );
  const { mutateAsync: completeAction } = useMutation(completeUserAction, {
    onMutate: (type) => {
      client.setQueryData<Action[]>(
        generateQueryKey(RequestKey.Actions, user),
        (data) => {
          const optimisticAction = {
            userId: user.id,
            type,
            completedAt: new Date(),
          };

          if (!Array.isArray(data)) {
            return [optimisticAction];
          }

          return [...data, optimisticAction];
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

  const checkHasCompleted = useCallback(
    (type: ActionType) =>
      actions?.some((action) => action.type === type && !!action.completedAt),
    [actions],
  );

  return useMemo<UseActions>(() => {
    return {
      actions,
      isFetched,
      completeAction: (type: ActionType) => {
        if (checkHasCompleted(type)) {
          return undefined;
        }

        return completeAction(type);
      },
      checkHasCompleted,
      isActionsFetched,
    };
  }, [actions, completeAction, checkHasCompleted, isActionsFetched]);
};
