interface LiveRoomStatusLike {
  activityStatus?: string | null;
  mode?: string | null;
  status?: string | null;
}

export const isCommunityModeratedRoom = (
  room: Pick<LiveRoomStatusLike, 'mode'> | null | undefined,
): boolean => room?.mode === 'community_moderated';

export const isLiveRoomEffectivelyLive = (
  room: LiveRoomStatusLike | null | undefined,
): boolean => {
  if (!room) {
    return false;
  }

  if (isCommunityModeratedRoom(room)) {
    return room.activityStatus === 'live';
  }

  return room.status === 'live';
};
