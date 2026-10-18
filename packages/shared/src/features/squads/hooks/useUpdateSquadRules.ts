import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad, SquadRule } from '../../../graphql/sources';
import { updateSquadRules } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { labels } from '../../../lib/labels';
import { getSquadId } from '../lib/features';

export const useUpdateSquadRules = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();

  return useMutation({
    mutationFn: (rules: SquadRule[]) =>
      updateSquadRules({ sourceId: getSquadId(squad), rules }),
    onSuccess: ({ rules }) => {
      client.setQueryData<Squad>(
        generateQueryKey(RequestKey.Squad, user, squad.handle),
        (current) => current && { ...current, rules },
      );
      displayToast('The rules have been updated');
    },
    onError: () => displayToast(labels.error.generic),
  });
};
