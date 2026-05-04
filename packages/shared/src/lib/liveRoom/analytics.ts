export interface StandupAnalyticsContext {
  roomId: string;
  authKind: 'anonymous' | 'authenticated';
  role?: string | null;
  roomStatus?: string | null;
  roomMode?: string | null;
  connectionStatus?: string | null;
  participantId?: string | null;
  isCoHost?: boolean;
  hasLocalAudioTrack?: boolean;
  hasLocalVideoTrack?: boolean;
  videoQuality?: string | null;
  audioOnly?: boolean;
  hideSelfView?: boolean;
  isResuming?: boolean;
}

const compactStandupExtra = (
  payload: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  );

export const buildStandupAnalyticsExtra = (
  context: StandupAnalyticsContext,
  extra: Record<string, unknown> = {},
): string =>
  JSON.stringify(
    compactStandupExtra({
      roomId: context.roomId,
      authKind: context.authKind,
      role: context.role,
      roomStatus: context.roomStatus,
      roomMode: context.roomMode,
      connectionStatus: context.connectionStatus,
      participantId: context.participantId,
      isCoHost: context.isCoHost,
      hasLocalAudioTrack: context.hasLocalAudioTrack,
      hasLocalVideoTrack: context.hasLocalVideoTrack,
      videoQuality: context.videoQuality,
      audioOnly: context.audioOnly,
      hideSelfView: context.hideSelfView,
      isResuming: context.isResuming,
      ...extra,
    }),
  );
