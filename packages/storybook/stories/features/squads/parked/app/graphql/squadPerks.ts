import { gql } from './gql';
import type { ParkedSourceFeatures } from '../features/squads/lib/features';
import { hasSquadFeature } from '../features/squads/lib/features';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  ApiError,
  getApiError,
  gqlClient,
} from '@dailydotdev/shared/src/graphql/common';
import type { EmptyResponse } from '@dailydotdev/shared/src/graphql/emptyResponse';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';

// A verified squad's member perks. Every field and
// mutation lives here so the API contract has one place to change.

export enum SquadPerkCodeKind {
  Shared = 'shared',
  Unique = 'unique',
}

export interface SquadPerk {
  id: string;
  /** The squad that offers the perk. */
  sourceId: string;
  title: string;
  value: string;
  summary: string | null;
  toolId: string | null;
  toolTitle: string | null;
  image: string | null;
  codeKind: SquadPerkCodeKind;
  /** Members only: the shared code, or the member's own claimed code. */
  code: string | null;
  redeemUrl: string | null;
  endsAt: string | null;
  claimLimit: number | null;
  steps: string[];
  terms: string[];
  claimed: number;
  claimedByMe: boolean;
  isClaimable: boolean;
  /** Editors only, for unique-code perks. */
  codesLeft: number | null;
  createdAt: string;
}

const SQUAD_PERK_FRAGMENT = gql`
  fragment SquadPerkInfo on SquadPerk {
    id
    sourceId
    title
    value
    summary
    toolId
    toolTitle
    image
    codeKind
    code
    redeemUrl
    endsAt
    claimLimit
    steps
    terms
    claimed
    claimedByMe
    isClaimable
    codesLeft
    createdAt
  }
`;

/** A perk that is gone, or not this viewer's to see. */
export const isSquadItemGone = (error: unknown): boolean =>
  !!getApiError(error as ApiErrorResult, ApiError.NotFound) ||
  !!getApiError(error as ApiErrorResult, ApiError.Forbidden);

// A blip is retried; only a real absence stops at once
const retryUnlessGone = (failureCount: number, error: unknown): boolean =>
  !isSquadItemGone(error) && failureCount < 2;

/* ------------------------------------------------- the feature flags */

type PerksFeatures = Pick<ParkedSourceFeatures, 'perks'>;

// Its own query, not part of the squad fragment, so the squad page never
// fails while the API is a deploy behind: a missing field fails only this.
const SQUAD_PERKS_FEATURES_QUERY = gql`
  query SquadPerksFeatures($handle: ID!) {
    source(id: $handle) {
      id
      features {
        perks
      }
    }
  }
`;

export const squadPerksFeaturesQueryOptions = ({
  squad,
}: {
  squad?: Pick<Squad, 'handle' | 'features'>;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.Squad,
    undefined,
    squad?.handle,
    'perks-features',
  ),
  queryFn: async (): Promise<PerksFeatures> => {
    const res = await gqlClient.request<{
      source: { features: PerksFeatures };
    }>(SQUAD_PERKS_FEATURES_QUERY, { handle: squad?.handle });

    return res.source.features;
  },
  // Only verified squads can have perks
  enabled: !!squad?.handle && !!squad?.features?.verified,
  retry: false,
  staleTime: StaleTime.Default,
});

/* -------------------------------------------------------------- perks */

