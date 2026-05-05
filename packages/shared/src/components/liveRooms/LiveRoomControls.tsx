import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import {
  CameraIcon,
  ExitIcon,
  MegaphoneIcon,
  PlusIcon,
  SettingsIcon,
} from '../icons';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { IconSize } from '../Icon';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useLogContext } from '../../contexts/LogContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Tooltip } from '../tooltip/Tooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import { AuthTriggers } from '../../lib/auth';
import { buildStandupAnalyticsExtra } from '../../lib/liveRoom/analytics';
import { getLiveRoomPrivilegeState } from '../../lib/liveRoom/privileges';
import { LIVE_ROOM_QUICK_REACTION_EMOJIS } from '../../lib/liveRoom/reactions';
import { LogEvent } from '../../lib/log';
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

interface LiveRoomControlsProps {
  roomId: string;
  onLeave: () => void;
}

const TooltipButton = ({
  tooltip,
  children,
  wrapDisabled = false,
}: {
  tooltip: string;
  children: ReactElement;
  wrapDisabled?: boolean;
}): ReactElement => {
  if (wrapDisabled) {
    return (
      <Tooltip content={tooltip}>
        <span className="inline-flex">{children}</span>
      </Tooltip>
    );
  }

  return <Tooltip content={tooltip}>{children}</Tooltip>;
};

