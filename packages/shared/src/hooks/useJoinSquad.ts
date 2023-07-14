import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { joinSquadInvitation } from '../graphql/squads';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { Squad } from '../graphql/sources';
import { AnalyticsEvent } from '../lib/analytics';
import { useBoot } from './useBoot';

type UseJoinSquadProps = {
  squad: Pick<Squad, 'id' | 'handle' | 'currentMember'>;
};

type UseJoinSquad = () => Promise<Squad>;

export const useJoinSquad = ({ squad }: UseJoinSquadProps): UseJoinSquad => {
  const queryClient = useQueryClient();
  const { addSquad } = useBoot();
  const { trackEvent } = useAnalyticsContext();

  const joinSquad = useCallback(async () => {
    const result = await joinSquadInvitation({
      sourceId: squad.id,
      token: squad.currentMember?.referralToken,
    });

    trackEvent({
      event_name: AnalyticsEvent.CompleteJoiningSquad,
      extra: JSON.stringify({
        inviter: result.currentMember.user.id,
        squad: result.id,
      }),
    });

    addSquad(result);
    queryClient.invalidateQueries(['squad', squad.handle]);

    return result;
  }, [addSquad, queryClient, squad, trackEvent]);

  return joinSquad;
};
