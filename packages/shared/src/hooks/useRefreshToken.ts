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
      // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useRefresh();
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refresh]);
}
