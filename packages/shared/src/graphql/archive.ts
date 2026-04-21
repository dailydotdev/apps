import { gql } from 'graphql-request';
import type { Post } from './posts';
import type { Keyword } from './keywords';
import type { Source } from './sources';

export enum ArchiveSubjectType {
  Post = 'post',
}

export enum ArchiveRankingType {
  Best = 'best',
}

export enum ArchiveScopeType {
  Global = 'global',
  Tag = 'tag',
  Source = 'source',
}

export enum ArchivePeriodType {
  Month = 'month',
  Year = 'year',
}

export interface ArchiveItem {
  rank: number;
  post: Post;
}

export interface Archive {
  id: string;
  subjectType: ArchiveSubjectType;
  rankingType: ArchiveRankingType;
  scopeType: ArchiveScopeType;
  scopeId: string | null;
  periodType: ArchivePeriodType;
  periodStart: string;
  keyword?: Keyword;
  source?: Source;
  items: ArchiveItem[];
}

export interface ArchiveData {
  archive: Archive | null;
}

export interface ArchiveIndexData {
  archiveIndex: Archive[];
}

export interface FeaturedArchivesData {
  featuredArchives: Archive[];
}

export const ARCHIVE_QUERY = gql`
  query Archive(
    $subjectType: String!
    $rankingType: String!
    $scopeType: String!
    $scopeId: String
    $periodType: String!
    $year: Int!
    $month: Int
  ) {
    archive(
      subjectType: $subjectType
      rankingType: $rankingType
      scopeType: $scopeType
      scopeId: $scopeId
      periodType: $periodType
      year: $year
      month: $month
    ) {
      id
      subjectType
      rankingType
      scopeType
      scopeId
      periodType
      periodStart
      keyword {
        value
        flags {
          title
          description
        }
      }
      source {
        id
        name
        handle
        image
        description
      }
      items {
        rank
        post {
          id
          title
          slug
          image
          readTime
          numUpvotes
          numComments
          commentsPermalink
          summary
          createdAt
          tags
          type
          source {
            id
            name
            image
            handle
          }
          author {
            id
            name
            image
            permalink
          }
        }
      }
    }
  }
`;

export const FEATURED_ARCHIVES_QUERY = gql`
  query FeaturedArchives($subjectType: String!, $subjectId: String!) {
    featuredArchives(subjectType: $subjectType, subjectId: $subjectId) {
      id
      scopeType
      scopeId
      periodType
      periodStart
      keyword {
        value
        flags {
          title
        }
      }
      source {
        name
      }
    }
  }
`;

export const ARCHIVE_INDEX_QUERY = gql`
  query ArchiveIndex(
    $subjectType: String!
    $rankingType: String!
    $scopeType: String!
    $scopeId: String
    $periodType: String
    $year: Int
  ) {
    archiveIndex(
      subjectType: $subjectType
      rankingType: $rankingType
      scopeType: $scopeType
      scopeId: $scopeId
      periodType: $periodType
      year: $year
    ) {
      id
      periodType
      periodStart
    }
  }
`;
