/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { AwardTypes } from '../contexts/GiveAwardModalContext';
import type { LoggedUser } from '../lib/user';
import {
  FEATURED_AWARD_FRAGMENT,
  PRODUCT_FRAGMENT,
  TRANSACTION_FRAGMENT,
  USER_SHORT_INFO_FRAGMENT,
} from './fragments';
import type { Author } from './comments';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../lib/query';
import type { ProductPricingPreview } from './paddle';

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
    imageGlow: string;
  }>;
};

export type FeaturedAward = Pick<Product, 'name' | 'image' | 'value'>;

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

const getProducts = async ({
  first = 100,
}: {
  first?: number;
} = {}): Promise<Connection<Product>> => {
  const result = await gqlClient.request<{
    products: Connection<Product>;
  }>(PRODUCTS_QUERY, { first });

  return result.products;
};

export const getProductsQueryOptions = () => {
  return {
    queryKey: generateQueryKey(RequestKey.Products),
    queryFn: () => getProducts(),
    staleTime: StaleTime.Default,
  };
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
    staleTime: StaleTime.Default,
  };
};

export const CHECK_CORES_ROLE_QUERY = gql`
  query checkCoresRole {
    checkCoresRole {
      coresRole
    }
  }
`;

export const getQuantityForPrice = ({
  priceId,
  prices,
}: {
  priceId: string;
  prices?: ProductPricingPreview[];
}): number | undefined => {
  return prices?.find((item) => item.priceId === priceId)?.metadata.coresValue;
};

const TOTAL_POST_AWARDS_QUERY_PART = gql`
    awardsTotal: postAwardsTotal(id: $id) {
        amount
    }
`;

type AwardsQueryFunction = (props: { includeTotal?: boolean }) => string;

export const LIST_POST_AWARDS_QUERY: AwardsQueryFunction = ({
  includeTotal,
}) => gql`
  query PostAwards($id: ID!, $first: Int, $after: String) {
    awards: postAwards(id: $id, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          user {
            ...UserShortInfo
          }
          award {
            ...FeaturedAwardFragment
          }
        }
      }
    }
    ${includeTotal ? TOTAL_POST_AWARDS_QUERY_PART : ''}
  }
  ${USER_SHORT_INFO_FRAGMENT}
  ${FEATURED_AWARD_FRAGMENT}
`;

const TOTAL_COMMENT_AWARDS_QUERY_PART = gql`
    awardsTotal: commentAwardsTotal(id: $id) {
        amount
    }
`;

export const LIST_COMMENT_AWARDS_QUERY: AwardsQueryFunction = ({
  includeTotal,
}) => gql`
  query CommentAwards($id: ID!, $first: Int, $after: String) {
    awards: commentAwards(id: $id, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          user {
            ...UserShortInfo
          }
          award {
            ...FeaturedAwardFragment
          }
        }
      }
    }
    ${includeTotal ? TOTAL_COMMENT_AWARDS_QUERY_PART : ''}
  }
  ${USER_SHORT_INFO_FRAGMENT}
  ${FEATURED_AWARD_FRAGMENT}
`;

export const DEFAULT_AWARDS_LIMIT = 20;

export type AwardListItem = {
  user: Author;
  award: FeaturedAward;
};

const listAwardsQueryMap: Record<AwardTypes, AwardsQueryFunction | undefined> =
  {
    POST: LIST_POST_AWARDS_QUERY,
    COMMENT: LIST_COMMENT_AWARDS_QUERY,
    USER: undefined,
  };

export const listAwardsInfiniteQueryOptions = ({
  id,
  type,
  limit = DEFAULT_AWARDS_LIMIT,
}: {
  id: string;
  type: AwardTypes;
  limit?: number;
}) => {
  return {
    queryKey: generateQueryKey(RequestKey.Awards, null, {
      id,
      type,
      first: limit,
    }),
    queryFn: async ({ queryKey: queryKeyArg, pageParam }) => {
      const gqlQueryFunction = listAwardsQueryMap[type];

      if (!gqlQueryFunction) {
        throw new Error(`Unsupported award type: ${type}`);
      }

      const isInitialPage = pageParam === '';

      const gqlQuery = gqlQueryFunction({
        includeTotal: isInitialPage,
      });

      const [, , queryVariables] = queryKeyArg as [
        unknown,
        unknown,
        { id: string; type: AwardTypes; first: number },
      ];
      const result = await gqlClient.request<{
        awards: Connection<AwardListItem>;
        awardsTotal?: LoggedUser['balance'];
      }>(gqlQuery, {
        ...queryVariables,
        after: pageParam,
      });

      return result;
    },
    initialPageParam: '',
    staleTime: StaleTime.Default,
    getNextPageParam: ({
      awards: { pageInfo },
    }: {
      awards: Connection<AwardListItem>;
      awardsTotal?: LoggedUser['balance'];
    }) => getNextPageParam(pageInfo),
    enabled: !!(id && type),
  };
};
