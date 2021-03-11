import { gql } from 'graphql-request';

export const SEARCH_POST_SUGGESTIONS = gql`
  query SearchPostSuggestions($query: String!) {
    searchPostSuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;
