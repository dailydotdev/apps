import { useQueryClient, useQuery } from '@tanstack/react-query';
import type { Boot } from '../../../lib/boot';
import type { LoggedUser } from '../../../lib/user';
import { appBootDataQuery } from '../../../lib/boot';
import { useRefreshToken } from '../../../hooks/useRefreshToken';
import { logout } from '../../../contexts/AuthContext';

export enum AppAuthActionsKeys {
  REFRESH = 'refresh',
  LOGOUT = 'logout',
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
  const queryClient = useQueryClient();
  const { refetch } = useQuery(appBootDataQuery);
  const boot = queryClient.getQueryData(appBootDataQuery.queryKey);
  const user = boot && checkIfUserIsLoggedIn(boot.user) ? boot.user : null;
  const isLoggedIn = !!user;

  useRefreshToken(boot?.accessToken, refetch);

  const actions: Readonly<AppAuthActions> = {
    [AppAuthActionsKeys.REFRESH]: refetch,
    [AppAuthActionsKeys.LOGOUT]: logout,
  };

  return {
    boot,
    dispatch: ({ type, data }) => actions[type](data),
    isLoggedIn,
    user,
  };
};
