import type { DefaultError, MutationOptions } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import { UPDATE_CANDIDATE_PREFERENCES_MUTATION } from './graphql';
import type { EmploymentType, SalaryPeriod } from './protobuf/opportunity';
import type { CandidateStatus } from './protobuf/user-candidate-preference';
import type { LocationType } from './protobuf/util';
import type { EmptyResponse } from '../../graphql/emptyResponse';
import type { UserCandidatePreferences } from './types';
import type { UseUpdateQuery } from '../../hooks/useUpdateQuery';

type UpdatedPreferences = {
  status?: CandidateStatus;
  role?: string;
  roleType?: number;
  employmentType?: Array<EmploymentType>;
  salaryExpectation?: {
    min?: number;
    period?: SalaryPeriod;
  };
  location?: {
    city?: string;
    country?: string;
  };
  locationType?: Array<LocationType>;
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
    onError: (error) => {},
    onSuccess: (_, variables) => {
      const updatedPreferences: UserCandidatePreferences = {
        status: variables?.status,
        role: variables?.role,
        roleType: variables?.roleType,
        employmentType: variables?.employmentType,
        salaryExpectation: {
          min: variables?.salaryExpectation?.min,
          period: variables?.salaryExpectation?.period,
        },
        location: [
          {
            city: variables?.location?.city,
            country: variables?.location?.country,
          },
        ],
        locationType: variables?.locationType,
      };
      set({ ...preferences, ...updatedPreferences });
    },
  };
};
