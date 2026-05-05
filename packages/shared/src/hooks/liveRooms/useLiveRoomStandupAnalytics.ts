import { useCallback } from 'react';
import type {
  LiveRoomConnectionStatus,
  LiveRoomContextValue,
} from '../../contexts/LiveRoomContext';
import { useLogContext } from '../../contexts/LogContext';
import type { LoggedUser } from '../../lib/user';
import { buildStandupAnalyticsExtra } from '../../lib/liveRoom/analytics';
import type { LogEvent } from '../../lib/log';

interface UseLiveRoomStandupAnalyticsProps {
  roomId: string;
  user?: LoggedUser | null;
  role: LiveRoomContextValue['role'];
  roomStatus?: string | null;
  roomMode?: string | null;
  connectionStatus: LiveRoomConnectionStatus;
  participantId: string | null;
  isCoHost: boolean;
  localStream: MediaStream | null;
  videoSettings: LiveRoomContextValue['videoSettings'];
}

export const useLiveRoomStandupAnalytics = ({
  roomId,
  user,
  role,
  roomStatus,
  roomMode,
  connectionStatus,
  participantId,
  isCoHost,
  localStream,
  videoSettings,
}: UseLiveRoomStandupAnalyticsProps) => {
  const { logEvent } = useLogContext();

  const buildStandupExtra = useCallback(
    (extra: Record<string, unknown> = {}) =>
      buildStandupAnalyticsExtra(
        {
          roomId,
          authKind: user ? 'authenticated' : 'anonymous',
          role,
          roomStatus: roomStatus ?? null,
          roomMode: roomMode ?? null,
          connectionStatus,
          participantId,
          isCoHost,
          hasLocalAudioTrack: !!localStream?.getAudioTracks()[0],
          hasLocalVideoTrack: !!localStream?.getVideoTracks()[0],
          videoQuality: videoSettings.quality,
          audioOnly: videoSettings.audioOnly,
          hideSelfView: videoSettings.hideSelfView,
        },
        extra,
      ),
    [
      roomId,
      user,
      role,
      roomStatus,
      roomMode,
      connectionStatus,
      participantId,
      isCoHost,
      localStream,
      videoSettings.quality,
      videoSettings.audioOnly,
      videoSettings.hideSelfView,
    ],
  );

  const logStandupAction = useCallback(
    (
      eventName: LogEvent,
      targetId: string,
      extra: Record<string, unknown> = {},
    ): void => {
      logEvent({
        event_name: eventName,
        target_id: targetId,
        extra: buildStandupExtra(extra),
      });
    },
    [buildStandupExtra, logEvent],
  );

  return { buildStandupExtra, logStandupAction };
};
