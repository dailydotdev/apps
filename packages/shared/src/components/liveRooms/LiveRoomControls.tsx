import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { CameraIcon, MegaphoneIcon, PhoneIcon, VolumeOffIcon } from '../icons';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomDevicePicker } from './LiveRoomDevicePicker';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';

const REACTION_EMOJIS = ['👏', '🔥', '💡', '😂', '🤯'];

interface LiveRoomControlsProps {
  onLeave: () => void;
}

export const LiveRoomControls = ({
  onLeave,
}: LiveRoomControlsProps): ReactElement => {
  const {
    canPublish,
    isCameraOn,
    isMicOn,
    isCameraPublishing,
    isMicPublishing,
    toggleCamera,
    toggleMic,
    endRoom,
    joinSpeakerQueue,
    sendReaction,
    role,
    participantId,
    roomState,
    cameras,
    microphones,
    selectedCameraId,
    selectedMicId,
    selectCamera,
    selectMic,
    localStream,
  } = useLiveRoom();
  const localAudioTrack = localStream?.getAudioTracks()[0] ?? null;
  // Wrap the local audio track in its own MediaStream once per track so the
  // meter's AudioContext doesn't churn on every render.
  const localAudioStream = useMemo(
    () => (localAudioTrack ? new MediaStream([localAudioTrack]) : null),
    [localAudioTrack],
  );
  const { displayToast } = useToastNotification();
  const [busy, setBusy] = useState<string | null>(null);

  const guarded = async (
    key: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    if (busy) {
      return;
    }
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  const isHost = role === 'host';
  const isAudience = role === 'audience';
  const isQueued =
    !!participantId &&
    !!roomState?.debate?.speakerQueueParticipantIds.includes(participantId);
  const canJoinQueue =
    isAudience && roomState?.status === 'live' && !isQueued && !busy;

  return (
    <div className="flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {canPublish ? (
          <>
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={
                isMicOn ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              icon={isMicOn ? <MegaphoneIcon /> : <VolumeOffIcon />}
              loading={busy === 'mic'}
              onClick={() => guarded('mic', toggleMic)}
            >
              {isMicOn ? 'Mic on' : 'Mic off'}
              {isMicOn && !isMicPublishing ? ' (preview)' : ''}
            </Button>
            <Button
              type="button"
              size={ButtonSize.Medium}
              variant={
                isCameraOn ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              icon={<CameraIcon secondary={isCameraOn} />}
              loading={busy === 'camera'}
              onClick={() => guarded('camera', toggleCamera)}
            >
              {isCameraOn ? 'Camera on' : 'Camera off'}
              {isCameraOn && !isCameraPublishing ? ' (preview)' : ''}
            </Button>
          </>
        ) : null}
        {isHost ? (
          <Button
            type="button"
            size={ButtonSize.Medium}
            variant={ButtonVariant.Secondary}
            loading={busy === 'end'}
            onClick={() =>
              guarded('end', async () => {
                await endRoom();
                onLeave();
              })
            }
          >
            End room
          </Button>
        ) : null}
        {isAudience ? (
          <Button
            type="button"
            size={ButtonSize.Medium}
            variant={isQueued ? ButtonVariant.Secondary : ButtonVariant.Primary}
            icon={<MegaphoneIcon />}
            loading={busy === 'queue'}
            disabled={!canJoinQueue}
            onClick={() => guarded('queue', joinSpeakerQueue)}
          >
            {isQueued ? 'Queued' : 'Join queue'}
          </Button>
        ) : null}
        <Button
          type="button"
          size={ButtonSize.Medium}
          variant={ButtonVariant.Tertiary}
          icon={<PhoneIcon />}
          onClick={onLeave}
        >
          Leave
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border-subtlest-tertiary pt-3">
        {REACTION_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Float}
            loading={busy === `reaction-${emoji}`}
            aria-label={`React ${emoji}`}
            onClick={() =>
              guarded(`reaction-${emoji}`, () => sendReaction(emoji))
            }
          >
            {emoji}
          </Button>
        ))}
      </div>
      {canPublish ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <LiveRoomDevicePicker
              icon={<MegaphoneIcon />}
              devices={microphones}
              selectedId={selectedMicId}
              onChange={(id) => {
                selectMic(id).catch((err: unknown) =>
                  displayToast(
                    err instanceof Error ? err.message : 'Failed to switch mic',
                  ),
                );
              }}
              emptyLabel="No microphones"
              className="min-w-[12rem]"
            />
            <LiveRoomMicLevel stream={localAudioStream} />
          </div>
          <LiveRoomDevicePicker
            icon={<CameraIcon />}
            devices={cameras}
            selectedId={selectedCameraId}
            onChange={(id) => {
              selectCamera(id).catch((err: unknown) =>
                displayToast(
                  err instanceof Error
                    ? err.message
                    : 'Failed to switch camera',
                ),
              );
            }}
            emptyLabel="No cameras"
            className="min-w-[12rem]"
          />
        </div>
      ) : null}
    </div>
  );
};
