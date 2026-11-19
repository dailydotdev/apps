import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { RoomMessage } from '../../messages/types';
import {
  chatRoomPresenceQueryOptions,
  LIVE_CHAT_PRESENCE_MAX_USERS,
} from '../queries';

// Someone who spoke this recently counts as here whatever the last poll
// said: readers give their seat back when they scroll away, and the poll
// lags a join by up to half a minute.
export const LIVE_CHAT_RECENTLY_ACTIVE_MS = 3 * 60 * 1000;

// Here (true), gone (false) or unknown (undefined) for a sender.
export type RoomPresenceOf = (userId: string) => boolean | undefined;

// Whether the people who wrote in a room are still in it. A live room
// doesn't broadcast presence, so the API is asked about the senders on
// screen (the latest first, up to its cap) while the viewer holds a seat.
export const useRoomPresence = ({
  roomId,
  messages,
  enabled,
}: {
  roomId?: string;
  messages: RoomMessage[];
  enabled: boolean;
}): RoomPresenceOf => {
  const { user } = useAuthContext();

  const { senderIds, lastSpokeAt } = useMemo(() => {
    const latest: Record<string, number> = {};
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const { senderId, createdAt } = messages[i];
      if (senderId !== user?.id && !(senderId in latest)) {
        latest[senderId] = new Date(createdAt).getTime();
      }
    }

    return {
      // Sorted so the same people make the same query key.
      senderIds: Object.keys(latest)
        .slice(0, LIVE_CHAT_PRESENCE_MAX_USERS)
        .sort(),
      lastSpokeAt: latest,
    };
  }, [messages, user?.id]);

  // The poll reads the senders when it runs rather than keying on them.
  const senderIdsRef = useRef(senderIds);
  senderIdsRef.current = senderIds;

  // Reading dataUpdatedAt re-renders on every poll, even an unchanged
  // answer, which is what lets a recent speaker's grace run out.
  const { data, dataUpdatedAt } = useQuery({
    ...chatRoomPresenceQueryOptions(user, roomId, () => senderIdsRef.current),
    enabled: enabled && !!user && !!roomId && senderIds.length > 0,
  });

  return useMemo(() => {
    const presentIds = data?.present ? new Set(data.present) : undefined;
    // Only the senders this answer covers: one who appeared since is
    // unknown until the next poll, not gone.
    const asked = new Set(data?.userIds);
    const now = Date.now();

    return (userId: string) => {
      const spokeAt = lastSpokeAt[userId];
      if (spokeAt && now - spokeAt < LIVE_CHAT_RECENTLY_ACTIVE_MS) {
        return true;
      }
      if (!presentIds || !asked.has(userId)) {
        return undefined;
      }
      return presentIds.has(userId);
    };
    // dataUpdatedAt only moves `now` along.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, lastSpokeAt, dataUpdatedAt]);
};
