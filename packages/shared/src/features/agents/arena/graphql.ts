import { gql } from 'graphql-request';

export const ARENA_QUERY = gql`
  query ArenaData(
    $groupId: ID!
    $lookback: String!
    $resolution: SentimentResolution!
    $highlightsFirst: Int
    $highlightsOrderBy: SentimentHighlightsOrderBy
  ) {
    sentimentTimeSeries(
      resolution: $resolution
      groupId: $groupId
      lookback: $lookback
    ) {
      start
      resolutionSeconds
      entities {
        nodes {
          entity
          timestamps
          scores
          volume
        }
      }
    }
    sentimentHighlights(
      groupId: $groupId
      first: $highlightsFirst
      orderBy: $highlightsOrderBy
    ) {
      items {
        provider
        externalItemId
        url
        text
        author {
          ... on SentimentAuthorX {
            id
            name
            handle
            avatarUrl
          }
        }
        metrics {
          ... on SentimentMetricsX {
            likeCount
            replyCount
            retweetCount
          }
        }
        createdAt
        sentiments {
          entity
          score
          highlightScore
        }
      }
      cursor
    }
  }
`;
