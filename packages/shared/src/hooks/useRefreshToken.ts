import { useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken } from '../lib/boot';
import useDebounce from './useDebounce';

export function useRefreshToken(
  accessToken: AccessToken,
  refresh: () => Promise<unknown>,
): void {
  const difference = differenceInMilliseconds(
    new Date(accessToken?.expiresIn),
    new Date(),
  );
  const [useRefresh] = useDebounce(refresh, difference - 1000 * 60 * 2);

  useEffect(() => {
    if (accessToken) {
      useRefresh();
    }
  }, [accessToken, refresh]);
}
