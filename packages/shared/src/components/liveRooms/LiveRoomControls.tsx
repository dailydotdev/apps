import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '../Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  type IconType,
} from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import {
  ArrowIcon,
  CameraIcon,
  MegaphoneIcon,
  PhoneIcon,
  PlusIcon,
  VIcon,
  VolumeOffIcon,
} from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { LiveRoomDeviceInfo } from '../../contexts/LiveRoomContext';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';

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

interface DeviceSplitButtonProps {
  isOn: boolean;
  isLoading: boolean;
  toggleAriaLabel: string;
  caretAriaLabel: string;
  caretMenuLabel: string;
  toggleIcon: IconType;
  onToggle: () => void;
  devices: LiveRoomDeviceInfo[];
  selectedId: string | null;
  onSelect: (deviceId: string) => void;
  emptyLabel: string;
  extra?: ReactNode;
}

const DeviceSplitButton = ({
  isOn,
  isLoading,
  toggleAriaLabel,
  caretAriaLabel,
  caretMenuLabel,
  toggleIcon,
  onToggle,
  devices,
  selectedId,
  onSelect,
  emptyLabel,
  extra,
}: DeviceSplitButtonProps): ReactElement => {
  const variant = isOn ? ButtonVariant.Primary : ButtonVariant.Secondary;
  return (
    <div className="flex items-center">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={variant}
        icon={toggleIcon}
        loading={isLoading}
        aria-label={toggleAriaLabel}
        onClick={onToggle}
        className="!rounded-r-none"
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={variant}
            icon={<ArrowIcon className="rotate-180" />}
            aria-label={caretAriaLabel}
            className="!w-6 !rounded-l-none !border-l-0 !px-0"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          side="top"
          className="min-w-[18rem]"
        >
          <div className="flex flex-col gap-1 px-1.5 py-1.5">
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="px-2 py-1 uppercase tracking-wide"
            >
              {caretMenuLabel}
            </Typography>
            {devices.length === 0 ? (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="px-2 py-2"
              >
                {emptyLabel}
              </Typography>
            ) : (
              devices.map((device) => {
                const isSelected = device.deviceId === selectedId;
                return (
                  <DropdownMenuItem
                    key={device.deviceId}
                    onClick={() => onSelect(device.deviceId)}
                    aria-label={device.label}
                  >
                    <span className="inline-flex flex-1 items-center gap-2">
                      <span
                        aria-hidden
                        className="flex size-4 shrink-0 items-center justify-center"
                      >
                        {isSelected ? (
                          <VIcon
                            size={IconSize.Size16}
                            className="text-text-primary"
                            secondary
                          />
                        ) : null}
                      </span>
                      <span className="truncate text-left">{device.label}</span>
                    </span>
                  </DropdownMenuItem>
                );
              })
            )}
            {extra ? (
              <div className="border-t border-border-subtlest-tertiary px-2 pt-2">
                {extra}
              </div>
            ) : null}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const LiveRoomControls = ({
  onLeave,
}: LiveRoomControlsProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
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
    joinStage,
    leaveStage,
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
  const isSpeaker = role === 'speaker';
  const isModerated = roomState?.mode === 'moderated';
  const isFreeForAll = roomState?.mode === 'free_for_all';
  const isQueued =
    !!participantId &&
    !!roomState?.stage.speakerQueueParticipantIds.includes(participantId);
  const speakerLimit = roomState?.stage.speakerLimit ?? null;
  const activeSpeakerCount =
    roomState?.stage.activeSpeakerParticipantIds.length ?? 0;
  const isStageFull =
    isFreeForAll &&
    roomState?.status === 'live' &&
    speakerLimit !== null &&
    activeSpeakerCount >= speakerLimit;
  const canJoinQueue =
    isModerated &&
    isAudience &&
    roomState?.status === 'live' &&
    !isQueued &&
    !busy;
  const canJoinStage =
    isFreeForAll &&
    isAudience &&
    roomState?.status === 'live' &&
    !isStageFull &&
    !busy;
  const canLeaveStage =
    isFreeForAll && isSpeaker && roomState?.status === 'live' && !busy;
  const showGoLive = isHost && roomState?.status === 'created';

  const previewSuffix = (active: boolean, publishing: boolean) =>
    active && !publishing ? ' (preview)' : '';

  const promptSignup = (): void => {
    showLogin({ trigger: AuthTriggers.MainButton });
  };

  const handleReactionsToggle = (): void => {
    if (!user) {
      promptSignup();
      return;
    }

    setReactionsOpen((open) => !open);
  };

  const handleReaction = (emoji: string): void => {
    if (!user) {
      promptSignup();
      return;
    }

    guarded(`reaction-${emoji}`, () => sendReaction(emoji));
  };

  const handleCustomReaction = (emoji: string): void => {
    if (!user) {
      promptSignup();
      return;
    }

    guarded('reaction-custom', () => sendReaction(emoji));
  };

  const handleJoinQueue = (): void => {
    if (!user) {
      promptSignup();
      return;
    }

    guarded('queue', joinSpeakerQueue);
  };

  const handleJoinStage = (): void => {
    if (!user) {
      promptSignup();
      return;
    }

    guarded('join-stage', joinStage);
  };

  const handleLeaveStage = (): void => {
    guarded('leave-stage', leaveStage);
  };

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
                onClick={() => handleReaction(emoji)}
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

                handleCustomReaction(emoji);
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

        <div className="flex items-center gap-2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-2 backdrop-blur">
          {canPublish ? (
            <ControlGroup>
              <DeviceSplitButton
                isOn={isMicOn}
                isLoading={busy === 'mic'}
                toggleAriaLabel={`Mic ${isMicOn ? 'on' : 'off'}${previewSuffix(
                  isMicOn,
                  isMicPublishing,
                )}`}
                caretAriaLabel="Microphone devices"
                caretMenuLabel="Microphone"
                toggleIcon={isMicOn ? <MegaphoneIcon /> : <VolumeOffIcon />}
                onToggle={() => guarded('mic', toggleMic)}
                devices={microphones}
                selectedId={selectedMicId}
                onSelect={(id) => {
                  selectMic(id).catch((err: unknown) =>
                    displayToast(
                      err instanceof Error
                        ? err.message
                        : 'Failed to switch mic',
                    ),
                  );
                }}
                emptyLabel="No microphones"
                extra={
                  localAudioStream ? (
                    <div className="flex items-center gap-2">
                      <Typography
                        type={TypographyType.Caption2}
                        color={TypographyColor.Tertiary}
                      >
                        Input
                      </Typography>
                      <LiveRoomMicLevel stream={localAudioStream} />
                    </div>
                  ) : null
                }
              />
              <DeviceSplitButton
                isOn={isCameraOn}
                isLoading={busy === 'camera'}
                toggleAriaLabel={`Camera ${
                  isCameraOn ? 'on' : 'off'
                }${previewSuffix(isCameraOn, isCameraPublishing)}`}
                caretAriaLabel="Camera devices"
                caretMenuLabel="Camera"
                toggleIcon={<CameraIcon secondary={isCameraOn} />}
                onToggle={() => guarded('camera', toggleCamera)}
                devices={cameras}
                selectedId={selectedCameraId}
                onSelect={(id) => {
                  selectCamera(id).catch((err: unknown) =>
                    displayToast(
                      err instanceof Error
                        ? err.message
                        : 'Failed to switch camera',
                    ),
                  );
                }}
                emptyLabel="No cameras"
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
              onClick={handleReactionsToggle}
            >
              <span className="text-base leading-none">😀</span>
            </Button>
            {isModerated && isAudience ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  isQueued ? ButtonVariant.Secondary : ButtonVariant.Primary
                }
                icon={<MegaphoneIcon />}
                loading={busy === 'queue'}
                disabled={!canJoinQueue}
                onClick={handleJoinQueue}
              >
                {isQueued ? 'Queued' : 'Join queue'}
              </Button>
            ) : null}
            {isFreeForAll && isAudience ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={
                  isStageFull ? ButtonVariant.Secondary : ButtonVariant.Primary
                }
                icon={<MegaphoneIcon />}
                loading={busy === 'join-stage'}
                disabled={!canJoinStage}
                onClick={handleJoinStage}
              >
                {isStageFull ? 'Stage full' : 'Join stage'}
              </Button>
            ) : null}
            {canLeaveStage ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                icon={<PhoneIcon />}
                loading={busy === 'leave-stage'}
                onClick={handleLeaveStage}
              >
                Leave stage
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
