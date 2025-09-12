import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { UPDATE_CANDIDATE_PREFERENCES_MUTATION } from './graphql';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type { UserCandidatePreferences } from './types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';

export type UpdatedCandidatePreferences = Partial<UserCandidatePreferences>;

export const updateCandidatePreferencesMutationOptions = ([
  get,
  set,
]: UseUpdateQuery<UserCandidatePreferences>): MutationOptions<
  EmptyResponse,
  DefaultError,
  UpdatedCandidatePreferences
> => {
  const preferences = get();

  return {
    mutationFn: async (updatedPreferences) => {
      return gqlClient.request(
        UPDATE_CANDIDATE_PREFERENCES_MUTATION,
        updatedPreferences,
      );
    },
    onSuccess: (_, variables) => {
      set({
        ...preferences,
        ...variables,
      });
    },
  };
};
