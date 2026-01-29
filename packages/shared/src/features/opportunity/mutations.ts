import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import type z from 'zod';
import type {
  ApiErrorResult,
  ApiZodErrorExtension,
} from '../../graphql/common';
import { gqlClient, ApiError } from '../../graphql/common';
import {
  ACCEPT_OPPORTUNITY_MATCH,
  ADD_OPPORTUNITY_SEATS_MUTATION,
  CANDIDATE_KEYWORD_ADD_MUTATION,
  CANDIDATE_KEYWORD_REMOVE_MUTATION,
  CLAIM_OPPORTUNITIES_MUTATION,
  CLEAR_EMPLOYMENT_AGREEMENT_MUTATION,
  CLEAR_RECRUITER_ORGANIZATION_IMAGE_MUTATION,
  CLEAR_RESUME_MUTATION,
  CREATE_ORGANIZATION_FOR_OPPORTUNITY_MUTATION,
  EDIT_OPPORTUNITY_MUTATION,
  OPPORTUNITY_APPLY_MUTATION,
  PARSE_OPPORTUNITY_MUTATION,
  REIMPORT_OPPORTUNITY_MUTATION,
  RECOMMEND_OPPORTUNITY_SCREENING_QUESTIONS_MUTATION,
  RECRUITER_ACCEPT_OPPORTUNITY_MATCH_MUTATION,
  RECRUITER_REJECT_OPPORTUNITY_MATCH_MUTATION,
  REJECT_OPPORTUNITY_MATCH,
  SAVE_OPPORTUNITY_FEEDBACK_ANSWERS,
  SAVE_OPPORTUNITY_SCREENING_ANSWERS,
  UPDATE_CANDIDATE_PREFERENCES_MUTATION,
  UPDATE_OPPORTUNITY_STATE_MUTATION,
  UPDATE_RECRUITER_ORGANIZATION_MUTATION,
  UPLOAD_EMPLOYMENT_AGREEMENT_MUTATION,
} from './graphql';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type {
  Opportunity,
  OpportunitiesClaim,
  OpportunityMatch,
  OpportunityScreeningAnswer,
  UserCandidatePreferences,
} from './types';
import { OpportunityMatchStatus } from './types';
import type { Organization } from '../organizations/types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';
import type {
  addOpportunitySeatsSchema,
  opportunityEditContentSchema,
  opportunityEditInfoSchema,
  opportunityEditQuestionsSchema,
} from '../../lib/schema/opportunity';
import type { recruiterOrganizationEditSchema } from '../organizations/schema';
import type { OpportunityState } from './protobuf/opportunity';
import type { opportunityEditRecruiterSchema } from '../../components/opportunity/OpportunityEditModal/OpportunityEditRecruiterModal';

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

export const saveOpportunityFeedbackAnswersMutationOptions = (
  opportunityId: string,
): MutationOptions<
  EmptyResponse,
  DefaultError,
  Array<OpportunityScreeningAnswer>
> => {
  return {
    mutationFn: async (answers) => {
      return gqlClient.request(SAVE_OPPORTUNITY_FEEDBACK_ANSWERS, {
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

export const rejectOpportunityMatchMutationOptions = (
  opportunityId: string,
  [get, set]: UseUpdateQuery<OpportunityMatch>,
): MutationOptions<EmptyResponse> => {
  const match = get();
  return {
    mutationFn: async () =>
      gqlClient.request(REJECT_OPPORTUNITY_MATCH, {
        id: opportunityId,
      }),
    onSuccess: () => {
      set({
        ...match,
        status: OpportunityMatchStatus.CandidateRejected,
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

export const editOpportunityInfoMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: z.infer<typeof opportunityEditInfoSchema>;
    }) => {
      const result = await gqlClient.request<{
        editOpportunity: Opportunity;
      }>(EDIT_OPPORTUNITY_MUTATION, {
        id,
        payload,
      });

      return result.editOpportunity;
    },
  };
};

export const editOpportunityContentMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: z.infer<typeof opportunityEditContentSchema>;
    }) => {
      const result = await gqlClient.request<{
        editOpportunity: Opportunity;
      }>(EDIT_OPPORTUNITY_MUTATION, {
        id,
        payload,
      });

      return result.editOpportunity;
    },
  };
};

export const editOpportunityQuestionMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: z.infer<typeof opportunityEditQuestionsSchema>;
    }) => {
      const result = await gqlClient.request<{
        editOpportunity: Opportunity;
      }>(EDIT_OPPORTUNITY_MUTATION, {
        id,
        payload,
      });

      return result.editOpportunity;
    },
  };
};

export const createOrganizationForOpportunityMutationOptions = () => {
  return {
    mutationFn: async ({ opportunityId }: { opportunityId: string }) => {
      const result = await gqlClient.request<{
        createOrganizationForOpportunity: Organization;
      }>(CREATE_ORGANIZATION_FOR_OPPORTUNITY_MUTATION, {
        opportunityId,
      });

      return result.createOrganizationForOpportunity;
    },
  };
};

export const updateRecruiterOrganizationMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
      organizationImage,
    }: {
      id: string;
      payload: z.infer<typeof recruiterOrganizationEditSchema>;
      organizationImage?: File;
    }) => {
      const result = await gqlClient.request<{
        updateRecruiterOrganization: Organization;
      }>(UPDATE_RECRUITER_ORGANIZATION_MUTATION, {
        id,
        payload,
        organizationImage,
      });

      return result.updateRecruiterOrganization;
    },
  };
};

