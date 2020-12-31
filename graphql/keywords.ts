import { gql } from 'graphql-request';

export interface Keyword {
  __typename?: string;
  value: string;
  occurrences: number;
}

export interface KeywordData {
  keyword?: Keyword;
}

export type CountPendingKeywordsData = { countPendingKeywords: number };

export interface SearchKeywordData {
  searchKeywords: { hits: [Keyword] };
}

export const RANDOM_PENDING_KEYWORD_QUERY = gql`
  query RandomPendingKeyword {
    keyword: randomPendingKeyword {
      value
      occurrences
    }
    countPendingKeywords
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

export const SEARCH_KEYWORDS_QUERY = gql`
  query SearchKeywords($query: String!) {
    searchKeywords(query: $query) {
      hits {
        value
      }
    }
  }
`;

export const SET_KEYWORD_AS_SYNONYM_MUTATION = gql`
  mutation SetKeywordAsSynonym(
    $keywordToUpdate: String!
    $originalKeyword: String!
  ) {
    setKeywordAsSynonym(
      keywordToUpdate: $keywordToUpdate
      originalKeyword: $originalKeyword
    ) {
      _
    }
  }
`;
