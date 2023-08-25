import request, { gql } from 'graphql-request';
import { apiUrl, graphqlUrl } from '../lib/config';
import { isNullOrUndefined } from '../lib/func';
import { Connection, RequestQueryParams } from './common';
import { webappUrl } from '../lib/constants';

export const searchPageUrl = `${webappUrl}search`;

export interface SearchChunkError {
  message: string;
  code: string;
}

export interface SearchChunkSource {
  id: string;
  name: string;
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

export interface SearchSession {
  id: string;
  prompt: string;
  createdAt: Date;
}

export interface SearchHistoryData {
  history: Connection<SearchSession>;
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

export const SEARCH_HISTORY_QUERY = gql`
  query SearchSessionHistory($after: String, $first: Int) {
    history: searchSessionHistory(after: $after, first: $first) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
      }
      edges {
        node {
          id
          prompt
          createdAt
        }
      }
    }
  }
`;

export const SEARCH_FEEDBACK_MUTATION = gql`
  mutation SearchResultFeedback($chunkId: String!, $value: Int!) {
    searchResultFeedback(chunkId: $chunkId, value: $value) {
      _
    }
  }
`;

interface SearchFeedbackProps {
  chunkId: string;
  value: number;
}

export const sendSearchFeedback = (
  params: SearchFeedbackProps,
): Promise<void> => request(graphqlUrl, SEARCH_FEEDBACK_MUTATION, params);

export const getSearchSession = async (id: string): Promise<Search> => {
  const res = await request(graphqlUrl, SEARCH_SESSION_QUERY, { id });

  return res.searchSession;
};

export const getSearchHistory = async (
  params: RequestQueryParams,
): Promise<SearchHistoryData> =>
  request(graphqlUrl, SEARCH_HISTORY_QUERY, params);

type DeepPartial<T> = T extends unknown
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

interface InitializePayload extends Pick<Search, 'id' | 'createdAt'> {
  chunk_id: string;
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
        id: param.chunk_id,
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

export const getSearchIdUrl = (id: string): string =>
  `${searchPageUrl}?id=${id}`;

export const searchQueryUrl = `${apiUrl}/search/query`;

export const sendSearchQuery = async (
  query: string,
  token: string,
): Promise<EventSource> => {
  const params = new URLSearchParams({
    prompt: query,
    token,
  });

  return new EventSource(`${searchQueryUrl}?${params}`);
};
