import { gql } from 'graphql-request';

export type SentimentResolution = 'HOUR' | 'DAY';

export interface SentimentTopEntityMetadata {
  entity: string;
  name: string;
  logo: string;
}

export interface SentimentTopEntity {
  dIndex: number;
  score: number;
  volume: number;
  entity: SentimentTopEntityMetadata;
}

export interface TopSentimentEntitiesData {
  topSentimentEntities: SentimentTopEntity[];
}

export const TOP_SENTIMENT_ENTITIES_QUERY = gql`
  query TopSentimentEntities(
    $groupId: ID!
    $resolution: SentimentResolution!
    $lookback: String
    $limit: Int
  ) {
    topSentimentEntities(
      groupId: $groupId
      resolution: $resolution
      lookback: $lookback
      limit: $limit
    ) {
      dIndex
      score
      volume
      entity {
        entity
        name
        logo
      }
    }
  }
`;
