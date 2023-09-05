import { useRef, useState, useCallback, useEffect, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  SearchChunk,
  updateSearchData,
  initializeSearchSession,
  SearchChunkError,
  sendSearchQuery,
  Search,
  SearchChunkErrorCode,
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
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent } from '../../lib/analytics';
import { labels } from '../../lib';

export const useChatStream = (): UseChatStream => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { user, accessToken } = useAuthContext();
  const client = useQueryClient();
  const sourceRef = useRef<EventSource>();
  const [sessionId, setSessionId] = useState<string>(null);

  const executePrompt = useCallback(
    async (value: string) => {
      if (!value) {
        return;
      }

      if (sourceRef.current?.OPEN) {
        sourceRef.current.close();
      }

      setSessionId(null);

      let queryKey: ReturnType<typeof generateQueryKey> = generateQueryKey(
        RequestKey.Search,
        user,
        null,
      );
      let streamId: string = null;
      client.removeQueries(queryKey);

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

      const trackErrorEvent = () => {
        trackEvent({
          event_name: AnalyticsEvent.ErrorSearch,
          target_id: streamId,
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
            case UseChatMessageType.Error: {
              const errorPayload = data.payload as SearchChunkError;

              switch (errorPayload.code) {
                case SearchChunkErrorCode.RateLimit:
                  setSearchQuery({
                    error: {
                      ...errorPayload,
                      message: labels.search.rateLimitExceeded,
                    },
                    progress: -1,
                  });
                  break;
                default:
                  setSearchQuery({ error: errorPayload });
              }

              sourceRef.current?.close();
              trackErrorEvent();
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

          trackErrorEvent();
        }
      };

      const onError = () => {
        sourceRef.current.close();
        setSearchQuery({
          error: {
            message: 'It worked on my machine. Can you please try again?',
            code: SearchChunkErrorCode.Unexpected,
          },
          progress: -1,
        });

        trackErrorEvent();
      };

      const source = await sendSearchQuery(value, accessToken?.token);
      source.addEventListener('message', onMessage);
      source.addEventListener('error', onError);
      sourceRef.current = source;
    },
    [accessToken?.token, client, user, trackEvent],
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
