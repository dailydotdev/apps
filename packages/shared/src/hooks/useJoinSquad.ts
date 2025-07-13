import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { SquadInvitationProps } from '../graphql/squads';
import { joinSquadInvitation } from '../graphql/squads';
import { useLogContext } from '../contexts/LogContext';
import type { Squad } from '../graphql/sources';
import { LogEvent } from '../lib/log';
import { useBoot } from './useBoot';
import { generateQueryKey, RequestKey } from '../lib/query';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { useAuthContext } from '../contexts/AuthContext';
import {
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '../graphql/contentPreference';

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
  const { user } = useAuthContext();
  const { addSquad } = useBoot();
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
  const joinSquad = useCallback(async () => {
    const payload: SquadInvitationProps = {
      sourceId: squad.id,
    };

    if (referralToken) {
      payload.token = referralToken;
    }

    const result = await joinSquadInvitation(payload);

    logEvent({
      event_name: LogEvent.CompleteJoiningSquad,
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
    queryClient.setQueryData(queryKey, result);
    queryClient.invalidateQueries({
      queryKey: ['squadMembersInitial', squad.handle],
    });
    queryClient.setQueryData(
      generateQueryKey(RequestKey.ContentPreference, user, {
        id: squad.id,
        entity: ContentPreferenceType.Source,
      }),
      {
        status: ContentPreferenceStatus.Subscribed,
        referenceId: squad.id,
        type: ContentPreferenceType.Source,
        createdAt: new Date(),
      },
    );
    completeAction(ActionType.JoinSquad);

    return result;
  }, [
    squad.id,
    squad.handle,
    referralToken,
    logEvent,
    addSquad,
    completeAction,
    queryClient,
    user,
  ]);

  return joinSquad;
};
