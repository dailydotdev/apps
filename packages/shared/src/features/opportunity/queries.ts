import type {
  QueryFunctionContext,
  QueryKey,
  UseQueryOptions,
} from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type { Connection } from '../../graphql/common';
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
  OPPORTUNITY_MATCHES_QUERY,
  OPPORTUNITIES_QUERY,
  OPPORTUNITY_BY_ID_QUERY,
} from './graphql';

export const getOpportunityByIdKey = (id: string): QueryKey => [
  RequestKey.Opportunity,
  id,
];

type QueryOptionsType<T> = Omit<UseQueryOptions<T>, 'queryFn'> & {
  queryFn: (ctx?: QueryFunctionContext) => T | Promise<T>;
};

export const opportunityByIdOptions = ({ id }: { id: string }) => {
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
        opportunityMatch: OpportunityMatch;
      }>(GET_OPPORTUNITY_MATCH_QUERY, {
        id,
      });

      return res.opportunityMatch;
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
    staleTime: query.length === 0 ? StaleTime.OneHour : StaleTime.Default,
    enabled: query.length === 0 || query.length >= 2,
    placeholderData: keepPreviousData,
  };
};

export const getOpportunitiesOptions = (
  state?: string,
  after?: string,
  first = 20,
): UseQueryOptions<Connection<Opportunity>> => {
  return {
    queryKey: [RequestKey.Opportunities, state, after, first],
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunities: Connection<Opportunity>;
      }>(OPPORTUNITIES_QUERY, {
        state,
        after,
        first,
      });

      return res.opportunities;
    },
    staleTime: StaleTime.Default,
  };
};

export const getOpportunityMatchesOptions = ({
  opportunityId,
  after,
  first = 20,
}: {
  opportunityId: string;
  after?: string;
  first?: number;
}): UseQueryOptions<Connection<OpportunityMatch>> => {
  return {
    queryKey: [RequestKey.OpportunityMatches, opportunityId, after, first],
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunityMatches: Connection<OpportunityMatch>;
      }>(OPPORTUNITY_MATCHES_QUERY, {
        opportunityId,
        after,
        first,
      });

      return res.opportunityMatches;
    },
    staleTime: StaleTime.Default,
    enabled: !!opportunityId,
  };
};
