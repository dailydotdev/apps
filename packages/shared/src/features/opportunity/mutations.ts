import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { UPDATE_CANDIDATE_PREFERENCES_MUTATION } from './graphql';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type { UserCandidatePreferences } from './types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';

type UpdatedPreferences = Partial<
  Omit<UserCandidatePreferences, 'location'>
> & {
  location?: Partial<
    Pick<UserCandidatePreferences['location'][0], 'city' | 'country'>
  >;
};

export const updateCandidatePreferencesMutationOptions = ([
  get,
  set,
]: UseUpdateQuery<UserCandidatePreferences>): MutationOptions<
  EmptyResponse,
  DefaultError,
  UpdatedPreferences
> => {
  const preferences = get();

  return {
    mutationFn: async (updatedPreferences) => {
      return gqlClient.request(
        UPDATE_CANDIDATE_PREFERENCES_MUTATION,
        updatedPreferences,
      );
    },
    // TODO: add error handling
    // onError: (error) => {},
    onSuccess: (_, variables) => {
      set({
        ...preferences,
        ...variables,
        ...(!!variables.location && {
          location: [variables.location],
        }),
      });
    },
  };
};
