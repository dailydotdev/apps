import { useMemo } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { updateSquadMemberRole } from '../../graphql/squads';

interface UseSquadActions {
  onUpdateRole?: typeof updateSquadMemberRole;
}

export const useSquadActions = (): UseSquadActions => {
  const client = useQueryClient();
  const { mutateAsync: onUpdateRole } = useMutation(updateSquadMemberRole, {
    onSuccess: (_, { sourceId }) =>
      client.invalidateQueries(['squadMembers', sourceId]),
  });

  return useMemo(() => ({ onUpdateRole }), [onUpdateRole]);
};
