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

// The numbers the API keeps next to each intel's markdown
// (`common/startups/intel/build.ts`), only the parts the first post flow reads
interface IntelIndexRow {
  label: string;
  index: number;
}

interface StartupsIntelData {
  /** Missing on intel built before it was added */
  totals?: { posts: number; readers: number };
  topics: {
    tag: string;
    share: number;
    change: number | null;
    reads: number | null;
    bookmarks: number | null;
    competition: IntelCompetition | null;
    topTenthShare: number | null;
  }[];
  adjacentTags: {
    tag: string;
    reach: number;
    lift: number;
    change: number | null;
  }[];
  topPosts: {
    title: string;
    url: string;
    source: string;
    /** Missing on intel built before it was added */
    image?: string | null;
    readsVsAverage: number;
    upvotes: number;
    comments: number;
  }[];
  readingDays: { label: string; share: number }[];
  publishDays: IntelIndexRow[];
  publishHours: IntelIndexRow[];
}

export interface SquadIntelTrial {
  endsAt: string;
  /** The site its topics were picked from */
  pickedFrom: string;
}

// What the first post flow shows from a page's weekly intel: the numbers
// behind the four sections of the Markdown report (your topics, what else
// your audience reads, top posts, timing). A free company page gets its first
// intel as a trial, on tags picked from its website.
export interface SquadIntelHighlights {
  weekStart: string;
  weekEnd: string;
  /** Posts in the page's topics that last week's numbers come from */
  postsAnalyzed: number | null;
  /** Developers who read a post in these topics that week */
  readers: number | null;
  /** Set while a free page tries the intel picked for it */
  trial: SquadIntelTrial | null;
  topics: {
    tag: string;
    /** Share of the reads across the page's topics, 0 to 100 */
    share: number;
    /** Against the week before, in percent. Null for a topic new this week */
    change: number | null;
    /** Null when too few posts to tell */
    competition: IntelCompetition | null;
    /** Index where 100 is the average post */
    readsPerPost: number;
    /** Index where 100 is the average post */
    bookmarks: number | null;
    /** Share of the topic's reads that went to its top 10% of posts, 0 to 100 */
    topPostsShare: number | null;
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
    bestDay: string | null;
    /** "14:00 to 17:00 UTC" */
    bestHours: string | null;
    weakestDay: string | null;
  };
}

const byIndex = (rows: IntelIndexRow[]): IntelIndexRow[] =>
  [...rows].sort((a, b) => b.index - a.index);

/** "15:00-18:00" as "15:00 to 18:00 UTC" */
const formatHours = (label: string): string =>
  `${label.replace('-', ' to ')} UTC`;

export const toIntelHighlights = ({
  weekStart,
  weekEnd,
  data,
  trial,
}: {
  weekStart: string;
  weekEnd: string;
  data: StartupsIntelData;
  trial: SquadIntelTrial | null;
}): SquadIntelHighlights => {
  const publishDays = byIndex(data.publishDays);
  const bestHours = byIndex(data.publishHours)[0];

  return {
    weekStart,
    weekEnd,
    postsAnalyzed: data.totals?.posts ?? null,
    readers: data.totals?.readers ?? null,
    trial,
    // A topic without reads had no posts this week, so nothing to compare
    topics: data.topics.flatMap(({ reads, topTenthShare, ...topic }) =>
      reads === null
        ? []
        : [{ ...topic, readsPerPost: reads, topPostsShare: topTenthShare }],
    ),
    alsoRead: data.adjacentTags.map(({ tag, reach, lift, change }) => ({
      tag,
      readBy: reach,
      affinity: lift,
      change,
    })),
    topPosts: data.topPosts.map(({ url, image, ...post }) => ({
      ...post,
      image: image ?? null,
      permalink: url,
    })),
    timing: {
      days: data.readingDays.map(({ share }) => share),
      bestDay: publishDays[0]?.label ?? null,
      bestHours: bestHours ? formatHours(bestHours.label) : null,
      weakestDay:
        publishDays.length > 1
          ? publishDays[publishDays.length - 1].label
          : null,
    },
  };
};

const SQUAD_INTEL_HIGHLIGHTS_QUERY = gql`
  query SquadIntelHighlights($sourceId: ID!) {
    squadIntel(sourceId: $sourceId) {
      weekStart
      weekEnd
      data
      trial {
        endsAt
        pickedFrom
      }
    }
  }
`;

// A page whose trial intel is still being built polls for it this long after
// it was created
const TRIAL_BUILD_MS = 10 * 60 * 1000;
const TRIAL_POLL_MS = 15 * 1000;

export const squadIntelHighlightsQueryOptions = ({
  user,
  sourceId,
  createdAt,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  sourceId?: string;
  /** The page's creation, to wait for the trial intel built right after it */
  createdAt?: Date | string;
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
      squadIntel: {
        weekStart: string;
        weekEnd: string;
        data: StartupsIntelData;
        trial: SquadIntelTrial | null;
      } | null;
    }>(SQUAD_INTEL_HIGHLIGHTS_QUERY, { sourceId });

    return res.squadIntel && toIntelHighlights(res.squadIntel);
  },
  enabled: enabled && !!user?.id && !!sourceId,
  staleTime: StaleTime.Default,
  refetchInterval: ({
    state,
  }: {
    state: { data?: SquadIntelHighlights | null };
  }): number | false =>
    !state.data &&
    !!createdAt &&
    Date.now() - new Date(createdAt).getTime() < TRIAL_BUILD_MS
      ? TRIAL_POLL_MS
      : false,
  retry: false,
});

// The free weekly trends across daily.dev: what a company page without a plan
// reads once its trial intel ends
export interface DeveloperTrendsTopic {
  tag: string;
  /** Multiple of a usual week: 1.6 is 1.6x */
  multiple: number;
  /** False when one story drove the rise rather than many posts */
  broad: boolean | null;
}

export interface DeveloperTrends {
  weekStart: string;
  weekEnd: string;
  risingTopics: DeveloperTrendsTopic[];
  coolingTopics: DeveloperTrendsTopic[];
  /** Per impression, as multiples of the average post */
  formats: {
    format: string;
    reads: number;
    bookmarks: number;
    upvotes: number;
    comments: number;
  }[];
}

const DEVELOPER_TRENDS_QUERY = gql`
  query DeveloperTrends {
    developerTrends {
      weekStart
      weekEnd
      risingTopics {
        tag
        multiple
        broad
      }
      coolingTopics {
        tag
        multiple
        broad
      }
      formats {
        format
        reads
        bookmarks
        upvotes
        comments
      }
    }
  }
`;

export const developerTrendsQueryOptions = ({
  user,
  enabled = true,
}: {
  user?: Pick<LoggedUser, 'id'>;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(RequestKey.SquadIntel, user, 'trends'),
  queryFn: async (): Promise<DeveloperTrends | null> => {
    const res = await gqlClient.request<{
      developerTrends: DeveloperTrends | null;
    }>(DEVELOPER_TRENDS_QUERY);

    return res.developerTrends;
  },
  enabled: enabled && !!user?.id,
  staleTime: StaleTime.Default,
  retry: false,
});
