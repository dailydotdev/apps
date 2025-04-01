'use client';

import type { FC } from 'react';
import React from 'react';
import {
  useAppAuth,
  AppAuthActions,
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
        onClick={() => dispatch({ type: AppAuthActions.REFETCH })}
      >
        Refetch user
      </button>
    </p>
  );
};
