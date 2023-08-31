import { useRef, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  SearchChunk,
  updateSearchData,
  initializeSearchSession,
  SearchChunkError,
  sendSearchQuery,
  Search,
} from '../../graphql/search';
import { generateQueryKey, RequestKey } from '../../lib/query';
import {
  UseChatMessage,
  UseChatMessageType,
  CreatePayload,
  SourcesMessage,
  TokenPayload,
  UseChatStream,
} from './types';

export const useChatStream = (): UseChatStream => {
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
