import { useCallback, useState } from 'react';
import type { CommunityPackMember } from './communityPacks';
import { CommunityPackMemberType } from './communityPacks';
import { joinSquadInvitation } from '@dailydotdev/shared/src/graphql/squads';
import { ContentPreferenceType } from '@dailydotdev/shared/src/graphql/contentPreference';
import { ActionType } from '@dailydotdev/shared/src/graphql/actions';
import { useContentPreference } from '@dailydotdev/shared/src/hooks/contentPreference/useContentPreference';
import { useActions } from '@dailydotdev/shared/src/hooks/useActions';
import { useBoot } from '@dailydotdev/shared/src/hooks/useBoot';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, Origin } from '@dailydotdev/shared/src/lib/log';

export interface JoinCommunitiesResult {
  squads: string[];
  sources: string[];
  users: string[];
}

const settledIds = (results: PromiseSettledResult<string>[]): string[] =>
  results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );

const followEntity: Record<
  Exclude<CommunityPackMemberType, CommunityPackMemberType.Squad>,
  ContentPreferenceType
> = {
  [CommunityPackMemberType.Source]: ContentPreferenceType.Source,
  [CommunityPackMemberType.User]: ContentPreferenceType.User,
};

export const useJoinCommunities = (): {
  joinCommunities: (
    members: CommunityPackMember[],
  ) => Promise<JoinCommunitiesResult>;
  isJoining: boolean;
} => {
  const [isJoining, setIsJoining] = useState(false);
  const { addSquad } = useBoot();
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
  const { follow } = useContentPreference();

  const join = useCallback(
    async ({ id, name, type }: CommunityPackMember): Promise<string> => {
      if (type !== CommunityPackMemberType.Squad) {
        await follow({
          id,
          entity: followEntity[type],
          entityName: name,
          opts: { extra: { origin: Origin.Onboarding } },
        });

        return id;
      }

      const squad = await joinSquadInvitation({ sourceId: id });

      logEvent({
        event_name: LogEvent.CompleteJoiningSquad,
        extra: JSON.stringify({ squad: id, origin: Origin.Onboarding }),
      });
      addSquad(squad);

      return id;
    },
    [addSquad, follow, logEvent],
  );

  const joinCommunities = useCallback(
    async (members: CommunityPackMember[]) => {
      setIsJoining(true);

      const joinAll = (type: CommunityPackMemberType) =>
        Promise.allSettled(
          members.filter((member) => member.type === type).map(join),
        ).then(settledIds);
      const [squads, sources, users] = await Promise.all([
        joinAll(CommunityPackMemberType.Squad),
        joinAll(CommunityPackMemberType.Source),
        joinAll(CommunityPackMemberType.User),
      ]);

      if (squads.length) {
        completeAction(ActionType.JoinSquad);
      }

      setIsJoining(false);

      return { squads, sources, users };
    },
    [completeAction, join],
  );

  return { joinCommunities, isJoining };
};
