import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UserPersonalizedDigest,
  UserPersonalizedDigestSubscribe,
  UserPersonalizedDigestType,
} from '../graphql/users';
import { RequestKey, generateQueryKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';
import { ApiError, getApiError, gqlClient } from '../graphql/common';

export enum SendType {
  Weekly = 'weekly',
  Workdays = 'workdays',
  Off = 'off',
}
export type UsePersonalizedDigest = {
  getPersonalizedDigest: (
    type: UserPersonalizedDigestType,
  ) => UserPersonalizedDigest | null;
  isLoading: boolean;
  subscribePersonalizedDigest: (params?: {
    hour?: number;
    type?: UserPersonalizedDigestType;
    sendType?: SendType;
  }) => Promise<UserPersonalizedDigest>;
  unsubscribePersonalizedDigest: (params?: {
    type?: UserPersonalizedDigestType;
  }) => Promise<null>;
};

export const usePersonalizedDigest = (): UsePersonalizedDigest => {
  const { isLoggedIn, user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.PersonalizedDigest, user);

  const { data, isLoading } = useQuery(
    queryKey,
    async () => {
      try {
        const result = await gqlClient.request<{
          personalizedDigest: UserPersonalizedDigest[];
        }>(GET_PERSONALIZED_DIGEST_SETTINGS, {});

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

  const getPersonalizedDigest = useCallback(
    (type: UserPersonalizedDigestType): null | UserPersonalizedDigest => {
      if (!type || !data) {
        return null;
      }

      return data.find((item) => item.type === type);
    },
    [data],
  );

  const { mutateAsync: subscribePersonalizedDigest } = useMutation(
    async (params: {
      hour?: number;
      type?: UserPersonalizedDigestType;
      sendType?: SendType;
    }) => {
      const {
        hour = 8,
        type = UserPersonalizedDigestType.Digest,
        sendType,
      } = params || {};
      const result = await gqlClient.request<
        {
          subscribePersonalizedDigest: UserPersonalizedDigest;
        },
        Partial<UserPersonalizedDigestSubscribe>
      >(SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, {
        day: 3,
        hour,
        type,
        sendType,
      });

      return result.subscribePersonalizedDigest;
    },
    {
      onMutate: async (params) => {
        const {
          hour = 8,
          type = UserPersonalizedDigestType.Digest,
          sendType,
        } = params || {};
        await queryClient.cancelQueries({ queryKey });
        const existingData = data?.find((item) => item.type === type);
        const newValues = {
          ...existingData,
          ...(hour && { preferredHour: hour }),
          ...(type && { type }),
          ...(sendType && { flags: { sendType } }),
        };
        queryClient.setQueryData(
          queryKey,
          data?.length >= 0
            ? [...data.filter((item) => item.type !== type), newValues]
            : [newValues],
        );

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
    async (params: { type?: UserPersonalizedDigestType }) => {
      const { type = UserPersonalizedDigestType.Digest } = params || {};
      await gqlClient.request(UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, {
        type,
      });

      return null;
    },
    {
      onMutate: async (params) => {
        await queryClient.cancelQueries({ queryKey });
        const { type = UserPersonalizedDigestType.Digest } = params || {};
        queryClient.setQueryData(
          queryKey,
          data?.filter((item) => item.type !== type),
        );

        return () => {
          queryClient.setQueryData(queryKey, data);
        };
      },
      onError: (_, __, rollback) => {
        rollback?.();
      },
    },
  );

  return {
    getPersonalizedDigest,
    isLoading,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  };
};
