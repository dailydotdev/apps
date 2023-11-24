import request from 'graphql-request';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UserPersonalizedDigest,
  UserPersonalizedDigestSubscribe,
} from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { RequestKey, generateQueryKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';
import { ApiError, getApiError } from '../graphql/common';

export type UsePersonalizedDigest = {
  personalizedDigest: UserPersonalizedDigest | null;
  isLoading: boolean;
  subscribePersonalizedDigest: () => Promise<UserPersonalizedDigest>;
  unsubscribePersonalizedDigest: () => Promise<null>;
};

export const usePersonalizedDigest = (): UsePersonalizedDigest => {
  const { isLoggedIn, user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.PersonalizedDigest, user);

  const { data: personalizedDigest, isLoading } = useQuery(
    queryKey,
    async () => {
      try {
        const result = await request<{
          personalizedDigest: UserPersonalizedDigest;
        }>(graphqlUrl, GET_PERSONALIZED_DIGEST_SETTINGS, {});

        return result.personalizedDigest;
      } catch (error) {
        const notFoundError = getApiError(error, ApiError.NotFound);

        if (
          notFoundError?.message === 'Not subscribed to personalized digest'
        ) {
          return null;
        }

        throw error;
      }
    },
    {
      enabled: isLoggedIn,
    },
  );

  const { mutateAsync: subscribePersonalizedDigest } = useMutation(
    async () => {
      const result = await request<
        {
          subscribePersonalizedDigest: UserPersonalizedDigest;
        },
        Partial<UserPersonalizedDigestSubscribe>
      >(graphqlUrl, SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, {
        day: 3,
        hour: 8,
        timezone: user?.timezone || undefined,
      });

      queryClient.setQueryData(queryKey, result.subscribePersonalizedDigest);

      return result.subscribePersonalizedDigest;
    },
    {
      onMutate: () => {
        queryClient.setQueryData(queryKey, {});

        return () => {
          queryClient.setQueryData(queryKey, null);
        };
      },
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  const { mutateAsync: unsubscribePersonalizedDigest } = useMutation(
    async () => {
      await request(graphqlUrl, UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, {});

      return null;
    },
    {
      onMutate: () => {
        queryClient.setQueryData(queryKey, null);

        return () => {
          queryClient.setQueryData(queryKey, personalizedDigest);
        };
      },
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  return {
    personalizedDigest,
    isLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  };
};
