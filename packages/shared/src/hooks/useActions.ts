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

interface ActionQueryData {
  actions: Action[];
  serverLoaded: boolean;
}

export const useActions = (): UseActions => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const actionsKey = generateQueryKey(RequestKey.Actions, user);

  const { data, isLoading } = useQuery(
    actionsKey,
    async () => {
      const serverData = await getUserActions();
      const current = client.getQueryData<ActionQueryData>(actionsKey);

      if (!current || !Array.isArray(current)) {
        return { actions: serverData, serverLoaded: true };
      }

      const filtered = serverData.filter(({ type }) =>
        current.every((action) => action.type !== type),
      );

      return { actions: [...current, ...filtered], serverLoaded: true };
    },
    { enabled: !!user, ...disabledRefetch },
  );

  const actions = data?.actions;
  const isActionsFetched = !isLoading && !!data?.serverLoaded;

  const { mutateAsync: completeAction } = useMutation(completeUserAction, {
    onMutate: (type) => {
      if (!user?.id) {
        return () => undefined;
      }

      client.setQueryData<ActionQueryData>(actionsKey, (old) => {
        const optimisticAction = {
          userId: user.id,
          type,
          completedAt: new Date(),
        };

        if (!Array.isArray(old?.actions)) {
          return { actions: [optimisticAction], serverLoaded: false };
        }

        return {
          actions: [...old?.actions, optimisticAction],
          serverLoaded: !!old?.serverLoaded,
        };
      });

      return () =>
        client.setQueryData<ActionQueryData>(actionsKey, {
          actions,
          serverLoaded: !!data?.serverLoaded,
        });
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
