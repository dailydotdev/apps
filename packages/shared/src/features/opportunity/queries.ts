import type {
  QueryFunctionContext,
  QueryKey,
  UseQueryOptions,
} from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import type { Connection } from '../../graphql/common';
import type {
  Keyword,
  Opportunity,
  OpportunityMatch,
  OpportunityPreviewResponse,
  OpportunityStats,
  UserCandidatePreferences,
} from './types';
import {
  AUTOCOMPLETE_KEYWORDS_QUERY,
  GET_CANDIDATE_PREFERENCES_QUERY,
  GET_OPPORTUNITY_MATCH_QUERY,
  OPPORTUNITY_MATCHES_QUERY,
  OPPORTUNITIES_QUERY,
  OPPORTUNITY_BY_ID_QUERY,
  USER_OPPORTUNITY_MATCHES_QUERY,
  OPPORTUNITY_PREVIEW,
  OPPORTUNITY_STATS_QUERY,
} from './graphql';
import type { LoggedUser } from '../../lib/user';
import { disabledRefetch } from '../../lib/func';
import { fetchPricingPreview, PurchaseType } from '../../graphql/paddle';

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
    staleTime: query.length === 0 ? StaleTime.OneHour : StaleTime.Default,
    enabled: query.length >= 2,
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

export const getUserOpportunityMatchesOptions = ({
  after,
  first = 20,
}: {
  after?: string;
  first?: number;
} = {}): UseQueryOptions<Connection<OpportunityMatch>> => {
  return {
    queryKey: [RequestKey.UserOpportunityMatches, after, first],
    queryFn: async () => {
      const res = await gqlClient.request<{
        userOpportunityMatches: Connection<OpportunityMatch>;
      }>(USER_OPPORTUNITY_MATCHES_QUERY, {
        after,
        first,
      });

      return res.userOpportunityMatches;
    },
    staleTime: StaleTime.Default,
  };
};

// Query Function
export const getOpportunityPreview = async ({
  opportunityId,
}): Promise<OpportunityPreviewResponse> => {
  const result = await gqlClient.request<{
    opportunityPreview: OpportunityPreviewResponse;
  }>(OPPORTUNITY_PREVIEW, {
    opportunityId,
  });

  return result.opportunityPreview;
};

export const opportunityPreviewQueryOptions = ({
  opportunityId,
  user,
  enabled = true,
}: {
  opportunityId?: string;
  user?: LoggedUser;
  enabled?: boolean;
}) => {
  return {
    queryKey: generateQueryKey(RequestKey.OpportunityPreview, user, {
      opportunityId,
    }),
    queryFn: () => getOpportunityPreview({ opportunityId }),
    enabled: !!user && !!enabled,
    ...disabledRefetch,
    staleTime: Infinity,
    gcTime: Infinity,
  };
};

export const opportunityStatsOptions = ({
  opportunityId,
}: {
  opportunityId: string;
}): UseQueryOptions<OpportunityStats> => {
  return {
    queryKey: [RequestKey.OpportunityStats, opportunityId],
    queryFn: async () => {
      const res = await gqlClient.request<{
        opportunityStats: OpportunityStats;
      }>(OPPORTUNITY_STATS_QUERY, {
        opportunityId,
      });

      return res.opportunityStats;
    },
    staleTime: StaleTime.Default,
    enabled: !!opportunityId,
  };
};

export const recruiterPricesQueryOptions = ({
  isLoggedIn,
  user,
}: {
  isLoggedIn: boolean;
  user: LoggedUser;
}) => {
  return {
    queryKey: generateQueryKey(
      RequestKey.PricePreview,
      user,
      PurchaseType.Recruiter,
    ),
    queryFn: async () => {
      return fetchPricingPreview(PurchaseType.Recruiter);
    },
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  };
};
