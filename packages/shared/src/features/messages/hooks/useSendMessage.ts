import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError, getApiError } from '../../../graphql/common';
import { LogEvent } from '../../../lib/log';
import { getDmTransport } from '../transport';
import { dmConversationsQueryKey, dmThreadQueryKey } from '../queries';
import type { DmCommentContext, DmMessage, DmPeer } from '../types';
import { DmMessageStatus } from '../types';

type SendVariables = {
  body: string;
  tempId: string;
  context?: DmCommentContext;
};

type UseSendMessage = {
  send: (body: string, context?: DmCommentContext) => void;
  retry: (message: DmMessage) => void;
};

export const useSendMessage = (
  peer: DmPeer | null | undefined,
): UseSendMessage => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const threadKey = dmThreadQueryKey(user, peer?.id ?? '');

  const updateThread = useCallback(
    (update: (messages: DmMessage[]) => DmMessage[]) =>
      queryClient.setQueryData<DmMessage[]>(threadKey, (messages) =>
        update(messages ?? []),
      ),
    [queryClient, threadKey],
  );

  const { mutate } = useMutation({
    mutationFn: ({ body, context }: SendVariables) =>
      getDmTransport(user!.id).send(peer!, body, context),
    onMutate: ({ body, tempId, context }) => {
      updateThread((messages) => [
        ...messages.filter(({ id }) => id !== tempId),
        {
          id: tempId,
          peerId: peer!.id,
          senderId: user!.id,
          body,
          createdAt: new Date().toISOString(),
          status: DmMessageStatus.Sending,
          ...(context && { context }),
        },
      ]);
    },
    onSuccess: (sent, { tempId, context }) => {
      updateThread((messages) =>
        messages.map((message) => (message.id === tempId ? sent : message)),
      );
      queryClient.invalidateQueries({
        queryKey: dmConversationsQueryKey(user),
      });
      logEvent({
        event_name: LogEvent.SendDirectMessage,
        target_id: peer?.id,
        extra: JSON.stringify({ has_comment_ref: !!context }),
      });
    },
    onError: (error: ApiErrorResult, { tempId }) => {
      // daily-api refusing to open the conversation (peer unavailable, daily
      // limit) won't change on retry, so say why instead of offering one.
      const refusal =
        getApiError(error, ApiError.Forbidden) ??
        getApiError(error, ApiError.RateLimited);

      if (refusal) {
        displayToast(refusal.message);
      }

      updateThread((messages) =>
        messages.map((message) =>
          message.id === tempId
            ? {
                ...message,
                status: refusal
                  ? DmMessageStatus.Rejected
                  : DmMessageStatus.Failed,
              }
            : message,
        ),
      );
    },
  });

  const send = useCallback(
    (body: string, context?: DmCommentContext) => {
      if (!user || !peer) {
        return;
      }

      mutate({ body, context, tempId: `pending-${Date.now()}` });
    },
    [mutate, peer, user],
  );

  // Reuses the failed bubble's id so the retry replaces it in place.
  const retry = useCallback(
    (message: DmMessage) =>
      mutate({
        body: message.body,
        context: message.context,
        tempId: message.id,
      }),
    [mutate],
  );

  return { send, retry };
};
