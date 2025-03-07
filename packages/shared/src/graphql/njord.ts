import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import type { AwardTypes } from '../contexts/GiveAwardModalContext';
import type { LoggedUser } from '../lib/user';

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
          id
          type
          name
          image
          value
          flags {
            description
          }
        }
      }
    }
  }
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
