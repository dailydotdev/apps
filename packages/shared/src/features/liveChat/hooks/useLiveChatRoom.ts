import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { getDmTransport } from '../../messages/transport';
import type {
  DmChatState,
  RoomJoinFailure,
  RoomMessage,
} from '../../messages/types';
import type { ChatRoom } from '../graphql';
import { ChatRoomStatus, openPostChatRoom } from '../graphql';
import { postChatRoomQueryOptions } from '../queries';

export type LiveChatStatus =
  // Not in the room; the room may or may not exist yet.
  | 'idle'
  | 'joining'
  | 'joined'
  // The viewer left, or a moderator removed them.
  | 'left'
  | 'ended'
  | 'failed';

export const LIVE_CHAT_MESSAGE_MAX_LENGTH = 500;
// Enough scrollback for a busy hour; the room itself keeps nothing.
const MESSAGE_CAP = 300;
// A sender who stops typing without saying so shouldn't look busy forever.
const typingTimeoutMs = 10 * 1000;
// How long after the last keystroke the room sees the typing stop, and how
// often `composing` repeats while it goes on (under the timeout above).
const pauseAfterMs = 4 * 1000;
const repeatComposingMs = 5 * 1000;

type UseLiveChatRoom = {
  room: ChatRoom | null | undefined;
  isRoomLoading: boolean;
  status: LiveChatStatus;
  failure?: RoomJoinFailure;
  messages: RoomMessage[];
  typingUserIds: string[];
  // Opens the post's room when there is none yet, then joins it.
  join: () => Promise<void>;
  leave: () => void;
  send: (body: string) => Promise<void>;
  // Whether the draft has text, on every change, for the typing indicator.
  onDraftChange: (hasText: boolean) => void;
};

