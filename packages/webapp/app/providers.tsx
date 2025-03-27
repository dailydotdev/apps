'use client';

import type { PropsWithChildren, ReactElement } from 'react';
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@dailydotdev/shared/src/graphql/queryClient';
import { queryClientAtom } from 'jotai-tanstack-query';
import { useHydrateAtoms } from 'jotai/react/utils';
import { Provider as JotaiProvider } from 'jotai/react';

const HydrateAtoms = ({ children }) => {
  const queryClient = getQueryClient();
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

export default function Providers({
  children,
}: PropsWithChildren): ReactElement {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </JotaiProvider>
    </QueryClientProvider>
  );
}
