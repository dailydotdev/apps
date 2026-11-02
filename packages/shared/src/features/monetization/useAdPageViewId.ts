import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { getAdPageViewId } from './adPageView';

export const useAdPageViewId = (): string | undefined => {
  const { asPath } = useRouter();
  return useMemo(() => getAdPageViewId(asPath), [asPath]);
};