// One post's live chat: the room from the API, and the viewer's seat in it
// over the chat connection. Messages live only here, as long as the surface
// is mounted; the room keeps nothing, and that is the point of it.
export const useLiveChatRoom = ({
  postId,
  origin,
}: {
  postId: string;
  origin: string;
}): UseLiveChatRoom => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { logEvent } = useLogContext();
  const roomQuery = postChatRoomQueryOptions(user, postId);
  const { data: room, isPending: isRoomLoading } = useQuery(roomQuery);
  const roomJid = room?.status === ChatRoomStatus.Active ? room.jid : null;

  const [status, setStatus] = useState<LiveChatStatus>('idle');
  const [failure, setFailure] = useState<RoomJoinFailure>();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [typing, setTyping] = useState<Record<string, true>>({});
  const typingTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  // The room the viewer is seated in, for the leave on unmount and for
  // ignoring events about other rooms.
  const seatedJid = useRef<string | null>(null);
  const isComposing = useRef(false);
  const composingSentAt = useRef(0);
  const pauseTimer = useRef<ReturnType<typeof setTimeout>>();

  const log = useCallback(
    (eventName: LogEvent, extra?: Record<string, unknown>) =>
      logEvent({
        event_name: eventName,
        target_type: TargetType.ChatRoom,
        target_id: room?.id,
        extra: JSON.stringify({ origin, post_id: postId, ...extra }),
      }),
    [logEvent, origin, postId, room?.id],
  );

  const setSenderTyping = useCallback((senderId: string, isTyping: boolean) => {
    const timers = typingTimers.current;
    clearTimeout(timers.get(senderId));
    timers.delete(senderId);
    setTyping((current) => {
      if (isTyping === !!current[senderId]) {
        return current;
      }
      const next = { ...current };
      if (isTyping) {
        next[senderId] = true;
      } else {
        delete next[senderId];
      }
      return next;
    });
    if (isTyping) {
      timers.set(
        senderId,
        setTimeout(() => setSenderTyping(senderId, false), typingTimeoutMs),
      );
    }
  }, []);

  // Everything the room sends while the viewer is seated in it.
  useEffect(() => {
    if (!user?.id || !roomJid || status === 'idle') {
      return undefined;
    }

    const unsubscribe = getDmTransport(user.id).subscribe((event) => {
      if (!('roomJid' in event) && event.type !== 'roomMessage') {
        return;
      }
      const eventRoomJid =
        event.type === 'roomMessage' ? event.message.roomJid : event.roomJid;
      if (eventRoomJid !== roomJid) {
        return;
      }

      switch (event.type) {
        case 'roomMessage': {
          const { message } = event;
          setSenderTyping(message.senderId, false);
          setMessages((current) =>
            current.some(({ id }) => id === message.id)
              ? current.map((item) =>
                  item.id === message.id ? { ...item, ...message } : item,
                )
              : [...current, message].slice(-MESSAGE_CAP),
          );
          break;
        }
        case 'roomChatState':
          setSenderTyping(event.senderId, event.state === 'composing');
          break;
        case 'roomJoined':
          seatedJid.current = roomJid;
          setStatus('joined');
          break;
        case 'roomLeft':
          seatedJid.current = null;
          setStatus('left');
          break;
        case 'roomEnded':
          seatedJid.current = null;
          setStatus('ended');
          queryClient.invalidateQueries({ queryKey: roomQuery.queryKey });
          break;
        case 'roomJoinFailed':
          seatedJid.current = null;
          setFailure(event.reason);
          setStatus('failed');
          break;
        default:
      }
    });

    return unsubscribe;
    // The query key is stable per post; the options object is not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, roomJid, setSenderTyping, status !== 'idle', user?.id]);

  // The room polls while the viewer is in it, so a room that ends on the
  // server (expiry, the post gone) ends here too even without the presence.
  useEffect(() => {
    if (status === 'joined' && room && room.status !== ChatRoomStatus.Active) {
      seatedJid.current = null;
      setStatus('ended');
    }
  }, [room, status]);

  const sendChatState = useCallback(
    (state: DmChatState) => {
      const jid = seatedJid.current;
      if (!user?.id || !jid) {
        return;
      }
      getDmTransport(user.id)
        .sendRoomChatState(jid, state)
        .catch(() => undefined);
    },
    [user?.id],
  );

  const stopComposing = useCallback(
    (notify: boolean) => {
      clearTimeout(pauseTimer.current);
      pauseTimer.current = undefined;
      if (isComposing.current && notify) {
        sendChatState('paused');
      }
      isComposing.current = false;
    },
    [sendChatState],
  );

  const onDraftChange = useCallback(
    (hasText: boolean) => {
      if (!hasText) {
        stopComposing(true);
        return;
      }
      const now = Date.now();
      if (
        !isComposing.current ||
        now - composingSentAt.current >= repeatComposingMs
      ) {
        sendChatState('composing');
        composingSentAt.current = now;
      }
      isComposing.current = true;
      clearTimeout(pauseTimer.current);
      pauseTimer.current = setTimeout(() => stopComposing(true), pauseAfterMs);
    },
    [sendChatState, stopComposing],
  );

  const join = useCallback(async () => {
    if (!user?.id || status === 'joining' || status === 'joined') {
      return;
    }

    setFailure(undefined);
    setStatus('joining');
    try {
      let target = room;
      if (!target?.jid || target.status !== ChatRoomStatus.Active) {
        target = await openPostChatRoom(postId);
        queryClient.setQueryData(roomQuery.queryKey, target);
      }
      if (!target.jid) {
        throw new Error('The chat room is not ready yet');
      }
      setMessages([]);
      await getDmTransport(user.id).joinRoom(target.jid);
      log(LogEvent.JoinLiveChat);
    } catch (err) {
      setFailure('unknown');
      setStatus('failed');
      throw err;
    }
    // The query key is stable per post; the options object is not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [log, postId, queryClient, room, status, user?.id]);

  const leave = useCallback(() => {
    const jid = seatedJid.current;
    seatedJid.current = null;
    stopComposing(false);
    setStatus('left');
    if (user?.id && jid) {
      getDmTransport(user.id)
        .leaveRoom(jid)
        .catch(() => undefined);
      log(LogEvent.LeaveLiveChat);
    }
  }, [log, stopComposing, user?.id]);

  const send = useCallback(
    async (body: string) => {
      const jid = seatedJid.current;
      const text = body.trim().slice(0, LIVE_CHAT_MESSAGE_MAX_LENGTH);
      if (!user?.id || !jid || !text) {
        return;
      }
      stopComposing(false);
      const message = await getDmTransport(user.id).sendRoomMessage(jid, text);
      // The room reflects it back with the same id, which replaces this copy.
      setMessages((current) =>
        current.some(({ id }) => id === message.id)
          ? current
          : [...current, message].slice(-MESSAGE_CAP),
      );
      log(LogEvent.SendLiveChatMessage, { length: text.length });
    },
    [log, stopComposing, user?.id],
  );

  // Leaving the page leaves the room; nothing about the seat survives it.
  useEffect(() => {
    const timers = typingTimers.current;
    return () => {
      const jid = seatedJid.current;
      seatedJid.current = null;
      clearTimeout(pauseTimer.current);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      if (user?.id && jid) {
        getDmTransport(user.id)
          .leaveRoom(jid)
          .catch(() => undefined);
      }
    };
  }, [user?.id]);

  const typingUserIds = useMemo(
    () => Object.keys(typing).filter((id) => id !== user?.id),
    [typing, user?.id],
  );

  return {
    room,
    isRoomLoading,
    status,
    failure,
    messages,
    typingUserIds,
    join,
    leave,
    send,
    onDraftChange,
  };
};
