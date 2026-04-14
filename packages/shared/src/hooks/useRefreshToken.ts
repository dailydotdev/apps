import { useCallback, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import type { AccessToken } from '../lib/boot';
import useDebounceFn from './useDebounceFn';

export function useRefreshToken(
  accessToken: AccessToken | undefined,
  refresh: () => Promise<unknown>,
): void {
  const difference = differenceInMilliseconds(
    accessToken?.expiresIn ? new Date(accessToken.expiresIn) : new Date(),
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

  const onVisibilityChange = useCallback(() => {
    if (document.visibilityState !== 'visible' || !accessToken?.expiresIn) {
      return;
    }

    const msUntilExpiry = differenceInMilliseconds(
      new Date(accessToken.expiresIn),
      new Date(),
    );

    if (msUntilExpiry < 1000 * 60 * 2) {
      refresh();
    }
  }, [accessToken?.expiresIn, refresh]);

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [onVisibilityChange]);
}
