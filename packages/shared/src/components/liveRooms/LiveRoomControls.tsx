import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import {
  CameraIcon,
  MegaphoneIcon,
  PhoneIcon,
  PlusIcon,
  SettingsIcon,
} from '../icons';
import { IconSize } from '../Icon';
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
import { Modal } from '../modals/common/Modal';
import {
  AUDIO_ONLY_LABEL,
  ControlGroup,
  DeviceSplitButton,
  Divider,
  HIDE_SELF_VIEW_LABEL,
  MIC_SETTING_ITEMS,
  MicSettingRow,
  SelectSettingRow,
  SlashedIcon,
  VIDEO_QUALITY_ITEMS,
  VIDEO_QUALITY_LABEL,
} from './LiveRoomControlPrimitives';

const REACTION_EMOJIS = ['👏', '🔥', '💡', '😂', '🤯'];

interface LiveRoomControlsProps {
  onLeave: () => void;
}

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
  const { displayToast } = useToastNotification();
  const [busyKeys, setBusyKeys] = useState<string[]>([]);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const localAudioTrack = localStream?.getAudioTracks()[0] ?? null;
  const localAudioStream = useMemo(
    () => (localAudioTrack ? new MediaStream([localAudioTrack]) : null),
    [localAudioTrack],
  );

  const isBusy = (key: string): boolean => busyKeys.includes(key);

  const guarded = async (
    key: string,
    action: () => Promise<void>,
  ): Promise<void> => {
    if (isBusy(key)) {
      return;
    }

    setBusyKeys((current) => [...current, key]);
    try {
      await action();
    } catch (error) {
      displayToast(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusyKeys((current) => current.filter((item) => item !== key));
    }
  };

  const promptSignup = (): void => {
    showLogin({ trigger: AuthTriggers.MainButton });
  };

  const runAuthenticatedAction = (
    key: string,
    action: () => Promise<void>,
  ): void => {
    if (!user) {
      promptSignup();
      return;
    }

    guarded(key, action);
  };

  const switchCamera = (deviceId: string): void => {
    selectCamera(deviceId).catch((error: unknown) =>
      displayToast(
        error instanceof Error ? error.message : 'Failed to switch camera',
      ),
    );
  };

  const switchMicrophone = (deviceId: string): void => {
    selectMic(deviceId).catch((error: unknown) =>
      displayToast(
        error instanceof Error ? error.message : 'Failed to switch mic',
      ),
    );
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
    isModerated && isAudience && roomState?.status === 'live' && !isQueued;
  const canJoinStage =
    isFreeForAll && isAudience && roomState?.status === 'live' && !isStageFull;
  const canLeaveStage =
    isFreeForAll && isSpeaker && roomState?.status === 'live';
  const showGoLive = isHost && roomState?.status === 'created';

  const previewSuffix = (active: boolean, publishing: boolean): string =>
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
                loading={isBusy(`reaction-${emoji}`)}
                aria-label={`React ${emoji}`}
                onClick={() =>
                  runAuthenticatedAction(`reaction-${emoji}`, () =>
                    sendReaction(emoji),
                  )
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

                runAuthenticatedAction('reaction-custom', () =>
                  sendReaction(emoji),
                );
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
                  onClick={() => {
                    if (!user) {
                      promptSignup();
                      return;
                    }

                    toggleOpen();
                  }}
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
                toggleIcon={
                  <SlashedIcon icon={<MegaphoneIcon />} slashed={!isMicOn} />
                }
                onToggle={() => guarded('mic', toggleMic)}
                devices={microphones}
                selectedId={selectedMicId}
                onSelect={switchMicrophone}
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
                toggleIcon={
                  <SlashedIcon
                    icon={<CameraIcon secondary={isCameraOn} />}
                    slashed={!isCameraOn}
                  />
                }
                onToggle={() => guarded('camera', toggleCamera)}
                devices={cameras}
                selectedId={selectedCameraId}
                onSelect={switchCamera}
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
              onClick={() => {
                if (!user) {
                  promptSignup();
                  return;
                }

                setReactionsOpen((open) => !open);
              }}
            >
              <span className="text-base leading-none">😀</span>
            </Button>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={
                isSettingsOpen ? ButtonVariant.Primary : ButtonVariant.Secondary
              }
              icon={<SettingsIcon />}
              aria-label="Standup settings"
              aria-expanded={isSettingsOpen}
              onClick={() => setIsSettingsOpen(true)}
            />
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
                onClick={() =>
                  runAuthenticatedAction('queue', joinSpeakerQueue)
                }
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
                onClick={() => runAuthenticatedAction('join-stage', joinStage)}
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
                onClick={() => guarded('leave-stage', leaveStage)}
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
                End standup
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
      {isSettingsOpen ? (
        <Modal
          isOpen
          kind={Modal.Kind.FixedCenter}
          size={Modal.Size.Small}
          isDrawerOnMobile
          onRequestClose={() => setIsSettingsOpen(false)}
        >
          <Modal.Header title="Standup settings" />
          <Modal.Body className="gap-1">
            <SelectSettingRow
              label={VIDEO_QUALITY_LABEL}
              description="Choose how aggressively remote video should use your connection."
              value={videoSettings.quality}
              options={VIDEO_QUALITY_ITEMS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              onSelect={(quality) => setVideoSetting('quality', quality)}
            />
            <MicSettingRow
              id="live-room-video-setting-audio-only"
              label={AUDIO_ONLY_LABEL}
              description="Hide remote video and keep the standup playing through audio."
              checked={videoSettings.audioOnly}
              onToggle={() =>
                setVideoSetting('audioOnly', !videoSettings.audioOnly)
              }
            />
          </Modal.Body>
        </Modal>
      ) : null}
    </div>
  );
};