export const LiveRoomControls = ({
  roomId,
  onLeave,
}: LiveRoomControlsProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
  const { logEvent } = useLogContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const {
    status,
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
    raiseHand,
    removeHand,
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
  const privilegeState = getLiveRoomPrivilegeState(
    roomState,
    participantId,
    role,
  );

  const localAudioTrack = localStream?.getAudioTracks()[0] ?? null;
  const localAudioStream = useMemo(
    () => (localAudioTrack ? new MediaStream([localAudioTrack]) : null),
    [localAudioTrack],
  );
  const buildStandupExtra = (extra: Record<string, unknown> = {}): string =>
    buildStandupAnalyticsExtra(
      {
        roomId,
        authKind: user ? 'authenticated' : 'anonymous',
        role,
        roomStatus: roomState?.status ?? null,
        roomMode: roomState?.mode ?? null,
        connectionStatus: status,
        participantId,
        isCoHost: privilegeState.isCoHost,
        hasLocalAudioTrack: !!localStream?.getAudioTracks()[0],
        hasLocalVideoTrack: !!localStream?.getVideoTracks()[0],
        videoQuality: videoSettings.quality,
        audioOnly: videoSettings.audioOnly,
        hideSelfView: videoSettings.hideSelfView,
      },
      extra,
    );
  const logStandupAction = (
    eventName: LogEvent,
    targetId: string,
    extra: Record<string, unknown> = {},
  ): void => {
    logEvent({
      event_name: eventName,
      target_id: targetId,
      extra: buildStandupExtra(extra),
    });
  };

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
    selectCamera(deviceId)
      .then(() => {
        logStandupAction(LogEvent.ChangeStandupSettings, 'selected_camera', {
          surface: 'controls',
          value: deviceId,
        });
      })
      .catch((error: unknown) =>
        displayToast(
          error instanceof Error ? error.message : 'Failed to switch camera',
        ),
      );
  };

  const switchMicrophone = (deviceId: string): void => {
    selectMic(deviceId)
      .then(() => {
        logStandupAction(LogEvent.ChangeStandupSettings, 'selected_mic', {
          surface: 'controls',
          value: deviceId,
        });
      })
      .catch((error: unknown) =>
        displayToast(
          error instanceof Error ? error.message : 'Failed to switch mic',
        ),
      );
  };

  const isAudience = role === 'audience';
  const isSpeaker = role === 'speaker';
  const isLive = roomState?.status === 'live';
  const isModerated = roomState?.mode === 'moderated';
  const isFreeForAll = roomState?.mode === 'free_for_all';
  const isQueued =
    !!participantId &&
    !!roomState?.stage.speakerQueueParticipantIds.includes(participantId);
  const raisedHandParticipantIds =
    roomState?.stage.raisedHandParticipantIds ?? [];
  const isHandRaised =
    !!participantId && raisedHandParticipantIds.includes(participantId);
  const handQueuePosition = participantId
    ? raisedHandParticipantIds.indexOf(participantId) + 1
    : 0;
  const nextHandQueuePosition = raisedHandParticipantIds.length + 1;
  const speakerLimit = roomState?.stage.speakerLimit ?? null;
  const activeSpeakerCount =
    roomState?.stage.activeSpeakerParticipantIds.length ?? 0;
  const isStageFull =
    isFreeForAll &&
    isLive &&
    speakerLimit !== null &&
    activeSpeakerCount >= speakerLimit;
  const canJoinQueue = isModerated && isAudience && isLive && !isQueued;
  const canJoinStage = isFreeForAll && isAudience && isLive && !isStageFull;
  const canLeaveStage = isFreeForAll && isSpeaker && isLive;
  const canRaiseHand =
    isLive && (isSpeaker || privilegeState.hasHostPrivileges);
  const showGoLive = privilegeState.isHost && roomState?.status === 'created';
  const showMediaControls = canPublish && isLive;
  const showLiveInteractionControls = isLive;

  const previewSuffix = (active: boolean, publishing: boolean): string =>
    active && !publishing ? ' (preview)' : '';
  const reactionTooltip = reactionsOpen ? 'Close reactions' : 'Reactions';
  const settingsTooltip = 'Settings';
  const queueTooltip = isQueued ? 'Waiting to speak' : 'Ask to speak';
  const joinStageTooltip = isStageFull ? 'Speakers full' : 'Join as speaker';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2 px-1.5 tablet:bottom-6">
      <div className="pointer-events-auto relative mx-auto flex w-full max-w-[42rem] flex-col items-center gap-1.5 tablet:gap-2">
        {reactionsOpen && isLive ? (
          <div className="flex items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-1.5 shadow-2">
            {LIVE_ROOM_QUICK_REACTION_EMOJIS.map((emoji) => (
              <TooltipButton key={emoji} tooltip={`React ${emoji}`}>
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Float}
                  loading={isBusy(`reaction-${emoji}`)}
                  aria-label={`React ${emoji}`}
                  onClick={() =>
                    runAuthenticatedAction(`reaction-${emoji}`, async () => {
                      await sendReaction(emoji);
                      logStandupAction(LogEvent.SendStandupReaction, emoji, {
                        surface: 'controls',
                      });
                    })
                  }
                >
                  <span className="text-lg leading-none">{emoji}</span>
                </Button>
              </TooltipButton>
            ))}
            <EmojiPicker
              value=""
              label={null}
              onChange={(emoji) => {
                if (!emoji) {
                  return;
                }

                runAuthenticatedAction('reaction-custom', async () => {
                  await sendReaction(emoji);
                  logStandupAction(LogEvent.SendStandupReaction, emoji, {
                    surface: 'controls',
                  });
                });
              }}
              renderTrigger={({ isOpen, toggleOpen }) => (
                <TooltipButton
                  tooltip="Custom reaction"
                  wrapDisabled={isBusy('reaction-custom')}
                >
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={
                      isOpen ? ButtonVariant.Primary : ButtonVariant.Float
                    }
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
                </TooltipButton>
              )}
            />
          </div>
        ) : null}

        <div className="flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1 shadow-2 backdrop-blur tablet:gap-2 tablet:rounded-16 tablet:p-1.5">
          {showMediaControls ? (
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
                onToggle={() =>
                  guarded('mic', async () => {
                    await toggleMic();
                    logStandupAction(LogEvent.ChangeStandupSettings, 'mic', {
                      surface: 'controls',
                      value: !isMicOn,
                    });
                  })
                }
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
                            guarded(`mic-setting-${item.key}`, async () => {
                              const nextValue = !micSettings[item.key];
                              await setMicSetting(item.key, nextValue);
                              logStandupAction(
                                LogEvent.ChangeStandupSettings,
                                item.key,
                                {
                                  surface: 'controls',
                                  value: nextValue,
                                },
                              );
                            });
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
                onToggle={() =>
                  guarded('camera', async () => {
                    await toggleCamera();
                    logStandupAction(LogEvent.ChangeStandupSettings, 'camera', {
                      surface: 'controls',
                      value: !isCameraOn,
                    });
                  })
                }
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
                        const nextValue = !videoSettings.hideSelfView;
                        setVideoSetting('hideSelfView', nextValue);
                        logStandupAction(
                          LogEvent.ChangeStandupSettings,
                          'hide_self_view',
                          {
                            surface: 'controls',
                            value: nextValue,
                          },
                        );
                      })
                    }
                  />
                }
              />
            </ControlGroup>
          ) : null}

          {showMediaControls ? <Divider /> : null}

          {showLiveInteractionControls ? (
            <>
              <ControlGroup>
                <TooltipButton tooltip={reactionTooltip}>
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={
                      reactionsOpen
                        ? ButtonVariant.Primary
                        : ButtonVariant.Secondary
                    }
                    aria-label="Reactions"
                    aria-expanded={reactionsOpen}
                    onClick={() => {
                      if (!user) {
                        promptSignup();
                        return;
                      }

                      setReactionsOpen((open) => {
                        const nextOpen = !open;
                        if (nextOpen) {
                          logStandupAction(
                            LogEvent.OpenStandupReactions,
                            'reactions',
                            { surface: 'controls' },
                          );
                        }
                        return nextOpen;
                      });
                    }}
                  >
                    <span className="text-base leading-none">😀</span>
                  </Button>
                </TooltipButton>
                {canRaiseHand ? (
                  <TooltipButton
                    tooltip={isHandRaised ? 'Lower hand' : 'Raise hand'}
                    wrapDisabled={isBusy('hand')}
                  >
                    <Button
                      type="button"
                      size={ButtonSize.Small}
                      variant={
                        isHandRaised
                          ? ButtonVariant.Primary
                          : ButtonVariant.Secondary
                      }
                      icon={<RaiseHandIcon secondary={isHandRaised} />}
                      loading={isBusy('hand')}
                      disabled={isBusy('hand')}
                      aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}
                      onClick={() =>
                        guarded('hand', async () => {
                          if (isHandRaised) {
                            await removeHand();
                            logStandupAction(
                              LogEvent.RemoveStandupHand,
                              roomId,
                              {
                                surface: 'controls',
                                handQueuePosition,
                                raisedHandCount: Math.max(
                                  raisedHandParticipantIds.length - 1,
                                  0,
                                ),
                              },
                            );
                            return;
                          }

                          await raiseHand();
                          logStandupAction(LogEvent.RaiseStandupHand, roomId, {
                            surface: 'controls',
                            handQueuePosition: nextHandQueuePosition,
                            raisedHandCount: nextHandQueuePosition,
                          });
                        })
                      }
                    />
                  </TooltipButton>
                ) : null}
                <TooltipButton tooltip={settingsTooltip}>
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={
                      isSettingsOpen
                        ? ButtonVariant.Primary
                        : ButtonVariant.Secondary
                    }
                    icon={<SettingsIcon />}
                    aria-label="Standup settings"
                    aria-expanded={isSettingsOpen}
                    onClick={() => {
                      logStandupAction(
                        LogEvent.OpenStandupSettings,
                        'settings',
                        {
                          surface: 'controls',
                        },
                      );
                      setIsSettingsOpen(true);
                    }}
                  />
                </TooltipButton>
                {isModerated && isAudience ? (
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={
                      isQueued ? ButtonVariant.Secondary : ButtonVariant.Primary
                    }
                    loading={isBusy('queue')}
                    disabled={!canJoinQueue || isBusy('queue')}
                    onClick={() =>
                      runAuthenticatedAction('queue', async () => {
                        await joinSpeakerQueue();
                        logStandupAction(LogEvent.JoinStandupQueue, roomId, {
                          surface: 'controls',
                        });
                      })
                    }
                  >
                    {queueTooltip}
                  </Button>
                ) : null}
                {isFreeForAll && isAudience ? (
                  <TooltipButton
                    tooltip={joinStageTooltip}
                    wrapDisabled={!canJoinStage || isBusy('join-stage')}
                  >
                    <Button
                      type="button"
                      size={ButtonSize.Small}
                      variant={
                        isStageFull
                          ? ButtonVariant.Secondary
                          : ButtonVariant.Primary
                      }
                      loading={isBusy('join-stage')}
                      disabled={!canJoinStage || isBusy('join-stage')}
                      onClick={() =>
                        runAuthenticatedAction('join-stage', async () => {
                          await joinStage();
                          logStandupAction(LogEvent.JoinStandupStage, roomId, {
                            surface: 'controls',
                          });
                        })
                      }
                    >
                      {joinStageTooltip}
                    </Button>
                  </TooltipButton>
                ) : null}
                {canLeaveStage ? (
                  <TooltipButton
                    tooltip="Stop speaking"
                    wrapDisabled={isBusy('leave-stage')}
                  >
                    <Button
                      type="button"
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Secondary}
                      loading={isBusy('leave-stage')}
                      onClick={() =>
                        guarded('leave-stage', async () => {
                          await leaveStage();
                          logStandupAction(LogEvent.LeaveStandupStage, roomId, {
                            surface: 'controls',
                          });
                        })
                      }
                    >
                      Stop speaking
                    </Button>
                  </TooltipButton>
                ) : null}
              </ControlGroup>

              <Divider />
            </>
          ) : null}

          <ControlGroup>
            {showGoLive ? (
              <TooltipButton tooltip="Go live" wrapDisabled={isBusy('go-live')}>
                <Button
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Primary}
                  className="live-room-go-live-button !border-transparent"
                  loading={isBusy('go-live')}
                  onClick={() =>
                    guarded('go-live', async () => {
                      await startRoom();
                      logStandupAction(LogEvent.StartStandup, roomId, {
                        surface: 'controls',
                      });
                    })
                  }
                >
                  Go live
                </Button>
              </TooltipButton>
            ) : null}
            {privilegeState.hasHostPrivileges ? (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Ketchup}
                loading={isBusy('end')}
                icon={isTablet ? undefined : <ExitIcon />}
                aria-label="End standup"
                onClick={() =>
                  guarded('end', async () => {
                    await endRoom();
                    logStandupAction(LogEvent.EndStandup, roomId, {
                      surface: 'controls',
                    });
                    onLeave();
                  })
                }
              >
                {isTablet ? 'End standup' : null}
              </Button>
            ) : (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                color={ButtonColor.Ketchup}
                icon={isTablet ? undefined : <ExitIcon />}
                aria-label="Leave"
                onClick={() => {
                  logStandupAction(LogEvent.LeaveStandup, roomId, {
                    surface: 'controls',
                  });
                  onLeave();
                }}
              >
                {isTablet ? 'Leave' : null}
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
          drawerProps={{ appendOnRoot: true }}
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
              onSelect={(quality) => {
                setVideoSetting('quality', quality);
                logStandupAction(
                  LogEvent.ChangeStandupSettings,
                  'video_quality',
                  {
                    surface: 'settings_modal',
                    value: quality,
                  },
                );
              }}
            />
            <MicSettingRow
              id="live-room-video-setting-audio-only"
              label={AUDIO_ONLY_LABEL}
              description="Hide remote video and keep the standup playing through audio."
              checked={videoSettings.audioOnly}
              onToggle={() => {
                const nextValue = !videoSettings.audioOnly;
                setVideoSetting('audioOnly', nextValue);
                logStandupAction(LogEvent.ChangeStandupSettings, 'audio_only', {
                  surface: 'settings_modal',
                  value: nextValue,
                });
              }}
            />
          </Modal.Body>
        </Modal>
      ) : null}
    </div>
  );
};
