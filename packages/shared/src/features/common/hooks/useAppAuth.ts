import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Boot } from '../../../lib/boot';
import type { LoggedUser, AnonymousUser } from '../../../lib/user';
import { appBootDataQuery } from '../../../lib/boot';
import { logout } from '../../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../../lib/query';

export enum AppAuthActionsKeys {
  LOGOUT = 'logout',
  REFRESH = 'refresh',
  UPDATE_USER = 'updateUser',
}

export type AppAuthActions = Record<
  AppAuthActionsKeys,
  (data?: unknown) => void
>;

interface UseAppAuthReturn {
  boot: Boot;
  dispatch: <Data>(action: { type: AppAuthActionsKeys; data?: Data }) => void;
  isLoggedIn: boolean;
  user: LoggedUser | null;
}

function checkIfUserIsLoggedIn(user: Boot['user']): user is LoggedUser {
  return 'username' in user;
}

export const useAppAuth = (): UseAppAuthReturn => {
  const client = useQueryClient();
  const initialData = client.getQueryData(appBootDataQuery.queryKey);
  const { data: boot, refetch } = useQuery({
    ...appBootDataQuery,
    initialData,
  });
  const user = boot && checkIfUserIsLoggedIn(boot.user) ? boot.user : null;
  const isLoggedIn = !!user;

  const actions: Readonly<AppAuthActions> = {
    [AppAuthActionsKeys.LOGOUT]: logout,
    [AppAuthActionsKeys.REFRESH]: refetch,
    [AppAuthActionsKeys.UPDATE_USER]: async (
      newUser: LoggedUser | AnonymousUser,
    ) => {
      await client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Profile, newUser),
      });
    },
  };

  return {
    boot,
    dispatch: ({ type, data }) => actions[type](data),
    isLoggedIn,
    user,
  };
};
