import { useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken } from '../lib/boot';
import useDebounceFn from './useDebounceFn';

export function useRefreshToken(
  accessToken: AccessToken,
  refresh: () => Promise<unknown>,
): void {
  const difference = differenceInMilliseconds(
    new Date(accessToken?.expiresIn),
    new Date(),
  );
  const differencePlusTwoMinutes = difference - 1000 * 60 * 2;
  const saveDelay =
    differencePlusTwoMinutes <= 200 ? 200 : differencePlusTwoMinutes;

  const [callRefresh] = useDebounceFn(refresh, saveDelay, 1000 * 60);

  useEffect(() => {
    if (accessToken?.token) {
      callRefresh();
    }
  }, [accessToken?.token, callRefresh]);
}
