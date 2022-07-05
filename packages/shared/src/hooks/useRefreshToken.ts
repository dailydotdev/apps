import { useRef, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken } from '../lib/boot';
import useDebounce from './useDebounce';

export function useRefreshToken(
  accessToken: AccessToken,
  refresh: () => Promise<unknown>,
): void {
  const timeout = useRef<number>();
  const [useRefresh] = useDebounce(refresh, timeout.current - 1000 * 60 * 2);

  useEffect(() => {
    if (accessToken) {
      timeout.current = differenceInMilliseconds(
        new Date(accessToken.expiresIn),
        new Date(),
      );
      useRefresh();
    }
    return () => clearTimeout(timeout.current);
  }, [accessToken, refresh]);
}