const SQUAD_PERKS_QUERY = gql`
  query SquadPerks($sourceId: ID!) {
    squadPerks(sourceId: $sourceId) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

const SQUAD_PERK_QUERY = gql`
  query SquadPerk($id: ID!) {
    squadPerk(id: $id) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

// Codes depend on who is looking, so the viewer is part of every perk key
export const squadPerksQueryOptions = ({
  squad,
  user,
}: {
  squad?: Pick<Squad, 'id' | 'handle' | 'features'>;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(RequestKey.Squad, user, squad?.handle, 'perks'),
  queryFn: async (): Promise<SquadPerk[]> => {
    const res = await gqlClient.request<{ squadPerks: SquadPerk[] }>(
      SQUAD_PERKS_QUERY,
      { sourceId: squad?.id },
    );

    return res.squadPerks;
  },
  enabled: !!squad?.id && hasSquadFeature(squad, 'perks'),
  staleTime: StaleTime.Default,
});

export const squadPerkQueryOptions = ({
  id,
  user,
}: {
  id?: string;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(RequestKey.Squad, user, 'perk', id),
  queryFn: async (): Promise<SquadPerk> => {
    const res = await gqlClient.request<{ squadPerk: SquadPerk }>(
      SQUAD_PERK_QUERY,
      { id },
    );

    return res.squadPerk;
  },
  enabled: !!id,
  retry: retryUnlessGone,
  staleTime: StaleTime.Default,
});

export interface SquadPerkInput {
  title: string;
  value: string;
  toolId: string | null;
  summary: string | null;
  codeKind: SquadPerkCodeKind;
  code: string | null;
  redeemUrl: string | null;
  endsAt: string | null;
  claimLimit: number | null;
  steps: string[];
  terms: string[];
}

const ADD_SQUAD_PERK_MUTATION = gql`
  mutation AddSquadPerk($sourceId: ID!, $input: SquadPerkInput!) {
    addSquadPerk(sourceId: $sourceId, input: $input) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

const UPDATE_SQUAD_PERK_MUTATION = gql`
  mutation UpdateSquadPerk($id: ID!, $input: UpdateSquadPerkInput!) {
    updateSquadPerk(id: $id, input: $input) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

const REMOVE_SQUAD_PERK_MUTATION = gql`
  mutation RemoveSquadPerk($id: ID!) {
    removeSquadPerk(id: $id) {
      _
    }
  }
`;

const REORDER_SQUAD_PERKS_MUTATION = gql`
  mutation ReorderSquadPerks($sourceId: ID!, $ids: [ID!]!) {
    reorderSquadPerks(sourceId: $sourceId, ids: $ids) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

const ADD_SQUAD_PERK_CODES_MUTATION = gql`
  mutation AddSquadPerkCodes($id: ID!, $codes: [String!]!) {
    addSquadPerkCodes(id: $id, codes: $codes) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

const CLAIM_SQUAD_PERK_MUTATION = gql`
  mutation ClaimSquadPerk($id: ID!) {
    claimSquadPerk(id: $id) {
      ...SquadPerkInfo
    }
  }
  ${SQUAD_PERK_FRAGMENT}
`;

export const addSquadPerk = async (params: {
  sourceId: string;
  input: SquadPerkInput;
}): Promise<SquadPerk> => {
  const res = await gqlClient.request<{ addSquadPerk: SquadPerk }>(
    ADD_SQUAD_PERK_MUTATION,
    params,
  );

  return res.addSquadPerk;
};

export const updateSquadPerk = async (params: {
  id: string;
  input: SquadPerkInput;
}): Promise<SquadPerk> => {
  const res = await gqlClient.request<{ updateSquadPerk: SquadPerk }>(
    UPDATE_SQUAD_PERK_MUTATION,
    params,
  );

  return res.updateSquadPerk;
};

export const removeSquadPerk = (id: string): Promise<EmptyResponse> =>
  gqlClient.request(REMOVE_SQUAD_PERK_MUTATION, { id });

export const reorderSquadPerks = async (params: {
  sourceId: string;
  ids: string[];
}): Promise<SquadPerk[]> => {
  const res = await gqlClient.request<{ reorderSquadPerks: SquadPerk[] }>(
    REORDER_SQUAD_PERKS_MUTATION,
    params,
  );

  return res.reorderSquadPerks;
};

export const addSquadPerkCodes = async (params: {
  id: string;
  codes: string[];
}): Promise<SquadPerk> => {
  const res = await gqlClient.request<{ addSquadPerkCodes: SquadPerk }>(
    ADD_SQUAD_PERK_CODES_MUTATION,
    params,
  );

  return res.addSquadPerkCodes;
};

export const claimSquadPerk = async (id: string): Promise<SquadPerk> => {
  const res = await gqlClient.request<{ claimSquadPerk: SquadPerk }>(
    CLAIM_SQUAD_PERK_MUTATION,
    { id },
  );

  return res.claimSquadPerk;
};
