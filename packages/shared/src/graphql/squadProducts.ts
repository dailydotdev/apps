import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { EmptyResponse } from './emptyResponse';
import type { DatasetTool } from './user/userStack';
import type { Squad } from './sources';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';

// A squad's products are catalog tools whose official source is the squad.
// Every product field and mutation lives here so the API contract has one
// place to change.

export enum SquadProductPricing {
  Free = 'free',
  Freemium = 'freemium',
  Paid = 'paid',
  OpenSource = 'open-source',
}

export const squadProductPricingLabel: Record<SquadProductPricing, string> = {
  [SquadProductPricing.Free]: 'Free',
  [SquadProductPricing.Freemium]: 'Freemium',
  [SquadProductPricing.Paid]: 'Paid',
  [SquadProductPricing.OpenSource]: 'Open source',
};

export interface SquadProduct extends DatasetTool {
  tagline: string | null;
  description: string | null;
  pricingModel: SquadProductPricing | null;
  links: string[];
  category: string | null;
}

const SQUAD_PRODUCT_FRAGMENT = gql`
  fragment SquadProductInfo on DatasetTool {
    id
    title
    slug
    url
    faviconUrl
    category
    tagline
    description
    pricingModel
    links
  }
`;

export const SQUAD_PRODUCTS_QUERY = gql`
  query SquadProducts($handle: ID!) {
    source(id: $handle) {
      id
      products {
        ...SquadProductInfo
      }
    }
  }
  ${SQUAD_PRODUCT_FRAGMENT}
`;

export const squadProductsQueryOptions = ({
  squad,
  user,
}: {
  squad?: Pick<Squad, 'handle' | 'features'>;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(RequestKey.Squad, user, squad?.handle, 'products'),
  queryFn: async (): Promise<SquadProduct[]> => {
    const res = await gqlClient.request<{
      source: { products: SquadProduct[] };
    }>(SQUAD_PRODUCTS_QUERY, { handle: squad?.handle });

    return res.source.products;
  },
  enabled: !!squad?.handle && !!squad?.features?.products,
  staleTime: StaleTime.Default,
});

export interface SquadProductInput {
  tagline: string | null;
  description: string | null;
  /** Null clears it. */
  pricingModel: SquadProductPricing | null;
  links: string[];
}

export interface AddSquadProductParams {
  sourceId: string;
  input: SquadProductInput & { name: string };
  logo?: File;
}

export interface UpdateSquadProductParams {
  id: string;
  input: SquadProductInput;
  logo?: File;
}

const ADD_SQUAD_PRODUCT_MUTATION = gql`
  mutation AddSquadProduct(
    $sourceId: ID!
    $input: AddSquadProductInput!
    $logo: Upload
  ) {
    addSquadProduct(sourceId: $sourceId, input: $input, logo: $logo) {
      ...SquadProductInfo
    }
  }
  ${SQUAD_PRODUCT_FRAGMENT}
`;

const UPDATE_SQUAD_PRODUCT_MUTATION = gql`
  mutation UpdateSquadProduct(
    $id: ID!
    $input: UpdateSquadProductInput!
    $logo: Upload
  ) {
    updateSquadProduct(id: $id, input: $input, logo: $logo) {
      ...SquadProductInfo
    }
  }
  ${SQUAD_PRODUCT_FRAGMENT}
`;

const REMOVE_SQUAD_PRODUCT_MUTATION = gql`
  mutation RemoveSquadProduct($id: ID!) {
    removeSquadProduct(id: $id) {
      _
    }
  }
`;

const REORDER_SQUAD_PRODUCTS_MUTATION = gql`
  mutation ReorderSquadProducts($sourceId: ID!, $ids: [ID!]!) {
    reorderSquadProducts(sourceId: $sourceId, ids: $ids) {
      ...SquadProductInfo
    }
  }
  ${SQUAD_PRODUCT_FRAGMENT}
`;

export const addSquadProduct = async (
  params: AddSquadProductParams,
): Promise<SquadProduct> => {
  const res = await gqlClient.request<{ addSquadProduct: SquadProduct }>(
    ADD_SQUAD_PRODUCT_MUTATION,
    params,
  );

  return res.addSquadProduct;
};

export const updateSquadProduct = async (
  params: UpdateSquadProductParams,
): Promise<SquadProduct> => {
  const res = await gqlClient.request<{ updateSquadProduct: SquadProduct }>(
    UPDATE_SQUAD_PRODUCT_MUTATION,
    params,
  );

  return res.updateSquadProduct;
};

export const removeSquadProduct = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(REMOVE_SQUAD_PRODUCT_MUTATION, { id });

export const reorderSquadProducts = async (params: {
  sourceId: string;
  ids: string[];
}): Promise<SquadProduct[]> => {
  const res = await gqlClient.request<{
    reorderSquadProducts: SquadProduct[];
  }>(REORDER_SQUAD_PRODUCTS_MUTATION, params);

  return res.reorderSquadProducts;
};
