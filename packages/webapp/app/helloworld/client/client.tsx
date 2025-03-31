'use client';

import type { FC } from 'react';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { Boot } from '@dailydotdev/shared/src/lib/boot';
import React from 'react';
import { appBootDataQuery } from '@dailydotdev/shared/src/lib/boot';
import { atomWithQuery } from 'jotai-tanstack-query';
import { useAtomValue } from 'jotai/react';
import { useRefreshToken } from '@dailydotdev/shared/src/hooks/useRefreshToken';

enum WebAppBootActions {
  REFETCH = 'refetch',
}

interface UseWebBootDataReturn {
  boot: Boot;
  dispatch: (action: { type: WebAppBootActions; data?: unknown }) => void;
  isLoggedIn: boolean;
  user: LoggedUser | null;
}

function checkIfUserIsLoggedIn(user: Boot['user']): user is LoggedUser {
  return 'username' in user;
}

const bootQueryAtom = atomWithQuery(() => appBootDataQuery);

export const useWebBootData = (): UseWebBootDataReturn => {
  const { data: boot, refetch } = useAtomValue(bootQueryAtom);
  const user = boot && checkIfUserIsLoggedIn(boot.user) ? boot.user : null;
  const isLoggedIn = !!user;

  useRefreshToken(boot?.accessToken, refetch);

  const actions: Record<WebAppBootActions, (data?: unknown) => void> = {
    [WebAppBootActions.REFETCH]: async () => {
      await refetch();
    },
  } as const;

  return {
    boot,
    dispatch: ({ type, data }) => actions[type](data),
    isLoggedIn,
    user,
  };
};

export const ClientTest: FC = () => {
  const { user, isLoggedIn, dispatch } = useWebBootData();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <p>
      <strong>Client</strong> says user is {user?.id ?? 'not logged'}
      <button
        type="button"
        onClick={() => dispatch({ type: WebAppBootActions.REFETCH })}
      >
        Refetch user
      </button>
    </p>
  );
};
