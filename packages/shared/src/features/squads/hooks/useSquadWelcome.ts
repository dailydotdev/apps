import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '../../../graphql/sources';
import type { SquadWelcomeInput } from '../../../graphql/squadWelcomeAudience';
import {
  emptySquadWelcome,
  squadWelcomeQueryOptions,
  updateSquadWelcome,
} from '../../../graphql/squadWelcomeAudience';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { labels } from '../../../lib/labels';
import { getSquadId, hasSquadFeature } from '../lib/features';

export const useSquadWelcome = (squad: Squad) => {
  const { data, isPending, isError } = useQuery(
    squadWelcomeQueryOptions({ squad }),
  );

  return { welcome: data ?? emptySquadWelcome, isPending, isError };
};

/**
 * Opens a verified squad's welcome pop-up, if it set one up, right after a
 * join. It asks then, not on page load: only new joiners see it, and a
 * private squad's pop-up is readable once the person is a member.
 */
export const useOpenSquadWelcome = () => {
  const client = useQueryClient();
  const { openModal } = useLazyModal();

  return useCallback(
    async (squad: Squad) => {
      if (!hasSquadFeature(squad, 'verified')) {
        return;
      }

      const { enabled, ...options } = squadWelcomeQueryOptions({ squad });
      try {
        const welcome = await client.fetchQuery({ ...options, staleTime: 0 });
        if (welcome.enabled) {
          openModal({
            type: LazyModal.SquadWelcome,
            props: { squad, welcome },
          });
        }
      } catch {
        // No pop-up: none set, or the API is a deploy behind
      }
    },
    [client, openModal],
  );
};

export const useUpdateSquadWelcome = (squad: Squad) => {
  const client = useQueryClient();
  const { displayToast } = useToastNotification();
  const { queryKey } = squadWelcomeQueryOptions({ squad });

  return useMutation({
    mutationFn: (params: {
      input: SquadWelcomeInput;
      cover?: File;
      image?: File;
    }) => updateSquadWelcome({ ...params, sourceId: getSquadId(squad) }),
    onSuccess: (welcome) => {
      client.setQueryData(queryKey, welcome);
      displayToast('The welcome pop-up has been saved');
    },
    onError: () => displayToast(labels.error.generic),
  });
};
