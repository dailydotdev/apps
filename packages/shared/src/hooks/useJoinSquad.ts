import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { joinSquadInvitation, SquadInvitationProps } from '../graphql/squads';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { Squad } from '../graphql/sources';
import { AnalyticsEvent } from '../lib/analytics';
import { generateQueryKey, RequestKey } from '../lib/query';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { useSquads } from './squads/useSquads';

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
  const { addSquad } = useSquads();
  const { trackEvent } = useAnalyticsContext();
  const { completeAction } = useActions();

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

    await addSquad(result);

    const queryKey = generateQueryKey(
      RequestKey.Squad,
      result.currentMember.user,
      result.handle,
    );
    queryClient.setQueryData(queryKey, result);
    queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);
    completeAction(ActionType.JoinSquad);

    return result;
  }, [
    squad.id,
    squad.handle,
    referralToken,
    trackEvent,
    addSquad,
    completeAction,
    queryClient,
  ]);

  return joinSquad;
};
