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

export type IntelCompetition = 'open' | 'moderate' | 'crowded';

// What the first post flow shows from a page's weekly intel: the numbers
// behind the four sections of the Markdown report (your topics, what else
// your audience reads, top posts, timing). Proposed: the API keeps each intel
// as data next to its markdown, and a free company page gets its first intel
// as a trial, on tags picked from its website.
export interface SquadIntelHighlights {
  weekStart: string;
  weekEnd: string;
  /** Posts in the page's topics that last week's numbers come from */
  postsAnalyzed: number;
  /** Developers who read a post in these topics that week */
  readers: number;
  /** Set while a free page tries the intel picked for it */
  trial: {
    endsAt: string;
    /** The site its topics were picked from */
    pickedFrom: string;
  } | null;
  topics: {
    tag: string;
    /** Share of the reads across the page's topics, 0 to 100 */
    share: number;
    /** Against the week before, in percent */
    change: number;
    competition: IntelCompetition;
    /** Index where 100 is the average post */
    readsPerPost: number;
    /** Index where 100 is the average post */
    bookmarks: number;
    /** Share of the topic's reads that went to its top 10% of posts, 0 to 100 */
    topPostsShare: number;
  }[];
  /** Tags outside the page's topics that the same audience reads */
  alsoRead: {
    tag: string;
    /** Share of the audience that also reads it, 0 to 100 */
    readBy: number;
    /** How much more than every reader, as a multiple */
    affinity: number;
    /** Against the week before, in percent. Null for a tag new this week */
    change: number | null;
  }[];
  topPosts: {
    title: string;
    source: string;
    image: string | null;
    /** Reads against the average post */
    readsVsAverage: number;
    upvotes: number;
    comments: number;
    permalink: string;
  }[];
  timing: {
    /** Share of the week's reads by day, Monday first, 0 to 100 */
    days: number[];
    /** "Tuesday": posts published then get the strongest first day */
    bestDay: string;
    /** "14:00 to 17:00 UTC" */
    bestHours: string;
    weakestDay: string;
  };
}

const SQUAD_INTEL_HIGHLIGHTS_QUERY = gql`
  query SquadIntelHighlights($sourceId: ID!) {
    squadIntelHighlights(sourceId: $sourceId) {
      weekStart
      weekEnd
      postsAnalyzed
      readers
      trial {
        endsAt
        pickedFrom
      }
      topics {
        tag
        share
        change
        competition
        readsPerPost
        bookmarks
        topPostsShare
      }
      alsoRead {
        tag
        readBy
        affinity
        change
      }
      topPosts {
        title
        source
        image
        readsVsAverage
        upvotes
        comments
        permalink
      }
      timing {
        days
        bestDay
        bestHours
        weakestDay
      }
    }
  }
`;

export const squadIntelHighlightsQueryOptions = ({
  user,
  sourceId,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.SquadIntel,
    user,
    sourceId,
    'highlights',
  ),
  queryFn: async (): Promise<SquadIntelHighlights | null> => {
    const res = await gqlClient.request<{
      squadIntelHighlights: SquadIntelHighlights | null;
    }>(SQUAD_INTEL_HIGHLIGHTS_QUERY, { sourceId });

    return res.squadIntelHighlights;
  },
  enabled: enabled && !!user?.id && !!sourceId,
  staleTime: StaleTime.Default,
  retry: false,
});
