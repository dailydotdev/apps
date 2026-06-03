import { useMemo, useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import { generateUserSourceAsSquad } from '../write/MultipleSourceSelect';
import type { Squad } from '../../../graphql/sources';
import { SourcePermissions, SourceType } from '../../../graphql/sources';
import { verifyPermission } from '../../../graphql/squads';

export const MAX_AUDIENCE_SQUADS = 3;

export const isUserAudience = (audience: Squad | undefined): boolean =>
  // @ts-expect-error UserSource intentionally reused as Squad
  audience?.type === SourceType.User;

interface UseComposerAudience {
  audiences: Squad[];
  selectedIds: string[];
  selected: Squad[];
  setSelectedIds: (ids: string[]) => void;
  userAudienceId: string | undefined;
}

export const useComposerAudience = (
  initialSquadHandle?: string,
  initialSquadId?: string,
): UseComposerAudience => {
  const { user, squads } = useAuthContext();

  const audiences = useMemo<Squad[]>(() => {
    if (!user) {
      return [];
    }
    const userAudience = generateUserSourceAsSquad(user);
    const postableSquads = (squads ?? []).filter(
      (squad) =>
        squad?.active && verifyPermission(squad, SourcePermissions.Post),
    );
    return [userAudience, ...postableSquads];
  }, [user, squads]);

  const userAudienceId = useMemo(
    () => audiences.find(isUserAudience)?.id,
    [audiences],
  );

  const defaultId = useMemo(() => {
    if (initialSquadId) {
      const match = audiences.find(
        (audience) => audience.id === initialSquadId,
      );
      if (match?.id) {
        return match.id;
      }
    }
    if (initialSquadHandle) {
      const match = audiences.find(
        (audience) => audience.handle === initialSquadHandle,
      );
      if (match?.id) {
        return match.id;
      }
    }
    return userAudienceId;
  }, [audiences, initialSquadHandle, initialSquadId, userAudienceId]);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    defaultId ? [defaultId] : [],
  );

  useEffect(() => {
    if (selectedIds.length === 0 && defaultId) {
      setSelectedIds([defaultId]);
    }
  }, [defaultId, selectedIds.length]);

  const selected = useMemo(
    () =>
      audiences.filter(
        (audience) => !!audience.id && selectedIds.includes(audience.id),
      ),
    [audiences, selectedIds],
  );

  return {
    audiences,
    selectedIds,
    selected,
    setSelectedIds,
    userAudienceId,
  };
};
