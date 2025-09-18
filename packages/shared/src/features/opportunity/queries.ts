import type {
  QueryFunctionContext,
  QueryKey,
  UseQueryOptions,
} from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type {
  Keyword,
  Opportunity,
  OpportunityMatch,
  UserCandidatePreferences,
} from './types';
import {
  AUTOCOMPLETE_KEYWORDS_QUERY,
  GET_CANDIDATE_PREFERENCES_QUERY,
  GET_OPPORTUNITY_MATCH_QUERY,
  OPPORTUNITY_BY_ID_QUERY,
} from './graphql';

export const getOpportunityByIdKey = (id: string): QueryKey => [
  RequestKey.Opportunity,
  id,
];

type QueryOptionsType<T> = Omit<UseQueryOptions<T>, 'queryFn'> & {
  queryFn: (ctx?: QueryFunctionContext) => T | Promise<T>;
};

export const opportunityByIdOptions = ({
  id,
}: {
  id: string;
}): QueryOptionsType<Opportunity> => {
  return {
    queryKey: getOpportunityByIdKey(id),
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunityById: Opportunity;
      }>(OPPORTUNITY_BY_ID_QUERY, {
        id,
      });

      return res.opportunityById;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

export const opportunityMatchOptions = ({
  id,
}: {
  id: string;
}): QueryOptionsType<OpportunityMatch> => {
  return {
    queryKey: [...getOpportunityByIdKey(id), 'match'],
    queryFn: async () => {
      const res = await gqlClient.request<{
        getOpportunityMatch: OpportunityMatch;
      }>(GET_OPPORTUNITY_MATCH_QUERY, {
        id,
      });

      return res.getOpportunityMatch;
    },
    staleTime: StaleTime.Default,
    enabled: !!id,
  };
};

export const getCandidatePreferencesOptions = (
  userId: string,
): QueryOptionsType<UserCandidatePreferences> => {
  return {
    queryKey: [RequestKey.UserCandidatePreferences, userId],
    queryFn: async () => {
      const res = await gqlClient.request<{
        getCandidatePreferences: UserCandidatePreferences;
      }>(GET_CANDIDATE_PREFERENCES_QUERY);

      return res.getCandidatePreferences;
    },
    staleTime: StaleTime.Default,
    enabled: !!userId,
  };
};

export const getKeywordAutocompleteOptions = (
  query: string,
): UseQueryOptions<Array<Keyword>> => {
  return {
    queryKey: [RequestKey.KeywordAutocomplete, query],
    queryFn: async () => {
      const res = await gqlClient.request<{
        autocompleteKeywords: Array<{
          keyword: string;
          title?: string;
        }>;
      }>(AUTOCOMPLETE_KEYWORDS_QUERY, {
        query,
        limit: 10,
      });

      return res.autocompleteKeywords;
    },
    staleTime: StaleTime.Default,
    enabled: query.length === 0 || query.length >= 2,
    placeholderData: keepPreviousData,
  };
};
