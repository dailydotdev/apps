'use client';

import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';
import { AppSubscriptionContextProvider } from '@dailydotdev/shared/src/contexts/SubscriptionContext';
import { ProgressiveEnhancementContextProvider } from '@dailydotdev/shared/src/contexts/ProgressiveEnhancementContext';

export default function Providers({
  children,
}: PropsWithChildren): ReactElement {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ProgressiveEnhancementContextProvider>
        <AppSubscriptionContextProvider>
          {children}
        </AppSubscriptionContextProvider>
      </ProgressiveEnhancementContextProvider>
    </QueryClientProvider>
  );
}
