import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type {
  SquadBranding,
  UpdateSquadBrandingInput,
} from '../../../graphql/squadBranding';
import {
  squadBrandingQueryOptions,
  updateSquadBranding,
} from '../../../graphql/squadBranding';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import { getSquadId } from '../lib/features';

/** A verified squad's branding; undefined for others or while loading. */
export const useSquadBranding = (squad: Squad): SquadBranding | undefined => {
  const { user } = useAuthContext();
  const { data } = useQuery(squadBrandingQueryOptions({ squad, user }));

  return data;
};

export const useUpdateSquadBranding = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();

  return useMutation({
    mutationFn: (input: Omit<UpdateSquadBrandingInput, 'sourceId'>) =>
      updateSquadBranding({ ...input, sourceId: getSquadId(squad) }),
    onSuccess: (branding) => {
      client.setQueryData(
        squadBrandingQueryOptions({ squad, user }).queryKey,
        branding,
      );
      displayToast('The branding has been updated');
    },
    onError: () => displayToast(labels.error.generic),
  });
};
