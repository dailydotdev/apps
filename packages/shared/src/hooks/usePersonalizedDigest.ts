import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type {
  UserPersonalizedDigest,
  UserPersonalizedDigestSubscribe,
} from '../graphql/users';
import {
  GET_PERSONALIZED_DIGEST_SETTINGS,
  SUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION,
  UserPersonalizedDigestType,
} from '../graphql/users';
import { RequestKey, StaleTime, generateQueryKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';
import {
  ApiError,
  type ApiErrorResult,
  getApiError,
  gqlClient,
} from '../graphql/common';

export enum SendType {
  Weekly = 'weekly',
  Workdays = 'workdays',
  Daily = 'daily',
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
    flags?: Pick<UserPersonalizedDigest['flags'], 'sendType'>;
  }) => Promise<UserPersonalizedDigest>;
  unsubscribePersonalizedDigest: (params?: {
    type?: UserPersonalizedDigestType;
  }) => Promise<null>;
};

type PersonalizedDigestData = UserPersonalizedDigest[] | null;
type SubscribePersonalizedDigestParams =
  | {
      hour?: number;
      type?: UserPersonalizedDigestType;
      sendType?: SendType;
      flags?: Pick<UserPersonalizedDigest['flags'], 'sendType'>;
    }
  | undefined;
type UnsubscribePersonalizedDigestParams =
  | {
      type?: UserPersonalizedDigestType;
    }
  | undefined;

export const usePersonalizedDigest = (): UsePersonalizedDigest => {
  const { isLoggedIn, user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.PersonalizedDigest, user);

  const { data = null, isPending } = useQuery<PersonalizedDigestData>({
    queryKey,
    queryFn: async () => {
      try {
        const result = await gqlClient.request<{
          personalizedDigest: UserPersonalizedDigest[];
        }>(GET_PERSONALIZED_DIGEST_SETTINGS, {});

        return result.personalizedDigest ?? null;
      } catch (error) {
        const notFoundError = getApiError(
          error as ApiErrorResult,
          ApiError.NotFound,
        );

        if (
          notFoundError?.message === 'Not subscribed to personalized digest'
        ) {
          return null;
        }

        throw error;
      }
    },
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  });

  const getPersonalizedDigest = useCallback(
    (type: UserPersonalizedDigestType): null | UserPersonalizedDigest => {
      if (!type || !data) {
        return null;
      }

      return data.find((item) => item.type === type) ?? null;
    },
    [data],
  );

  const { mutateAsync: subscribePersonalizedDigest } = useMutation<
    UserPersonalizedDigest,
    Error,
    SubscribePersonalizedDigestParams,
    () => void
  >({
    mutationFn: async (params) => {
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

    onMutate: async (params) => {
      const {
        hour = 8,
        type = UserPersonalizedDigestType.Digest,
        sendType,
        flags,
      } = params || {};
      const currentData = data ?? [];
      await queryClient.cancelQueries({ queryKey });
      const existingData = currentData.find((item) => item.type === type);
      const newValues = {
        ...existingData,
        ...(hour && { preferredHour: hour }),
        ...(type && { type }),
        flags: {
          ...existingData?.flags,
          ...flags,
          ...(sendType && { sendType }),
        },
      };
      queryClient.setQueryData(
        queryKey,
        [...currentData.filter((item) => item.type !== type), newValues],
      );

      return () => {
        queryClient.setQueryData(queryKey, null);
      };
    },

    onError: (_, __, rollback) => {
      rollback?.();
    },
  });

  const { mutateAsync: unsubscribePersonalizedDigest } = useMutation<
    null,
    Error,
    UnsubscribePersonalizedDigestParams,
    () => void
  >({
    mutationFn: async (params) => {
      const { type = UserPersonalizedDigestType.Digest } = params || {};
      await gqlClient.request(UNSUBSCRIBE_PERSONALIZED_DIGEST_MUTATION, {
        type,
      });

      return null;
    },

    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey });
      const { type = UserPersonalizedDigestType.Digest } = params || {};
      queryClient.setQueryData(
        queryKey,
        data?.filter((item) => item.type !== type) ?? null,
      );

      return () => {
        queryClient.setQueryData(queryKey, data);
      };
    },

    onError: (_, __, rollback) => {
      rollback?.();
    },
  });

  return {
    getPersonalizedDigest,
    isLoading: isPending,
    subscribePersonalizedDigest: (params) => subscribePersonalizedDigest(params),
    unsubscribePersonalizedDigest: (params) =>
      unsubscribePersonalizedDigest(params),
  };
};
