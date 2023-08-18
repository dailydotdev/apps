import request, { gql } from 'graphql-request';
import { graphqlUrl } from '../lib/config';
import { isNullOrUndefined } from '../lib/func';

export interface SearchChunkError {
  message: string;
  code: string;
}

export interface SearchChunkSource {
  id: string;
  title: string;
  snippet: string;
  url: string;
}

export interface SearchChunk {
  id: string;
  prompt: string;
  response: string; // markdown
  error: SearchChunkError;
  createdAt: Date;
  completedAt: Date;
  feedback: number;
  sources: SearchChunkSource[];
  steps?: number;
  status?: string;
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

export const SEARCH_SESSION_QUERY = gql`
  query SearchSession($id: String!) {
    searchSession(id: $id) {
      id
      createdAt
      chunks {
        id
        prompt
        response
        error {
          message
          code
        }
        createdAt
        completedAt
        feedback
        sources {
          id
          title
          snippet
          url
        }
      }
    }
  }
`;

export const getSearchSession = async (id: string): Promise<Search> => {
  const res = await request(graphqlUrl, SEARCH_SESSION_QUERY, { id });

  return res.searchSession;
};

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

interface InitializePayload extends Pick<Search, 'id' | 'createdAt'> {
  steps: number;
  status: string;
  prompt: string;
}

export const initializeSearchSession = ({
  prompt,
  ...param
}: InitializePayload): DeepPartial<Search> => {
  const { status, steps } = param;

  return {
    ...param,
    chunks: [
      {
        id: 'chunk id', // currently unsupported, setting this manually shouldn't be a concern
        prompt,
        response: '',
        createdAt: param.createdAt,
        sources: [],
        status,
        steps,
      },
    ],
  };
};

export const updateSearchData = (
  previous: Search,
  chunk: Partial<SearchChunk>,
): Search => {
  if (!chunk) return null;

  const updated = {
    ...previous,
    chunks: [{ ...previous.chunks[0], ...chunk }],
  };

  if (isNullOrUndefined(chunk.response)) return updated;

  updated.chunks[0].response = previous.chunks[0].response + chunk.response;

  return updated;
};
