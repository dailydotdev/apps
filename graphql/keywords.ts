import { gql } from 'graphql-request';

export interface Keyword {
  __typename?: string;
  value: string;
  occurrences: number;
}

export interface KeywordData {
  keyword?: Keyword;
}

export const RANDOM_PENDING_KEYWORD_QUERY = gql`
  query RandomPendingKeyword {
    keyword: randomPendingKeyword {
      value
      occurrences
    }
  }
`;

export const ALLOW_KEYWORD_MUTATION = gql`
  mutation AllowKeyword($keyword: String!) {
    allowKeyword(keyword: $keyword) {
      _
    }
  }
`;

export const DENY_KEYWORD_MUTATION = gql`
  mutation DenyKeyword($keyword: String!) {
    denyKeyword(keyword: $keyword) {
      _
    }
  }
`;
