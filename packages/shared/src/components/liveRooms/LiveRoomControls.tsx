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
import type {
  LiveRoomDeviceInfo,
  LiveRoomMicSettings,
} from '../../contexts/LiveRoomContext';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';

const REACTION_EMOJIS = ['👏', '🔥', '💡', '😂', '🤯'];
const HIDE_SELF_VIEW_LABEL = 'Hide my preview';

const MIC_SETTING_ITEMS: {
  key: keyof LiveRoomMicSettings;
  label: string;
  description: string;
}[] = [
  {
    key: 'noiseSuppression',
    label: 'Reduce background noise',
    description: 'Cut steady background sounds from your mic.',
  },
  {
    key: 'echoCancellation',
    label: 'Prevent speaker echo',
    description: 'Reduce echo when your speakers leak back into the mic.',
  },
  {
    key: 'autoGainControl',
    label: 'Keep my volume steady',
    description: 'Automatically balance quiet and loud moments.',
  },
];

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

interface MicSettingRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const MicSettingRow = ({
  id,
  label,
  description,
  checked,
  disabled,
  onToggle,
}: MicSettingRowProps): ReactElement => (
  <div className="flex items-start justify-between gap-3 rounded-12 px-2 py-2">
    <div className="min-w-0 flex-1">
      <Typography type={TypographyType.Footnote} bold>
        {label}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <Switch
      inputId={id}
      name={id}
      checked={checked}
      disabled={disabled}
      onToggle={onToggle}
      aria-label={label}
      className="shrink-0"
    />
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
    micSettings,
    micSettingSupport,
    setMicSetting,
    videoSettings,
    setVideoSetting,
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
  const [busyKeys, setBusyKeys] = useState<string[]>([]);
  const [reactionsOpen, setReactionsOpen] = useState(false);

  const isBusy = (key: string): boolean => busyKeys.includes(key);

  const guarded = async (
    key: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    if (isBusy(key)) {
      return;
    }
    setBusyKeys((current) => [...current, key]);
    try {
      await fn();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyKeys((current) => current.filter((item) => item !== key));
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
    !isQueued;
  const canJoinStage =
    isFreeForAll &&
    isAudience &&
    roomState?.status === 'live' &&
    !isStageFull;
  const canLeaveStage = isFreeForAll && isSpeaker && roomState?.status === 'live';
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
                loading={isBusy(`reaction-${emoji}`)}
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
                  disabled={isBusy('reaction-custom')}
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
                isLoading={isBusy('mic')}
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
                  <div className="flex flex-col gap-3">
                    {localAudioStream ? (
                      <div className="flex items-center gap-2">
                        <Typography
                          type={TypographyType.Caption2}
                          color={TypographyColor.Tertiary}
                        >
                          Input
                        </Typography>
                        <LiveRoomMicLevel stream={localAudioStream} />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-1">
                      {MIC_SETTING_ITEMS.map((item) => (
                        <MicSettingRow
                          key={item.key}
                          id={`live-room-mic-setting-${item.key}`}
                          label={item.label}
                          description={
                            micSettingSupport[item.key]
                              ? item.description
                              : 'Not available in this browser.'
                          }
                          checked={micSettings[item.key]}
                          disabled={
                            !micSettingSupport[item.key] ||
                            isBusy(`mic-setting-${item.key}`)
                          }
                          onToggle={() => {
                            guarded(`mic-setting-${item.key}`, () =>
                              setMicSetting(item.key, !micSettings[item.key]),
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                }
              />
              <DeviceSplitButton
                isOn={isCameraOn}
                isLoading={isBusy('camera')}
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
                extra={
                  <MicSettingRow
                    id="live-room-video-setting-hide-self-view"
                    label={HIDE_SELF_VIEW_LABEL}
                    description="Hide your own tile while keeping your camera live."
                    checked={videoSettings.hideSelfView}
                    disabled={isBusy('hide-self-view')}
                    onToggle={() =>
                      guarded('hide-self-view', async () => {
                        setVideoSetting(
                          'hideSelfView',
                          !videoSettings.hideSelfView,
                        );
                      })
                    }
                  />
                }
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
                loading={isBusy('queue')}
                disabled={!canJoinQueue || isBusy('queue')}
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
                loading={isBusy('join-stage')}
                disabled={!canJoinStage || isBusy('join-stage')}
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
                loading={isBusy('leave-stage')}
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
                loading={isBusy('go-live')}
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
                loading={isBusy('end')}
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
