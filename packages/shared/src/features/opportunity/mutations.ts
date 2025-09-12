import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  SAVE_OPPORTUNITY_SCREENING_ANSWERS,
  UPDATE_CANDIDATE_PREFERENCES_MUTATION,
} from './graphql';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type {
  OpportunityScreeningAnswer,
  UserCandidatePreferences,
} from './types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';

export type UpdatedCandidatePreferences = Partial<UserCandidatePreferences>;

export const updateCandidatePreferencesMutationOptions = (
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: () => void,
): MutationOptions<
  EmptyResponse,
  DefaultError,
  UpdatedCandidatePreferences
> => {
  const preferences = get();

  return {
    mutationFn: async (updatedPreferences) =>
      gqlClient.request(
        UPDATE_CANDIDATE_PREFERENCES_MUTATION,
        updatedPreferences,
      ),
    onSuccess: (_, variables) => {
      set({
        ...preferences,
        ...variables,
      });
      successCallback?.();
    },
  };
};

export const saveOpportunityScreeningAnswersMutationOptions = (
  opportunityId: string,
): MutationOptions<
  EmptyResponse,
  DefaultError,
  Array<OpportunityScreeningAnswer>
> => {
  return {
    mutationFn: async (answers) => {
      return gqlClient.request(SAVE_OPPORTUNITY_SCREENING_ANSWERS, {
        id: opportunityId,
        answers,
      });
    },
  };
};
