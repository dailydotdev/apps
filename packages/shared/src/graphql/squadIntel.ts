import { gql } from 'graphql-request';
import { gqlClient } from './common';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { IntelRegion, IntelSeniority } from '../features/squads/lib/intel';

// The weekly intel of a daily.dev for Startups squad: what developers read in
// the squad's topics. Only the plan's paid seats can read it or change what it
// covers; the API refuses everyone else.

export interface SquadIntelSelection {
  tags: string[];
  /** Null for every reader */
  seniority: IntelSeniority[] | null;
  /** Null for every reader */
  regions: IntelRegion[] | null;
}

export interface SquadIntelLimits {
  tags: number;
  seniority: boolean;
  regions: boolean;
}

export interface SquadIntelSettings {
  /** Null until tags are set */
  selection: SquadIntelSelection | null;
  limits: SquadIntelLimits;
  /** Monday 00:00 UTC, when the weekly run builds the next intel */
  nextIntelAt: string;
}

export interface SquadIntel {
  weekStart: string;
  weekEnd: string;
  selection: SquadIntelSelection;
  /** Too few posts reached the target readers, so it covers every reader */
  broadened: boolean;
  markdown: string;
  generatedAt: string;
}

const SQUAD_INTEL_SETTINGS_FRAGMENT = gql`
  fragment SquadIntelSettingsInfo on SquadIntelSettings {
    selection {
      tags
      seniority
      regions
    }
    limits {
      tags
      seniority
      regions
    }
    nextIntelAt
  }
`;

const SQUAD_INTEL_SETTINGS_QUERY = gql`
  query SquadIntelSettings($sourceId: ID!) {
    squadIntelSettings(sourceId: $sourceId) {
      ...SquadIntelSettingsInfo
    }
  }
  ${SQUAD_INTEL_SETTINGS_FRAGMENT}
`;

const SQUAD_INTEL_QUERY = gql`
  query SquadIntel($sourceId: ID!) {
    squadIntel(sourceId: $sourceId) {
      weekStart
      weekEnd
      selection {
        tags
        seniority
        regions
      }
      broadened
      markdown
      generatedAt
    }
  }
`;

export const UPDATE_SQUAD_INTEL_SETTINGS_MUTATION = gql`
  mutation UpdateSquadIntelSettings(
    $sourceId: ID!
    $tags: [String!]!
    $seniority: [String!]
    $regions: [String!]
  ) {
    updateSquadIntelSettings(
      sourceId: $sourceId
      tags: $tags
      seniority: $seniority
      regions: $regions
    ) {
      ...SquadIntelSettingsInfo
    }
  }
  ${SQUAD_INTEL_SETTINGS_FRAGMENT}
`;

export const squadIntelSettingsQueryOptions = ({
  user,
  sourceId,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadIntel, user, sourceId, 'settings'),
  queryFn: async (): Promise<SquadIntelSettings> => {
    const res = await gqlClient.request<{
      squadIntelSettings: SquadIntelSettings;
    }>(SQUAD_INTEL_SETTINGS_QUERY, { sourceId });

    return res.squadIntelSettings;
  },
  enabled: enabled && !!user?.id && !!sourceId,
  staleTime: StaleTime.Default,
  retry: false,
});

export const squadIntelQueryOptions = ({
  user,
  sourceId,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadIntel, user, sourceId),
  queryFn: async (): Promise<SquadIntel | null> => {
    const res = await gqlClient.request<{ squadIntel: SquadIntel | null }>(
      SQUAD_INTEL_QUERY,
      { sourceId },
    );

    return res.squadIntel;
  },
  enabled: enabled && !!user?.id && !!sourceId,
  staleTime: StaleTime.Default,
  retry: false,
});

export const updateSquadIntelSettings = async ({
  sourceId,
  ...selection
}: SquadIntelSelection & { sourceId: string }): Promise<SquadIntelSettings> => {
  const res = await gqlClient.request<{
    updateSquadIntelSettings: SquadIntelSettings;
  }>(UPDATE_SQUAD_INTEL_SETTINGS_MUTATION, { sourceId, ...selection });

  return res.updateSquadIntelSettings;
};
