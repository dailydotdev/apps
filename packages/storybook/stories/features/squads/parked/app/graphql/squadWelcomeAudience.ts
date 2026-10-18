import { gql } from './gql';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';

// A verified squad's welcome pop-up and its audience insights. Both live in
// their own queries, never the squad fragment, so the squad page keeps
// working while the API is a deploy behind.

export interface SquadWelcome {
  enabled: boolean;
  headline: string | null;
  text: string | null;
  showRules: boolean;
  ctaLabel: string | null;
  /** Without a link the button closes the pop-up. */
  ctaUrl: string | null;
  /** Null means the squad's own cover. */
  coverUrl: string | null;
  /** Null means the squad's own logo. */
  imageUrl: string | null;
}

export const emptySquadWelcome: SquadWelcome = {
  enabled: false,
  headline: null,
  text: null,
  showRules: false,
  ctaLabel: null,
  ctaUrl: null,
  coverUrl: null,
  imageUrl: null,
};

const SQUAD_WELCOME_FRAGMENT = gql`
  fragment SquadWelcomeInfo on SquadWelcome {
    enabled
    headline
    text
    showRules
    ctaLabel
    ctaUrl
    coverUrl
    imageUrl
  }
`;

const SQUAD_WELCOME_QUERY = gql`
  query SquadWelcome($sourceId: ID!) {
    squadWelcome(sourceId: $sourceId) {
      ...SquadWelcomeInfo
    }
  }
  ${SQUAD_WELCOME_FRAGMENT}
`;

export const squadWelcomeQueryOptions = ({
  squad,
}: {
  squad?: Pick<Squad, 'id' | 'handle' | 'features'>;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.Squad,
    undefined,
    squad?.handle,
    'welcome',
  ),
  queryFn: async (): Promise<SquadWelcome> => {
    const res = await gqlClient.request<{ squadWelcome: SquadWelcome }>(
      SQUAD_WELCOME_QUERY,
      { sourceId: squad?.id },
    );

    return res.squadWelcome;
  },
  enabled: !!squad?.id && !!squad?.features?.verified,
  retry: false,
  staleTime: StaleTime.Default,
});

export interface SquadWelcomeInput {
  enabled: boolean;
  headline: string | null;
  text: string | null;
  showRules: boolean;
  ctaLabel: string | null;
  ctaUrl: string | null;
  /** Go back to the squad's own cover. */
  resetCover?: boolean;
  /** Go back to the squad's own logo. */
  resetImage?: boolean;
}

const UPDATE_SQUAD_WELCOME_MUTATION = gql`
  mutation UpdateSquadWelcome(
    $sourceId: ID!
    $input: SquadWelcomeInput!
    $cover: Upload
    $image: Upload
  ) {
    updateSquadWelcome(
      sourceId: $sourceId
      input: $input
      cover: $cover
      image: $image
    ) {
      ...SquadWelcomeInfo
    }
  }
  ${SQUAD_WELCOME_FRAGMENT}
`;

export const updateSquadWelcome = async (params: {
  sourceId: string;
  input: SquadWelcomeInput;
  cover?: File;
  image?: File;
}): Promise<SquadWelcome> => {
  const res = await gqlClient.request<{ updateSquadWelcome: SquadWelcome }>(
    UPDATE_SQUAD_WELCOME_MUTATION,
    params,
  );

  return res.updateSquadWelcome;
};

/* ---------------------------------------------------------- audience */

export interface SquadAudienceRow {
  label: string;
  /** Percent of the squad's members. */
  share: number;
}

export interface SquadAudience {
  members: number;
  /** Joined in the last 30 days. */
  newMembers: number;
  /** False below the minimum audience; the breakdowns are empty then. */
  isEnough: boolean;
  /** Experience level keys from members' profiles. */
  seniority: SquadAudienceRow[];
  stack: SquadAudienceRow[];
  companies: SquadAudienceRow[];
}

/** Mirrors the API's privacy floor, for the copy that explains it. */
export const SQUAD_AUDIENCE_MIN_MEMBERS = 100;
export const SQUAD_AUDIENCE_MIN_COMPANY = 10;

const SQUAD_AUDIENCE_QUERY = gql`
  query SquadAudience($sourceId: ID!) {
    squadAudience(sourceId: $sourceId) {
      members
      newMembers
      isEnough
      seniority {
        label
        share
      }
      stack {
        label
        share
      }
      companies {
        label
        share
      }
    }
  }
`;

export const squadAudienceQueryOptions = ({
  squad,
}: {
  squad?: Pick<Squad, 'id' | 'handle' | 'features'>;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.Squad,
    undefined,
    squad?.handle,
    'audience',
  ),
  queryFn: async (): Promise<SquadAudience> => {
    const res = await gqlClient.request<{ squadAudience: SquadAudience }>(
      SQUAD_AUDIENCE_QUERY,
      { sourceId: squad?.id },
    );

    return res.squadAudience;
  },
  enabled: !!squad?.id && !!squad?.features?.verified,
  retry: false,
  staleTime: StaleTime.Default,
});
