import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

export const useChatStream = (): Pick<UseChat, 'handleSubmit'> & {
  id: string;
} => {
  const { user, accessToken } = useAuthContext();
  const client = useQueryClient();
  const sourceRef = useRef<EventSource>();
  const [sessionId, setSessionId] = useState<string>();

  const executePrompt = useCallback(
    async (value: string) => {
      if (!value) {
        return;
      }

      if (sourceRef.current?.OPEN) {
        sourceRef.current.close();
      }

      setSessionId(undefined);

      let queryKey: ReturnType<typeof generateQueryKey> = null;

      const setSearchQuery = (chunk: Partial<SearchChunk>) => {
        client.setQueryData<Search>(queryKey, (previous) =>
          updateSearchData(previous, chunk),
        );
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const data: UseChatMessage = JSON.parse(event.data);

          switch (data.type) {
            case UseChatMessageType.SessionCreated: {
              const payload = data.payload as CreatePayload;
              queryKey = generateQueryKey(RequestKey.Search, user, payload.id);
              setSessionId(payload.id);

              client.setQueryData(
                queryKey,
                initializeSearchSession({
                  ...payload,
                  createdAt: new Date(),
                  status: data.status,
                  prompt: value,
                }),
              );

              break;
            }
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
              setSearchQuery({
                response: (data.payload as TokenPayload).token,
              });
              break;
            case UseChatMessageType.Completed: {
              setSearchQuery({ completedAt: new Date() });
              sourceRef.current?.close();
              break;
            }
            case UseChatMessageType.Error:
              setSearchQuery({ error: data.payload as SearchChunkError });
              sourceRef.current?.close();
              break;
            case UseChatMessageType.SessionFound: {
              const sessionData = data.payload as Search;
              client.setQueryData(queryKey, sessionData);
              sourceRef.current?.close();
              break;
            }
            default:
              break;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[EventSource][message] error', error);
        }
      };

      const onError = () => {
        sourceRef.current.close();
        setSearchQuery({
          error: {
            message: 'It worked on my machine. Can you please try again?',
            code: 'Unexpected error.',
          },
          progress: -1,
        });
      };

      const source = await sendSearchQuery(value, accessToken.token);
      source.addEventListener('message', onMessage);
      source.addEventListener('error', onError);
      sourceRef.current = source;
    },
    [accessToken.token, client, user],
  );

  useEffect(() => {
    return () => {
      if (sourceRef.current?.OPEN) {
        sourceRef.current.close();
      }
    };
  }, []);

  return {
    id: sessionId,
    handleSubmit: useCallback(
      (_, value: string) => {
        executePrompt(value);
      },
      [executePrompt],
    ),
  };
};

export const useChatSession = ({
  id,
  streamId,
}: Pick<UseChatProps, 'id'> & {
  streamId?: string;
}): Pick<UseChat, 'queryKey' | 'isLoading' | 'data'> => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.Search, user, id),
    [user, id],
  );
  const { data, isLoading } = useQuery(
    queryKey,
    () => {
      if (streamId && streamId === id) {
        return client.getQueryData<Search>(queryKey);
      }

      return getSearchSession(id);
    },
    { enabled: !!id },
  );

  return {
    queryKey,
    isLoading,
    data,
  };
};

export const useChat = ({ id: idFromProps }: UseChatProps): UseChat => {
  const stream = useChatStream();
  const id = idFromProps || stream.id;
  const session = useChatSession({
    id,
    streamId: stream.id,
  });

  const isStreaming = !!(
    session?.data?.chunks?.[0]?.createdAt &&
    !session?.data?.chunks?.[0]?.completedAt
  );

  return {
    queryKey: session.queryKey,
    isLoading: isStreaming || session.isLoading,
    data: session.data,
    handleSubmit: stream.handleSubmit,
  };
};
