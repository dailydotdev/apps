import { HydrationBoundary } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';

export const getHydrationLayout = (page: ReactNode) => {
  const { dehydratedState } = (page as ReactElement)?.props || {};
  return <HydrationBoundary state={dehydratedState}>{page}</HydrationBoundary>;
};
