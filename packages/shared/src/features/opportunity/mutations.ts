import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  ACCEPT_OPPORTUNITY_MATCH,
  CANDIDATE_KEYWORD_ADD_MUTATION,
  CANDIDATE_KEYWORD_REMOVE_MUTATION,
  CLEAR_EMPLOYMENT_AGREEMENT_MUTATION,
  CLEAR_RESUME_MUTATION,
  SAVE_OPPORTUNITY_SCREENING_ANSWERS,
  UPDATE_CANDIDATE_PREFERENCES_MUTATION,
  UPLOAD_EMPLOYMENT_AGREEMENT_MUTATION,
} from './graphql';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type {
  OpportunityScreeningAnswer,
  UserCandidatePreferences,
} from './types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';

export type UpdatedCandidatePreferences = Partial<UserCandidatePreferences>;

export const updateCandidatePreferencesMutationOptions = <
  T = UpdatedCandidatePreferences,
>(
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: (variables: T) => void,
): MutationOptions<EmptyResponse, DefaultError, T> => {
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
      successCallback?.(variables);
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

export const acceptOpportunityMatchMutationOptions = (
  opportunityId: string,
): MutationOptions<EmptyResponse> => {
  return {
    mutationFn: async () => {
      return gqlClient.request(ACCEPT_OPPORTUNITY_MATCH, {
        id: opportunityId,
      });
    },
  };
};

export const clearResumeMutationOptions = (
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: () => void,
): MutationOptions<EmptyResponse> => {
  const preferences = get();
  return {
    mutationFn: async () => {
      return gqlClient.request(CLEAR_RESUME_MUTATION);
    },
    onSuccess: () => {
      set({
        ...preferences,
        cv: undefined,
      });
      successCallback?.();
    },
  };
};

export const candidateAddKeywordMutationOptions = (
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: () => void,
): MutationOptions<EmptyResponse, DefaultError, Array<string>> => {
  const preferences = get();
  return {
    mutationFn: async (vars) =>
      gqlClient.request(CANDIDATE_KEYWORD_ADD_MUTATION, { keywords: vars }),
    onSuccess: (_, vars) => {
      const uniqueKeywords = new Set(
        [...preferences.keywords.map((k) => k.keyword), ...vars].filter(
          Boolean,
        ),
      );
      const keywords = Array.from(uniqueKeywords).map((k) => ({ keyword: k }));
      set({
        ...preferences,
        keywords,
      });
      successCallback?.();
    },
  };
};

export const candidateRemoveKeywordMutationOptions = (
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: () => void,
): MutationOptions<EmptyResponse, DefaultError, Array<string>> => {
  const preferences = get();
  return {
    mutationFn: async (vars) =>
      gqlClient.request(CANDIDATE_KEYWORD_REMOVE_MUTATION, {
        keywords: vars,
      }),
    onSuccess: (_, vars) => {
      const keywords = preferences.keywords?.filter(
        (k) => !vars.includes(k.keyword),
      );
      set({
        ...preferences,
        keywords,
      });
      successCallback?.();
    },
  };
};

export const uploadEmploymentAgreementMutationOptions = <T extends File = File>(
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: (file: T) => void,
): MutationOptions<EmptyResponse, DefaultError, T> => {
  const preferences = get();

  return {
    mutationFn: async (file) =>
      gqlClient.request(UPLOAD_EMPLOYMENT_AGREEMENT_MUTATION, { file }),
    onSuccess: (_, file) => {
      set({
        ...preferences,
        employmentAgreement: {
          fileName: file.name,
          lastModified: new Date(),
        },
      });
      successCallback?.(file);
    },
  };
};

export const clearEmploymentAgreementMutationOptions = (
  [get, set]: UseUpdateQuery<UserCandidatePreferences>,
  successCallback?: () => void,
): MutationOptions<EmptyResponse> => {
  const preferences = get();
  return {
    mutationFn: async () => {
      return gqlClient.request(CLEAR_EMPLOYMENT_AGREEMENT_MUTATION);
    },
    onSuccess: () => {
      set({
        ...preferences,
        employmentAgreement: undefined,
      });
      successCallback?.();
    },
  };
};
