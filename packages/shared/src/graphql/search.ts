import { gql } from 'graphql-request';

interface SearchChunkError {
  message: string;
  code: string;
}

export interface SearchChunkSource {
  id: string;
  title: string;
  snippet: string;
  url: string;
}

interface SearchChunk {
  id: string;
  prompt: string;
  response: string; // markdown
  error: SearchChunkError;
  createdAt: Date;
  completedAt: Date;
  feedback: number;
  sources: SearchChunkSource[];
}

export interface Search {
  id: string;
  createdAt: Date;
  chunks: SearchChunk[];
}

export const SEARCH_POST_SUGGESTIONS = gql`
  query SearchPostSuggestions($query: String!) {
    searchPostSuggestions(query: $query) {
      hits {
        title
      }
    }
  }
`;
