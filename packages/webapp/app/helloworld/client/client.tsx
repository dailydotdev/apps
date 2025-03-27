'use client';

import type { FC } from 'react';
import React from 'react';
import { appBootDataQuery } from '@dailydotdev/shared/src/lib/boot';
import { useQueryClient } from '@tanstack/react-query';

export const ClientTest: FC = () => {
  const queryClient = useQueryClient();
  const boot = queryClient.getQueryData(appBootDataQuery.queryKey);
  const user = boot?.user;

  if (!boot) {
    return null;
  }

  return (
    <p>
      <strong>Client</strong> says user is {user?.id ?? 'not logged'}
    </p>
  );
};
