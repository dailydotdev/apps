/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { AwardTypes } from '../contexts/GiveAwardModalContext';
import type { LoggedUser } from '../lib/user';
import { PRODUCT_FRAGMENT, USER_SHORT_INFO_FRAGMENT } from './fragments';
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
  flags: Partial<{
    note: string;
    error: string;
  }>;
  balance: LoggedUser['balance'];
};

export const TRANSACTION_BY_PROVIDER_QUERY = gql`
  query TransactionByProvider($providerId: ID!) {
    transactionByProvider(id: $providerId) {
      id
      product {
        ...ProductFragment
      }
      status
      receiver {
        ...UserShortInfo
      }
      sender {
        ...UserShortInfo
      }
      value
      flags {
        note
        error
      }
      balance {
        amount
      }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${USER_SHORT_INFO_FRAGMENT}
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
