import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { UserShortProfile } from '../../../lib/user';
import { dmPeerQueryOptions } from '../../messages/queries';

export type RoomPerson = Pick<
  UserShortProfile,
  'id' | 'name' | 'username' | 'image' | 'permalink'
>;

// The people in a room, as far as the viewer can tell: a live room only
// broadcasts moderators' presence, so "who is here" is whoever has spoken
// or typed since the viewer joined, plus the viewer. Profiles are the same
// cached lookups the direct messages use.
export const useRoomPeople = (
  senderIds: string[],
): { people: RoomPerson[]; usernames: Record<string, string> } => {
  const { user } = useAuthContext();
  const others = useMemo(
    () => senderIds.filter((id) => id !== user?.id),
    [senderIds, user?.id],
  );
  const peers = useQueries({
    queries: others.map((id) => ({
      ...dmPeerQueryOptions(user, id),
      enabled: !!user?.id,
    })),
  });

  // A dependency list that grows with the room would keep React from seeing
  // a change (it compares the common prefix only), so the data is folded
  // into one key.
  const peersKey = peers
    .map(({ data }) => (data ? `${data.id}:${data.username}:${data.name}` : ''))
    .join('|');

  return useMemo(() => {
    const people: RoomPerson[] = [];
    const usernames: Record<string, string> = {};
    if (user) {
      people.push({
        id: user.id,
        name: user.name,
        username: user.username ?? '',
        image: user.image,
        permalink: user.permalink ?? '',
      });
      usernames[user.id] = user.username ?? '';
    }
    peers.forEach(({ data }) => {
      if (data) {
        people.push({
          id: data.id,
          name: data.name,
          username: data.username,
          image: data.image,
          permalink: data.permalink,
        });
        usernames[data.id] = data.username;
      }
    });

    return { people, usernames };
    // `peers` is a new array every render; peersKey carries what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, peersKey]);
};
