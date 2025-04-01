'use client';

import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActionsKeys,
} from '@dailydotdev/shared/src/features/common/hooks/auth/useAppAuth';

export const ClientTest: FC = () => {
  const { user, isLoggedIn, dispatch } = useAppAuth();

  if (!isLoggedIn) {
    return null;
  }

  return (
    <p>
      <strong>Client</strong> says user is {user?.id ?? 'not logged'}
      <button
        type="button"
        onClick={() => dispatch({ type: AppAuthActionsKeys.REFRESH })}
      >
        Refetch user
      </button>
      <button
        type="button"
        onClick={() => dispatch({ type: AppAuthActionsKeys.LOGOUT })}
      >
        Logout
      </button>
    </p>
  );
};
