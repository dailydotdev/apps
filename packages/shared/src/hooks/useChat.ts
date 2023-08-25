import { MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { QueryKey, useQuery, useQueryClient } from 'react-query';
import {
  getSearchSession,
  initializeSearchSession,
  Search,
  SearchChunk,
  SearchChunkError,
  SearchChunkSource,
  sendSearchQuery,
  updateSearchData,
} from '../graphql/search';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

interface UseChatProps {
  id?: string;
}

enum UseChatMessageType {
  SessionCreated = 'session_created',
  WebSearchFinished = 'web_search_finished',
  WebResultsFiltered = 'web_results_filtered',
  StatusUpdated = 'status_updated',
  NewTokenReceived = 'new_token_received',
  Completed = 'completed',
  Error = 'error',
  SessionFound = 'session_found',
}

interface SourcesMessage {
  sources: SearchChunkSource[];
}

interface UseChatMessage<Payload = unknown> {
  type: UseChatMessageType;
  status?: string;
  timestamp: number;
  payload: Payload;
}

interface UseChat {
  queryKey: QueryKey;
  data: Search;
  isLoading: boolean;
  handleSubmit(event: MouseEvent, value: string): void;
}

interface CreatePayload {
  id: string;
  steps: number;
  chunk_id: string;
}

interface TokenPayload {
  token: string;
}

export const useChat = ({ id: idFromProps }: UseChatProps): UseChat => {
  const { user, accessToken } = useAuthContext();
  const client = useQueryClient();
  const sourceRef = useRef<EventSource>();
  const [prompt, setPrompt] = useState<string | undefined>();
  const id = idFromProps ?? 'new';
  const idQueryKey = generateQueryKey(RequestKey.Search, user, id);
  const { data: search, isLoading: isLoadingSession } = useQuery(
    idQueryKey,
    () => getSearchSession(idFromProps),
    { enabled: !!idFromProps },
  );

  const setSearchQuery = useCallback(
    (chunk: Partial<SearchChunk>) => {
      client.setQueryData<Search>(idQueryKey, (previous) =>
        updateSearchData(previous, chunk),
      );
    },
    [client, idQueryKey],
  );

  const onMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data: UseChatMessage = JSON.parse(event.data);

        switch (data.type) {
          case UseChatMessageType.SessionCreated:
            client.setQueryData(
              idQueryKey,
              initializeSearchSession({
                ...(data.payload as CreatePayload),
                createdAt: new Date(),
                status: data.status,
                prompt,
              }),
            );
            break;
          case UseChatMessageType.WebSearchFinished:
            setSearchQuery({
              sources: (data.payload as SourcesMessage).sources,
              status: data.status,
            });
            break;
          case UseChatMessageType.WebResultsFiltered:
            setSearchQuery({ status: data.status });
            break;
          case UseChatMessageType.StatusUpdated:
            setSearchQuery({ status: data.status });
            break;
          case UseChatMessageType.NewTokenReceived:
            setSearchQuery({ response: (data.payload as TokenPayload).token });
            break;
          case UseChatMessageType.Completed: {
            setSearchQuery({ completedAt: new Date(), status: data.status });
            setPrompt(undefined);
            sourceRef.current?.close();
            break;
          }
          case UseChatMessageType.Error:
            setSearchQuery({ error: data.payload as SearchChunkError });
            sourceRef.current?.close();
            break;
          case UseChatMessageType.SessionFound:
            client.setQueryData(idQueryKey, () => data.payload as Search);
            break;
          default:
            break;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[EventSource][message] error', error);
      }
    },
    [client, prompt, idQueryKey, setSearchQuery],
  );

  const executePrompt = useCallback(
    async (value: string) => {
      if (!value) {
        return;
      }

      if (sourceRef.current?.OPEN) {
        sourceRef.current.close();
      }

      setSearchQuery(undefined);
      const source = await sendSearchQuery(value, accessToken.token);
      source.addEventListener('message', onMessage);
      source.onerror = () => source.close();
      sourceRef.current = source;
    },
    [setSearchQuery, onMessage, accessToken],
  );

  useEffect(() => {
    return () => {
      if (sourceRef.current?.OPEN) {
        sourceRef.current.close();
      }
    };
  }, []);

  return {
    queryKey: idQueryKey,
    isLoading:
      isLoadingSession ||
      (search?.chunks?.[0]?.createdAt && !search?.chunks?.[0]?.completedAt),
    data: search,
    handleSubmit: useCallback(
      (_, value: string) => {
        executePrompt(value);
      },
      [executePrompt],
    ),
  };
};
