import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import {
  PERSONAL_ACCESS_TOKENS_QUERY,
  CREATE_PERSONAL_ACCESS_TOKEN_MUTATION,
  REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION,
} from '../../graphql/personalAccessTokens';
import type {
  PersonalAccessTokensData,
  CreatePersonalAccessTokenData,
  CreatePersonalAccessTokenInput,
  RevokePersonalAccessTokenData,
} from '../../graphql/personalAccessTokens';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

export const personalAccessTokensQueryOptions = () => ({
  queryKey: generateQueryKey(RequestKey.PersonalAccessTokens),
  queryFn: async () => {
    const data = await gqlClient.request<PersonalAccessTokensData>(
      PERSONAL_ACCESS_TOKENS_QUERY,
    );
    return data.personalAccessTokens;
  },
  staleTime: StaleTime.OneMinute,
});

export const usePersonalAccessTokens = () => {
  const { user } = useAuthContext();

  return useQuery({
    ...personalAccessTokensQueryOptions(),
    enabled: !!user,
  });
};

export const useCreatePersonalAccessToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePersonalAccessTokenInput) => {
      const data = await gqlClient.request<CreatePersonalAccessTokenData>(
        CREATE_PERSONAL_ACCESS_TOKEN_MUTATION,
        { input },
      );
      return data.createPersonalAccessToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.PersonalAccessTokens),
      });
    },
  });
};

export const useRevokePersonalAccessToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await gqlClient.request<RevokePersonalAccessTokenData>(
        REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION,
        { id },
      );
      return data.revokePersonalAccessToken;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.PersonalAccessTokens),
      });
    },
  });
};
