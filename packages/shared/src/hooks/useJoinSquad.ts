import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { SquadInvitationProps, joinSquadInvitation } from '../graphql/squads';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { Squad } from '../graphql/sources';
import { AnalyticsEvent } from '../lib/analytics';
import { useBoot } from './useBoot';

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
    queryClient.invalidateQueries(['squad', squad.handle]);
    queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);

    return result;
  }, [addSquad, queryClient, squad, trackEvent, referralToken]);

  return joinSquad;
};
