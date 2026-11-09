import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogContext } from '../../../contexts/LogContext';
import { usePrompt } from '../../../hooks/usePrompt';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { LogEvent, TargetType } from '../../../lib/log';
import { RequestKey } from '../../../lib/query';
import { banChatRoomUser, closeChatRoom } from '../graphql';

type UseLiveChatModeration = {
  // Ends the room for everyone, after asking.
  end: () => Promise<void>;
  // Removes the person from the room for good, after asking.
  ban: (userId: string, name?: string) => Promise<void>;
};

// What the daily.dev team does to a room besides chatting in it. Both ask
// first: neither can be undone. The room queries are refreshed after an end
// so every surface showing the room sees it close.
export const useLiveChatModeration = ({
  roomId,
  origin,
  onBanned,
}: {
  roomId?: string;
  origin: string;
  // The banned person's messages are the caller's to drop.
  onBanned?: (userId: string) => void;
}): UseLiveChatModeration => {
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const { showPrompt } = usePrompt();
  const { displayToast } = useToastNotification();

  const log = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.ChatRoom,
        target_id: roomId,
        extra: JSON.stringify({ origin, ...extra }),
      }),
    [logEvent, origin, roomId],
  );

  const end = useCallback(async () => {
    if (!roomId) {
      return;
    }
    const confirmed = await showPrompt({
      title: 'End this chat?',
      description: 'Everyone is sent out, and nothing is kept.',
      okButton: { title: 'End chat' },
    });
    if (!confirmed) {
      return;
    }
    try {
      await closeChatRoom(roomId);
      log(LogEvent.EndLiveChat);
      await queryClient.invalidateQueries({ queryKey: [RequestKey.ChatRooms] });
    } catch {
      displayToast("Couldn't end the chat. Try again.");
    }
  }, [displayToast, log, queryClient, roomId, showPrompt]);

  const ban = useCallback(
    async (userId: string, name?: string) => {
      if (!roomId) {
        return;
      }
      const confirmed = await showPrompt({
        title: `Remove ${name ?? 'this person'} from the chat?`,
        description:
          "They're sent out and can't come back to this chat. What they already said stays on screen for everyone else.",
        okButton: { title: 'Remove' },
      });
      if (!confirmed) {
        return;
      }
      try {
        await banChatRoomUser(roomId, userId);
        onBanned?.(userId);
        log(LogEvent.BanLiveChatUser, { banned_user_id: userId });
      } catch {
        displayToast("Couldn't remove them. Try again.");
      }
    },
    [displayToast, log, onBanned, roomId, showPrompt],
  );

  return { end, ban };
};
