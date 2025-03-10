import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  Search,
  SearchChunk,
  SearchChunkError,
} from '../../graphql/search';
import {
  initializeSearchSession,
  SearchChunkErrorCode,
  searchErrorCodeToMessage,
  sendSearchQuery,
  updateSearchData,
} from '../../graphql/search';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type {
  CreatePayload,
  SourcesMessage,
  TokenPayload,
  UseChatMessage,
  UseChatStream,
} from './types';
import { UseChatMessageType } from './types';
import LogContext from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';

export const useChatStream = (): UseChatStream => {
  const { logEvent } = useContext(LogContext);
  const { user, accessToken } = useAuthContext();
  const client = useQueryClient();
  const sourceRef = useRef<EventSource>();
  const [sessionId, setSessionId] = useState<string>(null);

  const executePrompt = useCallback(
    async (prompt: string) => {
      if (!prompt) {
        return;
      }

      if (
        sourceRef.current &&
        sourceRef.current?.readyState === sourceRef.current?.OPEN
      ) {
        sourceRef.current.close();
      }

      setSessionId(null);

      let queryKey: ReturnType<typeof generateQueryKey> = generateQueryKey(
        RequestKey.Search,
        user,
        null,
      );
      let streamId: string = null;
      client.removeQueries({ queryKey });

      const initSession = (payload: Pick<CreatePayload, 'id'>) => {
        queryKey = generateQueryKey(RequestKey.Search, user, payload.id);
        setSessionId(payload.id);
        streamId = payload.id;
      };

      const setSearchQuery = (chunk: Partial<SearchChunk>) => {
        client.setQueryData<Search>(queryKey, (previous) =>
          updateSearchData(previous, chunk),
        );
      };

      const logErrorEvent = (code: SearchChunkErrorCode) => {
        logEvent({
          event_name: LogEvent.ErrorSearch,
          target_id: streamId,
          extra: JSON.stringify({ code }),
        });
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const data: UseChatMessage = JSON.parse(event.data);

          switch (data.type) {
            case UseChatMessageType.SessionCreated: {
              const payload = data.payload as CreatePayload;
              initSession(payload);

              client.setQueryData(
                queryKey,
                initializeSearchSession({
                  ...payload,
                  createdAt: new Date(),
                  status: data.status,
                  prompt,
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
            case UseChatMessageType.Error: {
              const errorPayload = data.payload as SearchChunkError;
              const message =
                errorPayload.message ||
                searchErrorCodeToMessage[errorPayload.code];

              setSearchQuery({
                error: { ...errorPayload, message },
                progress: -1,
              });

              sourceRef.current?.close();
              logErrorEvent(errorPayload.code);
              break;
            }
            case UseChatMessageType.SessionFound: {
              const sessionData = data.payload as Search;
              initSession(sessionData);
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

          logErrorEvent(SearchChunkErrorCode.Unexpected);
        }
      };

      const onError = () => {
        const data = client.getQueryData<Search>(queryKey);
        const code = data?.chunks?.[0]?.response?.length
          ? SearchChunkErrorCode.StoppedGenerating
          : SearchChunkErrorCode.Unexpected;
        const message = searchErrorCodeToMessage[code];

        sourceRef.current.close();
        setSearchQuery({
          error: { message, code },
          progress: -1,
        });

        logErrorEvent(code);
      };

      const source = await sendSearchQuery(prompt, accessToken?.token);
      source.addEventListener('message', onMessage);
      source.addEventListener('error', onError);
      sourceRef.current = source;
    },
    [accessToken?.token, client, user, logEvent],
  );

  useEffect(() => {
    return () => {
      if (
        sourceRef.current &&
        sourceRef.current?.readyState === sourceRef.current?.OPEN
      ) {
        sourceRef.current.close();
      }
    };
  }, []);

  return {
    id: sessionId,
    handleSubmit: executePrompt,
  };
};
