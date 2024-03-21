import { gql } from 'graphql-request';
import { SubmissionAvailability } from './submitArticle';

export type SourceRequestAvailability = Pick<
  SubmissionAvailability,
  'hasAccess'
>;

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

export const SOURCE_REQUEST_AVAILABILITY_QUERY = gql`
  query SourceRequestAvailability {
    sourceRequestAvailability {
      hasAccess
    }
  }
`;
