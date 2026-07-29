import { gql } from 'graphql-request';
import { gqlClient } from './common';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { LoggedUser } from '../lib/user';

export type StreakFreezeProduct = {
  id: string;
  name: string;
  value: number;
  image: string;
  flags: {
    quantity: number;
    description?: string;
  };
};

export const STREAK_FREEZE_PRODUCTS_QUERY = gql`
  query StreakFreezeProducts {
    streakFreezeProducts {
      id
      name
      value
      image
      flags {
        quantity
        description
      }
    }
  }
`;

export const streakFreezeProductsQueryOptions = () => {
  return {
    queryKey: generateQueryKey(RequestKey.StreakFreezeProducts),
    queryFn: async (): Promise<StreakFreezeProduct[]> => {
      const result = await gqlClient.request<{
        streakFreezeProducts: StreakFreezeProduct[];
      }>(STREAK_FREEZE_PRODUCTS_QUERY);

      return result.streakFreezeProducts;
    },
    staleTime: StaleTime.Default,
  };
};

export const USER_STREAK_FREEZE_DATES_QUERY = gql`
  query UserStreakFreezeDates($limit: Int) {
    userStreakFreezeDates(limit: $limit)
  }
`;

export const userStreakFreezeDatesQueryOptions = ({
  user,
  limit,
}: {
  user?: Pick<LoggedUser, 'id'>;
  limit?: number;
} = {}) => {
  return {
    queryKey: generateQueryKey(RequestKey.StreakFreezeDates, user, { limit }),
    queryFn: async (): Promise<string[]> => {
      const result = await gqlClient.request<{
        userStreakFreezeDates: string[];
      }>(USER_STREAK_FREEZE_DATES_QUERY, { limit });

      return result.userStreakFreezeDates;
    },
    enabled: !!user?.id,
    staleTime: StaleTime.Default,
  };
};

export type PurchaseStreakFreezeResult = {
  freezesAvailable: number;
  balance: LoggedUser['balance'];
  transactionId: string;
};

export const PURCHASE_STREAK_FREEZE_MUTATION = gql`
  mutation PurchaseStreakFreeze($productId: ID!) {
    purchaseStreakFreeze(productId: $productId) {
      freezesAvailable
      balance {
        amount
      }
      transactionId
    }
  }
`;

export const purchaseStreakFreeze = async (
  productId: string,
): Promise<PurchaseStreakFreezeResult> => {
  const result = await gqlClient.request<{
    purchaseStreakFreeze: PurchaseStreakFreezeResult;
  }>(PURCHASE_STREAK_FREEZE_MUTATION, { productId });

  return result.purchaseStreakFreeze;
};

// Locked product decision: a user can never hold more than this many freezes.
export const STREAK_FREEZE_CAP = 5;
