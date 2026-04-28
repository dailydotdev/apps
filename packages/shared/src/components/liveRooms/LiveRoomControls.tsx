import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import {
  CameraIcon,
  MegaphoneIcon,
  PhoneIcon,
  PlusIcon,
  SettingsIcon,
  VolumeOffIcon,
} from '../icons';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomDevicePicker } from './LiveRoomDevicePicker';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';

const REACTION_EMOJIS = ['👏', '🔥', '💡', '😂', '🤯'];

interface LiveRoomControlsProps {
  onLeave: () => void;
}

const Divider = (): ReactElement => (
  <span aria-hidden className="h-6 w-px shrink-0 bg-border-subtlest-tertiary" />
);

const ControlGroup = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-1.5', className)}>
    {children}
  </div>
);

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
    startRoom,
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
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);

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
  const showGoLive = isHost && roomState?.status === 'created';

  const previewSuffix = (active: boolean, publishing: boolean) =>
    active && !publishing ? ' (preview)' : '';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-2 flex justify-center px-3 tablet:bottom-6">
      <div className="pointer-events-auto relative flex w-full max-w-[42rem] flex-col items-center gap-2">
        {reactionsOpen ? (
          <div className="flex items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-1.5 shadow-2">
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
                <span className="text-lg leading-none">{emoji}</span>
              </Button>
            ))}
            <EmojiPicker
              value=""
              label={null}
              onChange={(emoji) => {
                if (!emoji) {
                  return;
                }

                guarded('reaction-custom', () => sendReaction(emoji));
              }}
              renderTrigger={({ isOpen, toggleOpen }) => (
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={isOpen ? ButtonVariant.Primary : ButtonVariant.Float}
                  className="!w-9 shrink-0"
                  icon={<PlusIcon size={IconSize.Size16} />}
                  aria-label="Custom reaction"
                  aria-expanded={isOpen}
                  disabled={!!busy}
                  onClick={toggleOpen}
                />
              )}
            />
          </div>
        ) : null}

        {devicesOpen && canPublish ? (
          <div className="flex w-full max-w-[28rem] flex-col gap-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3 shadow-2">
            <div className="flex items-center gap-2">
              <LiveRoomDevicePicker
                icon={<MegaphoneIcon />}
                devices={microphones}
                selectedId={selectedMicId}
                onChange={(id) => {
                  selectMic(id).catch((err: unknown) =>
                    displayToast(
                      err instanceof Error
                        ? err.message
                        : 'Failed to switch mic',
                    ),
                  );
                }}
                emptyLabel="No microphones"
                className="min-w-0 flex-1"
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
              className="min-w-0 flex-1"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2 backdrop-blur">
          {canPublish ? (
            <ControlGroup>
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  isMicOn ? ButtonVariant.Primary : ButtonVariant.Secondary
                }
                icon={isMicOn ? <MegaphoneIcon /> : <VolumeOffIcon />}
                loading={busy === 'mic'}
                aria-label={`Mic ${isMicOn ? 'on' : 'off'}${previewSuffix(
                  isMicOn,
                  isMicPublishing,
                )}`}
                onClick={() => guarded('mic', toggleMic)}
              />
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  isCameraOn ? ButtonVariant.Primary : ButtonVariant.Secondary
                }
                icon={<CameraIcon secondary={isCameraOn} />}
                loading={busy === 'camera'}
                aria-label={`Camera ${isCameraOn ? 'on' : 'off'}${previewSuffix(
                  isCameraOn,
                  isCameraPublishing,
                )}`}
                onClick={() => guarded('camera', toggleCamera)}
              />
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  devicesOpen ? ButtonVariant.Primary : ButtonVariant.Secondary
                }
                icon={<SettingsIcon />}
                aria-label="Devices"
                aria-expanded={devicesOpen}
                onClick={() => setDevicesOpen((open) => !open)}
              />
            </ControlGroup>
          ) : null}

          {canPublish ? <Divider /> : null}

          <ControlGroup>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={
                reactionsOpen ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              aria-label="Reactions"
              aria-expanded={reactionsOpen}
              onClick={() => setReactionsOpen((open) => !open)}
            >
              <span className="text-base leading-none">😀</span>
            </Button>
            {isAudience ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  isQueued ? ButtonVariant.Secondary : ButtonVariant.Primary
                }
                icon={<MegaphoneIcon />}
                loading={busy === 'queue'}
                disabled={!canJoinQueue}
                onClick={() => guarded('queue', joinSpeakerQueue)}
              >
                {isQueued ? 'Queued' : 'Join queue'}
              </Button>
            ) : null}
          </ControlGroup>

          <Divider />

          <ControlGroup>
            {showGoLive ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="live-room-go-live-button !border-transparent"
                loading={busy === 'go-live'}
                onClick={() => guarded('go-live', startRoom)}
              >
                Go live
              </Button>
            ) : null}
            {isHost ? (
              <Button
                type="button"
                size={ButtonSize.Small}
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
            ) : (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                icon={<PhoneIcon />}
                aria-label="Leave"
                onClick={onLeave}
              >
                Leave
              </Button>
            )}
          </ControlGroup>
        </div>
      </div>
    </div>
  );
};