export const clearRecruiterOrganizationImageMutationOptions =
  (): MutationOptions<EmptyResponse, DefaultError, { id: string }> => {
    return {
      mutationFn: async ({ id }: { id: string }) => {
        return gqlClient.request(CLEAR_RECRUITER_ORGANIZATION_IMAGE_MUTATION, {
          id,
        });
      },
    };
  };

export const editOpportunityRecruiterMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: z.infer<typeof opportunityEditRecruiterSchema>;
    }) => {
      const result = await gqlClient.request<{
        editOpportunity: Opportunity;
      }>(EDIT_OPPORTUNITY_MUTATION, {
        id,
        payload,
      });

      return result.editOpportunity;
    },
  };
};

export const recommendOpportunityScreeningQuestionsOptions = () => {
  return {
    mutationFn: async ({ id }: { id: string }) => {
      const result = await gqlClient.request<{
        recommendOpportunityScreeningQuestions: Opportunity['questions'];
      }>(RECOMMEND_OPPORTUNITY_SCREENING_QUESTIONS_MUTATION, {
        id,
      });

      return result.recommendOpportunityScreeningQuestions;
    },
  };
};

export const updateOpportunityStateOptions = () => {
  return {
    mutationFn: async ({
      id,
      state,
    }: {
      id: string;
      state: OpportunityState;
    }): Promise<{
      state: OpportunityState;
    }> => {
      await gqlClient.request<{
        updateOpportunityState: EmptyResponse;
      }>(UPDATE_OPPORTUNITY_STATE_MUTATION, {
        id,
        state,
      });

      return {
        state,
      };
    },
  };
};

export const recruiterAcceptOpportunityMatchMutationOptions =
  (): MutationOptions<
    EmptyResponse,
    DefaultError,
    { opportunityId: string; candidateUserId: string }
  > => {
    return {
      mutationFn: async ({ opportunityId, candidateUserId }) => {
        return gqlClient.request(RECRUITER_ACCEPT_OPPORTUNITY_MATCH_MUTATION, {
          opportunityId,
          candidateUserId,
        });
      },
    };
  };

export const recruiterRejectOpportunityMatchMutationOptions =
  (): MutationOptions<
    EmptyResponse,
    DefaultError,
    { opportunityId: string; candidateUserId: string }
  > => {
    return {
      mutationFn: async ({ opportunityId, candidateUserId }) => {
        return gqlClient.request(RECRUITER_REJECT_OPPORTUNITY_MATCH_MUTATION, {
          opportunityId,
          candidateUserId,
        });
      },
    };
  };

export const PARSE_OPPORTUNITY_ERROR_MESSAGE =
  'We could not extract the job details from your submission. Please try a different file or URL.';

export const getParseOpportunityMutationErrorMessage = (
  error?: ApiErrorResult,
): string => {
  if (!error) {
    return PARSE_OPPORTUNITY_ERROR_MESSAGE;
  }

  const isZodError =
    error?.response?.errors?.[0]?.extensions?.code ===
    ApiError.ZodValidationError;

  if (isZodError) {
    const zodError = error as ApiErrorResult<ApiZodErrorExtension>;
    return (
      zodError.response.errors[0].extensions.issues?.find(
        (issue) => issue.code === 'custom',
      )?.message || PARSE_OPPORTUNITY_ERROR_MESSAGE
    );
  }

  if (error?.response?.errors?.[0]?.extensions?.code === ApiError.Unexpected) {
    return PARSE_OPPORTUNITY_ERROR_MESSAGE;
  }

  return (
    error?.response?.errors?.[0]?.message || PARSE_OPPORTUNITY_ERROR_MESSAGE
  );
};

export const parseOpportunityMutationOptions = () => {
  return {
    mutationFn: async ({ file, url }: { file?: File; url?: string }) => {
      const result = await gqlClient.request<{
        parseOpportunity: Opportunity;
      }>(PARSE_OPPORTUNITY_MUTATION, {
        payload: {
          file,
          url,
        },
      });

      return result.parseOpportunity;
    },
  };
};

export const reimportOpportunityMutationOptions = () => {
  return {
    mutationFn: async ({
      opportunityId,
      file,
      url,
    }: {
      opportunityId: string;
      file?: File;
      url?: string;
    }) => {
      const result = await gqlClient.request<{
        reimportOpportunity: Opportunity;
      }>(REIMPORT_OPPORTUNITY_MUTATION, {
        payload: {
          opportunityId,
          file,
          url,
        },
      });

      return result.reimportOpportunity;
    },
  };
};

export const addOpportunitySeatsMutationOptions = () => {
  return {
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: z.infer<typeof addOpportunitySeatsSchema>;
    }): Promise<void> => {
      await gqlClient.request<{
        addOpportunitySeats: EmptyResponse;
      }>(ADD_OPPORTUNITY_SEATS_MUTATION, {
        id,
        payload,
      });
    },
  };
};

export const claimOpportunitiesMutationOptions = (): MutationOptions<
  OpportunitiesClaim,
  DefaultError,
  { identifier: string }
> => {
  return {
    mutationFn: async ({ identifier }) => {
      const result = await gqlClient.request<{
        claimOpportunities: OpportunitiesClaim;
      }>(CLAIM_OPPORTUNITIES_MUTATION, {
        identifier,
      });

      return result.claimOpportunities;
    },
  };
};

export const opportunityApplyMutationOptions = (): MutationOptions<
  OpportunityMatch,
  DefaultError,
  { id: string }
> => {
  return {
    mutationFn: async ({ id }) => {
      const result = await gqlClient.request<{
        opportunityApply: OpportunityMatch;
      }>(OPPORTUNITY_APPLY_MUTATION, {
        id,
      });

      return result.opportunityApply;
    },
  };
};
