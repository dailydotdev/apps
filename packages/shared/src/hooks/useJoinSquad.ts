import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { joinSquadInvitation, SquadInvitationProps } from '../graphql/squads';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { Squad } from '../graphql/sources';
import { AnalyticsEvent } from '../lib/analytics';
import { useBoot } from './useBoot';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

type UseJoinSquadProps = {
  squad: Pick<Squad, 'id' | 'handle'>;
  referralToken?: string;
};

type UseJoinSquad = () => Promise<Squad>;

export const useJoinSquad = ({
  squad,
  referralToken,
}: UseJoinSquadProps): UseJoinSquad => {
  const queryClient = useQueryClient();
  const { addSquad } = useBoot();
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();

  const joinSquad = useCallback(async () => {
    const payload: SquadInvitationProps = {
      sourceId: squad.id,
    };

    if (referralToken) {
      payload.token = referralToken;
    }

    const result = await joinSquadInvitation(payload);

    trackEvent({
      event_name: AnalyticsEvent.CompleteJoiningSquad,
      extra: JSON.stringify({
        inviter: result.currentMember.user.id,
        squad: result.id,
      }),
    });

    addSquad(result);
    const queryKey = generateQueryKey(RequestKey.Squad, user, squad.handle);
    queryClient.invalidateQueries(queryKey);
    queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);

    return result;
  }, [addSquad, queryClient, squad, user, trackEvent, referralToken]);

  return joinSquad;
};
