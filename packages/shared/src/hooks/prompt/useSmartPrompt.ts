import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { Post } from '../../graphql/posts';
import type { Prompt } from '../../graphql/prompt';
import type {
  Search,
  SearchChunk,
  SearchChunkError,
} from '../../graphql/search';
import {
  initializeSearchSession,
  searchErrorCodeToMessage,
  sendSmartPromptQuery,
  updateSearchData,
} from '../../graphql/search';
import type { CreatePayload, TokenPayload, UseChatMessage } from '../chat';
import { UseChatMessageType } from '../chat';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../useActions';

export const useSmartPrompt = ({
  post,
  prompt,
}: {
  post: Post;
  prompt: Prompt;
}): {
  executePrompt: (value: string) => Promise<void>;
  data: Search;
  isPending: boolean;
} => {
  const { user, accessToken } = useAuthContext();
  const { flags, updateFlagRemote } = useSettingsContext();
  const { completeAction, checkHasCompleted } = useActions();
  const lastPrompt = flags?.lastPrompt;
  const client = useQueryClient();
  const sourceRef = useRef<EventSource>();
  const triedSmartPrompts = checkHasCompleted(ActionType.SmartPrompt);

  const queryKey = useMemo(
    () => generateQueryKey(RequestKey.Prompts, user, post.id, prompt.id),
    [post.id, prompt.id, user],
  );

  const { data, isPending } = useQuery<Search>({
    queryKey,
    enabled: !!prompt.prompt,
    staleTime: StaleTime.OneHour,
  });

  const executePrompt = useCallback(
    async (value: string) => {
      if (!value) {
        return;
      }

      if (
        sourceRef.current &&
        sourceRef.current?.readyState === sourceRef.current?.OPEN
      ) {
        sourceRef.current.close();
      }

      const setSearchQuery = (chunk: Partial<SearchChunk>) => {
        client.setQueryData<Search>(queryKey, (previous) =>
          updateSearchData(previous, chunk),
        );
      };

      const onMessage = (event: MessageEvent) => {
        const messageData: UseChatMessage = JSON.parse(event.data);

        switch (messageData.type) {
          case UseChatMessageType.SessionCreated: {
            const payload = messageData.payload as CreatePayload;

            client.setQueryData(
              queryKey,
              initializeSearchSession({
                ...payload,
                createdAt: new Date(),
                status: messageData.status,
                prompt: value,
              }),
            );

            break;
          }
          case UseChatMessageType.StatusUpdated:
            setSearchQuery({ status: messageData.status });
            break;
          case UseChatMessageType.NewTokenReceived:
            setSearchQuery({
              response: (messageData.payload as TokenPayload).token,
            });
            break;
          case UseChatMessageType.Completed: {
            setSearchQuery({ completedAt: new Date() });
            sourceRef.current?.close();
            if (lastPrompt !== prompt.id) {
              updateFlagRemote('lastPrompt', prompt.id);
            }
            if (!triedSmartPrompts) {
              completeAction(ActionType.SmartPrompt);
            }
            break;
          }
          case UseChatMessageType.Error: {
            const errorPayload = messageData.payload as SearchChunkError;
            const message =
              errorPayload.message ||
              searchErrorCodeToMessage[errorPayload.code];

            setSearchQuery({
              error: { ...errorPayload, message },
              progress: -1,
            });

            sourceRef.current?.close();
            break;
          }
          case UseChatMessageType.SessionFound:
            client.setQueryData(queryKey, messageData.payload as Search);
            sourceRef.current?.close();
            break;
          default:
            break;
        }
      };

      const source = await sendSmartPromptQuery({
        query: value,
        token: accessToken?.token,
        post,
      });
      source.addEventListener('message', onMessage);
      sourceRef.current = source;
    },
    [
      accessToken?.token,
      client,
      lastPrompt,
      post,
      prompt.id,
      queryKey,
      updateFlagRemote,
    ],
  );

  useEffect(() => {
    return () => {
      if (
        sourceRef.current &&
        sourceRef.current?.readyState === sourceRef.current?.OPEN
      ) {
        client.resetQueries({ queryKey, exact: true });
        sourceRef.current.close();
      }
    };
  }, [client, queryKey]);

  return {
    executePrompt,
    data,
    isPending,
  };
};
