export interface StandupAnalyticsContext {
  roomId: string;
  authKind: 'anonymous' | 'authenticated';
  role?: string | null;
  roomStatus?: string | null;
  roomMode?: string | null;
  connectionStatus?: string | null;
  canPublish?: boolean;
  participantId?: string | null;
  selectedMicId?: string | null;
  selectedCameraId?: string | null;
  hasLocalAudioTrack?: boolean;
  hasLocalVideoTrack?: boolean;
  videoQuality?: string | null;
  audioOnly?: boolean;
  hideSelfView?: boolean;
  isResuming?: boolean;
}

export const buildStandupAnalyticsExtra = (
  context: StandupAnalyticsContext,
  extra: Record<string, unknown> = {},
): string =>
  JSON.stringify({
    roomId: context.roomId,
    authKind: context.authKind,
    role: context.role,
    roomStatus: context.roomStatus,
    roomMode: context.roomMode,
    connectionStatus: context.connectionStatus,
    canPublish: context.canPublish,
    participantId: context.participantId,
    selectedMicId: context.selectedMicId,
    selectedCameraId: context.selectedCameraId,
    hasLocalAudioTrack: context.hasLocalAudioTrack,
    hasLocalVideoTrack: context.hasLocalVideoTrack,
    videoQuality: context.videoQuality,
    audioOnly: context.audioOnly,
    hideSelfView: context.hideSelfView,
    isResuming: context.isResuming,
    ...extra,
  });
