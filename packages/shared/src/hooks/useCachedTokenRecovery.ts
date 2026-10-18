import { useEffect, useRef } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';

interface UseCachedTokenRecoveryProps {
  queryKey: QueryKey;
  enabled: boolean;
  isUnauthenticated?: boolean;
}

/**
 * Refetches, once, a query that went out with the cached session before boot
 * when boot shows that session's cookie was not valid. It cancels first, since
 * a refetch alone reuses a first request still in flight.
 */
export const useCachedTokenRecovery = ({
  queryKey,
  enabled,
  isUnauthenticated = false,
}: UseCachedTokenRecoveryProps): void => {
  const { tokenRefreshed, cachedTokenWasInvalid } = useAuthContext();
  const queryClient = useQueryClient();
  const startedEarlyRef = useRef(false);
  const recoveredRef = useRef(false);
  const shouldRecover =
    tokenRefreshed && (isUnauthenticated || !!cachedTokenWasInvalid);

  useEffect(() => {
    if (enabled && !tokenRefreshed) {
      startedEarlyRef.current = true;
    }
  }, [enabled, tokenRefreshed]);

  useEffect(() => {
    if (!shouldRecover || !startedEarlyRef.current || recoveredRef.current) {
      return;
    }

    recoveredRef.current = true;
    queryClient
      .cancelQueries({ queryKey })
      .then(() => queryClient.refetchQueries({ queryKey }));
  }, [shouldRecover, queryClient, queryKey]);
};
