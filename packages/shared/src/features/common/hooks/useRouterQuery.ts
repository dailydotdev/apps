import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export const useRouterQuery = (): {
  query: Record<string, string>;
} => {
  const params = useSearchParams();
  return useMemo(
    () => ({
      query: params ? Object.fromEntries(params.entries()) : {},
    }),
    [params],
  );
};
