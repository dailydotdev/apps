import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { disabledRefetch } from '../../lib/func';

interface UseAcceptedPushNow {
  onAcceptedJustNow: (accepted: boolean) => void;
  acceptedJustNow: boolean;
}

export const useAcceptedPushNow = (): UseAcceptedPushNow => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const key = useMemo(
    () =>
      generateQueryKey(RequestKey.PushNotification, user, 'accepted_just_now'),
    [user],
  );

  const { data: acceptedJustNow } = useQuery(key, () => false, {
    ...disabledRefetch,
  });

  const onAcceptedJustNow = useCallback(
    (accepted: boolean) => client.setQueryData(key, accepted),
    [client, key],
  );

  return { acceptedJustNow, onAcceptedJustNow };
};
