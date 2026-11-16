import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SquadSettingsInput } from '../../../graphql/squads';
import { updateSquadSettings } from '../../../graphql/squads';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { labels } from '../../../lib/labels';
import { getSquadId } from '../lib/features';

/** Saves an Enterprise squad's badge and ads settings as they are toggled. */
export const useUpdateSquadSettings = (squad: Squad) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const queryKey = generateQueryKey(RequestKey.Squad, user, squad.handle);

  const setFeatures = (settings: SquadSettingsInput) =>
    client.setQueryData<Squad>(
      queryKey,
      (current) =>
        current && {
          ...current,
          features: { ...current.features, ...settings } as Squad['features'],
        },
    );

  return useMutation({
    mutationFn: (settings: SquadSettingsInput) =>
      updateSquadSettings({ ...settings, sourceId: getSquadId(squad) }),
    onMutate: (settings) => {
      const previous = client.getQueryData<Squad>(queryKey)?.features;
      setFeatures(settings);

      return { previous };
    },
    onSuccess: (settings) => {
      setFeatures(settings);
      displayToast('The settings have been updated');
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        setFeatures(context.previous);
      }
      displayToast(labels.error.generic);
    },
  });
};
