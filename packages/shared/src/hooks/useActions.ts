import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Action,
  ActionType,
  completeUserAction,
  getUserActions,
} from '../graphql/actions';
import { generateQueryKey, RequestKey } from '../lib/query';
import { disabledRefetch } from '../lib/func';

interface UseActions {
  actions: Action[];
  checkHasCompleted: (type: ActionType) => boolean;
  completeAction: (type: ActionType) => Promise<void>;
  isActionsFetched: boolean;
}

export const useActions = (): UseActions => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const actionsKey = generateQueryKey(RequestKey.Actions, user);
  const { data: actions, isLoading } = useQuery(
    actionsKey,
    async () => {
      const data = await getUserActions();
      const current = client.getQueryData<Action[]>(actionsKey);

      if (!current || !Array.isArray(current)) {
        return data;
      }

      const filtered = data.filter(({ type }) =>
        current.every((action) => action.type !== type),
      );

      return [...current, ...filtered];
    },
    { enabled: !!user, ...disabledRefetch },
  );
  const isActionsFetched = !isLoading;

  const { mutateAsync: completeAction } = useMutation(completeUserAction, {
    onMutate: (type) => {
      client.setQueryData<Action[]>(actionsKey, (data) => {
        const optimisticAction = {
          userId: user.id,
          type,
          completedAt: new Date(),
        };

        if (!Array.isArray(data)) {
          return [optimisticAction];
        }

        return [...data, optimisticAction];
      });

      return () => client.setQueryData<Action[]>(actionsKey, actions);
    },
    onError: (_, __, rollback: () => void) => {
      if (rollback) {
        rollback();
      }
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
