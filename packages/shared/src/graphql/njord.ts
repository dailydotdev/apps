/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { AwardTypes } from '../contexts/GiveAwardModalContext';
import type { LoggedUser } from '../lib/user';
import { PRODUCT_FRAGMENT, TRANSACTION_FRAGMENT } from './fragments';
import type { Author } from './comments';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { getCorePricePreviews } from './paddle';

export const AWARD_MUTATION = gql`
  mutation award(
    $productId: ID!
    $type: AwardType!
    $entityId: ID!
    $note: String
  ) {
    award(
      productId: $productId
      type: $type
      entityId: $entityId
      note: $note
    ) {
      transactionId
      balance {
        amount
      }
    }
  }
`;

export type AwardProps = {
  productId: string;
  type: AwardTypes;
  entityId: string;
  note?: string;
};

export type TransactionCreated = {
  transactionId: string;
  balance: LoggedUser['balance'];
};

export const award = async ({
  productId,
  type,
  entityId,
  note,
}: AwardProps): Promise<TransactionCreated> => {
  const result = await gqlClient.request<{ award: TransactionCreated }>(
    AWARD_MUTATION,
    { productId, type, entityId, note },
  );

  return result.award;
};

export enum ProductType {
  Award = 'award',
}

export type Product = {
  id: string;
  type: string;
  name: string;
  image: string;
  value: number;
  flags?: Partial<{
    description: string;
  }>;
};

export const PRODUCTS_QUERY = gql`
  query products($first: Int) {
    products(first: $first) {
      edges {
        node {
          ...ProductFragment
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const getProducts = async ({
  first = 100,
}: {
  first?: number;
} = {}): Promise<Connection<Product>> => {
  const result = await gqlClient.request<{
    products: Connection<Product>;
  }>(PRODUCTS_QUERY, { first });

  return result.products;
};

export enum UserTransactionStatus {
  Success = 0,
  InsufficientFunds = 1,
  InternalError = 100,
  Created = 201,
  Processing = 202,
  Error = 500,
  ErrorRecoverable = 501,
}

export type UserTransaction = {
  id: string;
  product?: Product;
  status: number;
  receiver: Author;
  sender?: Author;
  value: number;
  valueIncFees: number;
  flags: Partial<{
    note: string;
    error: string;
  }>;
  balance: LoggedUser['balance'];
  createdAt: Date;
};

export const TRANSACTION_BY_PROVIDER_QUERY = gql`
  query TransactionByProvider($providerId: ID!) {
    transactionByProvider(id: $providerId) {
      ...TransactionFragment
      balance {
        amount
      }
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const getTransactionByProvider = async ({
  providerId,
}: {
  providerId: string;
}): Promise<UserTransaction> => {
  const result = await gqlClient.request<{
    transactionByProvider: UserTransaction;
  }>(TRANSACTION_BY_PROVIDER_QUERY, { providerId });

  return result.transactionByProvider;
};

export const transactionRefetchIntervalMs = 2500;

export const transactionPricesQueryOptions = ({
  isLoggedIn,
  user,
}: {
  isLoggedIn: boolean;
  user: LoggedUser;
}) => {
  return {
    queryKey: generateQueryKey(RequestKey.PricePreview, user, 'cores'),
    queryFn: getCorePricePreviews,
    enabled: isLoggedIn,
    staleTime: StaleTime.Default,
  };
};

type UserTransactionSummary = {
  purchased: number;
  received: number;
  spent: number;
};

export const TRANSACTION_SUMMARY_QUERY = gql`
  query TransactionSummary {
    transactionSummary {
      purchased
      received
      spent
    }
  }
`;

export const getTransactionSummary =
  async (): Promise<UserTransactionSummary> => {
    const result = await gqlClient.request<{
      transactionSummary: UserTransactionSummary;
    }>(TRANSACTION_SUMMARY_QUERY);

    return result.transactionSummary;
  };

export const TRANSACTIONS_QUERY = gql`
  query transactions($first: Int, $after: String) {
    transactions(first: $first, after: $after) {
      edges {
        node {
          ...TransactionFragment
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const getTransactions = async ({
  first = 20,
  after,
}: {
  first?: number;
  after?: string;
} = {}): Promise<Connection<UserTransaction>> => {
  const result = await gqlClient.request<{
    transactions: Connection<UserTransaction>;
  }>(TRANSACTIONS_QUERY, { first, after });

  return result.transactions;
};

export const PRODUCTS_SUMMARY_QUERY = gql`
  query userProductSummary(
    $userId: ID!
    $limit: Int = 24
    $type: ProductType!
  ) {
    userProductSummary(userId: $userId, limit: $limit, type: $type) {
      id
      name
      image
      count
    }
  }
`;

export type UserProductSummary = Pick<Product, 'id' | 'name' | 'image'> & {
  count: number;
};

export const userProductSummaryQueryOptions = ({
  userId,
  limit,
  type,
}: {
  userId: string;
  limit?: number;
  type: ProductType;
}) => {
  return {
    queryKey: generateQueryKey(RequestKey.Products, null, 'summary', {
      userId,
      limit,
      type,
    }),
    queryFn: async () => {
      const result = await gqlClient.request<{
        userProductSummary: UserProductSummary[];
      }>(PRODUCTS_SUMMARY_QUERY, { userId, limit, type });

      return result.userProductSummary;
    },
    staleTIme: StaleTime.Default,
  };
};

export const CHECK_CORES_ROLE_QUERY = gql`
  query checkCoresRole {
    checkCoresRole {
      coresRole
    }
  }
`;
