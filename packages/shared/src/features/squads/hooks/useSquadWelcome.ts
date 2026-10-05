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
import { getSquadId } from '../lib/features';

export const useSquadWelcome = (squad: Squad) => {
  const { data, isPending, isError } = useQuery(
    squadWelcomeQueryOptions({ squad }),
  );

  return { welcome: data ?? emptySquadWelcome, isPending, isError };
};

/** Opens the squad's welcome pop-up, if it set one up, after a join. */
export const useSquadWelcomeAfterJoin = (squad: Squad) => {
  const { welcome } = useSquadWelcome(squad);
  const { openModal } = useLazyModal();

  return useCallback(() => {
    if (!welcome.enabled) {
      return;
    }

    openModal({ type: LazyModal.SquadWelcome, props: { squad, welcome } });
  }, [openModal, squad, welcome]);
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
