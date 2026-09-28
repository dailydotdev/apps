import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { UpdateSquadLinksInput } from '../../../graphql/squads';
import { updateSquadLinks } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { labels } from '../../../lib/labels';
import { getSquadId } from '../lib/features';

export const useUpdateSquadLinks = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();

  return useMutation({
    mutationFn: (input: Omit<UpdateSquadLinksInput, 'sourceId'>) =>
      updateSquadLinks({ ...input, sourceId: getSquadId(squad) }),
    onSuccess: ({ website, links }) => {
      client.setQueryData<Squad>(
        generateQueryKey(RequestKey.Squad, user, squad.handle),
        (current) => current && { ...current, website, links },
      );
      displayToast('The links have been updated');
    },
    onError: () => displayToast(labels.error.generic),
  });
};
