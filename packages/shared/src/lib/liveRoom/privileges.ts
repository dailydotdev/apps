import type { LiveRoomParticipantRoleValue, LiveRoomState } from './protocol';

export interface LiveRoomPrivilegeState {
  isHost: boolean;
  isCoHost: boolean;
  hasHostPrivileges: boolean;
}

export const isCoHostParticipant = (
  roomState: Pick<LiveRoomState, 'coHostParticipantIds'> | null | undefined,
  participantId: string | null | undefined,
): boolean =>
  !!participantId && !!roomState?.coHostParticipantIds?.includes(participantId);

export const getLiveRoomPrivilegeState = (
  roomState: Pick<LiveRoomState, 'coHostParticipantIds'> | null | undefined,
  participantId: string | null | undefined,
  role: LiveRoomParticipantRoleValue | null | undefined,
): LiveRoomPrivilegeState => {
  const isHost = role === 'host';
  const isCoHost = isCoHostParticipant(roomState, participantId);

  return {
    isHost,
    isCoHost,
    hasHostPrivileges: isHost || isCoHost,
  };
};
