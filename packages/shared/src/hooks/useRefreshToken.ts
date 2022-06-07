import { useRef, useEffect } from 'react';
import { differenceInMilliseconds } from 'date-fns';
import { AccessToken } from '../lib/boot';

export function useRefreshToken(
  accessToken: AccessToken,
  refresh: () => Promise<unknown>,
): void {
  const timeout = useRef<number>();

  useEffect(() => {
    if (accessToken) {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }
      const expiresInMillis = differenceInMilliseconds(
        new Date(accessToken.expiresIn),
        new Date(),
      );
      // Refresh token before it expires
      timeout.current = window.setTimeout(
        refresh,
        expiresInMillis - 1000 * 60 * 2,
      );
    }
  }, [accessToken, refresh]);
}
