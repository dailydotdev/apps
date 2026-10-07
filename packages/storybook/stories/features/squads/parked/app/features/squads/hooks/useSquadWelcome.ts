import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { SquadWelcomeInput } from '../../../graphql/squadWelcomeAudience';
import {
  emptySquadWelcome,
  squadWelcomeQueryOptions,
  updateSquadWelcome,
} from '../../../graphql/squadWelcomeAudience';
import { useToastNotification } from '@dailydotdev/shared/src/hooks/useToastNotification';
import { labels } from '@dailydotdev/shared/src/lib/labels';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import { getSquadId, hasSquadFeature } from '../lib/features';

export const useSquadWelcome = (squad: Squad) => {
  const { data, isPending, isError } = useQuery(
    squadWelcomeQueryOptions({ squad }),
  );

  return { welcome: data ?? emptySquadWelcome, isPending, isError };
};

// Parked: useOpenSquadWelcome (open the pop-up right after Join) needs
// LazyModal.SquadWelcome registered in components/modals; it is on the
// parked branch.

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
    // The API says what it rejected (a link it does not take, a long label)
    onError: (error: ApiErrorResult) =>
      displayToast(
        error?.response?.errors?.[0]?.message ?? labels.error.generic,
      ),
  });
};
