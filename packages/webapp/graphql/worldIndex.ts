import { gql } from 'graphql-request';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';

/** The two windows a topic's ranking is scored over. */
export enum WorldRankPeriod {
  Week = 'week',
  All = 'all',
}

export interface WorldNiche {
  id: string;
  slug: string;
  title: string;
  /** Null until the taxonomy places the topic in a domain. */
  domain: string | null;
}

/** A domain and how many worlds have read anything in it. */
export interface WorldDomainReaders {
  domain: string;
  readers: number;
}

export interface WorldDomainRankEntry {
  rank: number;
  user: WorldIndexOwner;
  worldName: string | null;
  articles: number;
}

/** A niche as the index holds it: the topic, plus how many worlds read it. */
export interface WorldNicheSummary extends WorldNiche {
  readers: number;
}

export type WorldIndexOwner = Pick<
  PublicProfile,
  'id' | 'name' | 'username' | 'image'
>;

export interface WorldTopic {
  niche: WorldNiche;
  articles: number;
  level: number;
}

export interface IndexedWorld {
  user: WorldIndexOwner;
  /** Null when nobody has named the place. */
  name: string | null;
  topics: number;
  articles: number;
  topTopics: WorldTopic[];
}

export interface WorldRankEntry {
  rank: number;
  user: WorldIndexOwner;
  worldName: string | null;
  articles: number;
  level: number;
}

export interface WorldRankPosition {
  /** Null beyond `cappedAt`, or when the viewer's world is not listed. */
  rank: number | null;
  articles: number;
  level: number;
  cappedAt: number;
}

export interface FollowedWorldsConnection {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  edges: { node: IndexedWorld }[];
}

export interface WorldLevelUp {
  world: IndexedWorld;
  niche: WorldNiche;
  level: number;
  createdAt: string;
}

const WORLD_OWNER_FRAGMENT = gql`
  fragment WorldIndexOwner on User {
    id
    name
    username
    image
  }
`;

const INDEXED_WORLD_FRAGMENT = gql`
  fragment IndexedWorld on IndexedWorld {
    user {
      ...WorldIndexOwner
    }
    name
    topics
    articles
    topTopics {
      niche {
        id
        slug
        title
        domain
      }
      articles
      level
    }
  }
  ${WORLD_OWNER_FRAGMENT}
`;

/**
 * Every topic and how many worlds read it.
 *
 * Doubles as the index's catalogue: the taxonomy the page groups by is local,
 * but niche ids are the API's, and every other query here is keyed by one.
 */
export const WORLD_TOPIC_READERS_QUERY = gql`
  query WorldTopicReaders {
    worldTopicReaders {
      niche {
        id
        slug
        title
        domain
      }
      readers
    }
  }
`;

export const WORLD_TOPIC_RANKING_QUERY = gql`
  query WorldTopicRanking(
    $nicheId: ID!
    $period: WorldRankPeriod!
    $limit: Int
  ) {
    worldTopicRanking(nicheId: $nicheId, period: $period, limit: $limit) {
      rank
      user {
        ...WorldIndexOwner
      }
      worldName
      articles
      level
    }
  }
  ${WORLD_OWNER_FRAGMENT}
`;

export const WORLD_TOPIC_RANK_POSITION_QUERY = gql`
  query WorldTopicRankPosition($nicheId: ID!, $period: WorldRankPeriod!) {
    worldTopicRankPosition(nicheId: $nicheId, period: $period) {
      rank
      articles
      level
      cappedAt
    }
  }
`;

export const WORLD_RECENT_LEVEL_UPS_QUERY = gql`
  query WorldRecentLevelUps($limit: Int) {
    worldRecentLevelUps(limit: $limit) {
      world {
        ...IndexedWorld
      }
      niche {
        id
        slug
        title
        domain
      }
      level
      createdAt
    }
  }
  ${INDEXED_WORLD_FRAGMENT}
`;

export const FOLLOWED_WORLDS_QUERY = gql`
  query FollowedWorlds($first: Int, $after: String) {
    followedWorlds(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...IndexedWorld
        }
      }
    }
  }
  ${INDEXED_WORLD_FRAGMENT}
`;

export const WORLD_DOMAIN_READERS_QUERY = gql`
  query WorldDomainReaders {
    worldDomainReaders {
      domain
      readers
    }
  }
`;

export const WORLD_DOMAIN_RANKING_QUERY = gql`
  query WorldDomainRanking(
    $domain: NicheDomain!
    $period: WorldRankPeriod!
    $limit: Int
  ) {
    worldDomainRanking(domain: $domain, period: $period, limit: $limit) {
      rank
      user {
        ...WorldIndexOwner
      }
      worldName
      articles
    }
  }
  ${WORLD_OWNER_FRAGMENT}
`;

export const WORLD_DOMAIN_RANK_POSITION_QUERY = gql`
  query WorldDomainRankPosition(
    $domain: NicheDomain!
    $period: WorldRankPeriod!
  ) {
    worldDomainRankPosition(domain: $domain, period: $period) {
      rank
      articles
      level
      cappedAt
    }
  }
`;
