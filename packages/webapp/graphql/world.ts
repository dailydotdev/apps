import { gql } from 'graphql-request';

export interface WorldNiche {
  slug: string;
}

export interface WorldDistrict {
  niche: WorldNiche;
  reads: number;
  firstReadAt: string;
  lastReadAt: string;
  activeDays: number;
}

export interface WorldGrowth {
  date: string;
  niche: WorldNiche;
  reads: number;
}

export interface UserWorldData {
  userWorld: WorldDistrict[];
}

export interface UserWorldTimelineData {
  userWorldTimeline: WorldGrowth[];
}

export const USER_WORLD_QUERY = gql`
  query UserWorld($id: ID!) {
    userWorld(id: $id) {
      niche {
        slug
      }
      reads
      firstReadAt
      lastReadAt
      activeDays
    }
  }
`;

/**
 * Separate from the districts query on purpose: a long-tenured world runs to
 * tens of thousands of rows here and to at most forty there, so the world can
 * be standing while its history is still on the wire. Only `slug` is selected:
 * the renderer keys districts by slug, and every other field would be the same
 * forty values repeated across every row of the log.
 */
export const USER_WORLD_TIMELINE_QUERY = gql`
  query UserWorldTimeline($id: ID!) {
    userWorldTimeline(id: $id) {
      date
      niche {
        slug
      }
      reads
    }
  }
`;
