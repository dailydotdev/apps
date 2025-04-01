import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai/react';
import type { Boot } from '../../../../lib/boot';
import type { LoggedUser } from '../../../../lib/user';
import { bootQueryAtom, appBootDataQuery } from '../../../../lib/boot';
import { useRefreshToken } from '../../../../hooks/useRefreshToken';

export enum AppAuthActions {
  REFETCH = 'refetch',
}

interface UseAppAuthReturn {
  boot: Boot;
  dispatch: (action: { type: AppAuthActions; data?: unknown }) => void;
  isLoggedIn: boolean;
  user: LoggedUser | null;
}

function checkIfUserIsLoggedIn(user: Boot['user']): user is LoggedUser {
  return 'username' in user;
}

export const useAppAuth = (): UseAppAuthReturn => {
  const queryClient = useQueryClient();
  const { refetch } = useAtomValue(bootQueryAtom);
  const boot = queryClient.getQueryData(appBootDataQuery.queryKey);
  const user = boot && checkIfUserIsLoggedIn(boot.user) ? boot.user : null;
  const isLoggedIn = !!user;

  useRefreshToken(boot?.accessToken, refetch);

  const actions: Record<AppAuthActions, (data?: unknown) => void> = {
    [AppAuthActions.REFETCH]: refetch,
  } as const;

  return {
    boot,
    dispatch: ({ type, data }) => actions[type](data),
    isLoggedIn,
    user,
  };
};
