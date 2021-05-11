import { gql } from 'graphql-request';

export const SOURCE_BY_FEED_QUERY = gql`
  query SourceByFeed($feed: String!) {
    source: sourceByFeed(feed: $feed) {
      id
      name
      image
    }
  }
`;

export const REQUEST_SOURCE_MUTATION = gql`
  mutation RequestSource($data: RequestSourceInput!) {
    requestSource(data: $data) {
      id
    }
  }
`;
