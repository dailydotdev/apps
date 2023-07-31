import { useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { joinSquadInvitation, SquadInvitationProps } from '../graphql/squads';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { Squad } from '../graphql/sources';
import { AnalyticsEvent } from '../lib/analytics';
import { useBoot } from './useBoot';
import { generateQueryKey, RequestKey } from '../lib/query';
import { Action, ActionType } from '../graphql/actions';

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

    const queryKey = generateQueryKey(
      RequestKey.Squad,
      result.currentMember.user,
      result.handle,
    );
    const actionsKey = generateQueryKey(
      RequestKey.Actions,
      result.currentMember.user,
    );
    queryClient.setQueryData(queryKey, result);
    queryClient.setQueryData<Action[]>(actionsKey, (data) => {
      if (data?.some(({ type }) => type === ActionType.JoinSquad)) return data;

      const action = { type: ActionType.JoinSquad, completedAt: new Date() };

      return data ? [...data, action] : [action];
    });
    queryClient.setQueryData(queryKey, result);
    queryClient.invalidateQueries(['squadMembersInitial', squad.handle]);

    return result;
  }, [
    squad.id,
    squad.handle,
    referralToken,
    trackEvent,
    addSquad,
    queryClient,
  ]);

  return joinSquad;
};
