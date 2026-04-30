import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getUserShortInfo } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';
import type { UserShortProfile } from '../../lib/user';

export const useLiveRoomParticipantProfiles = (
  participantIds: string[],
): Map<string, UserShortProfile> => {
  const profileQueries = useQueries({
    queries: participantIds.map((participantId) => ({
      queryKey: generateQueryKey(
        RequestKey.Profile,
        undefined,
        'live-room-participant',
        participantId,
      ),
      queryFn: () => getUserShortInfo(participantId),
      staleTime: ONE_MINUTE,
    })),
  });

  return useMemo(() => {
    const profilesById = new Map<string, UserShortProfile>();

    participantIds.forEach((participantId, index) => {
      const profile = profileQueries[index]?.data;
      if (profile) {
        profilesById.set(participantId, profile);
      }
    });

    return profilesById;
  }, [participantIds, profileQueries]);
};
