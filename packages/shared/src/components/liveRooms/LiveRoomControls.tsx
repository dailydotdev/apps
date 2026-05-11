import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { CameraIcon, ExitIcon, MicrophoneIcon, SettingsIcon } from '../icons';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { useLiveRoom } from '../../contexts/LiveRoomContext';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LiveRoomMicLevel } from './LiveRoomMicLevel';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import { AuthTriggers } from '../../lib/auth';
import { getLiveRoomPrivilegeState } from '../../lib/liveRoom/privileges';
import { LogEvent } from '../../lib/log';
import { useLiveRoomStandupAnalytics } from '../../hooks/liveRooms/useLiveRoomStandupAnalytics';
import {
  ControlGroup,
  DeviceSplitButton,
  Divider,
  HIDE_SELF_VIEW_LABEL,
  MIC_SETTING_ITEMS,
  MicSettingRow,
  SlashedIcon,
} from './LiveRoomControlPrimitives';
import { LiveRoomSettingsModal } from './LiveRoomSettingsModal';
import { LiveRoomReactionsToolbar } from './LiveRoomReactionsToolbar';
import { LiveRoomTooltipButton } from './LiveRoomTooltipButton';

interface LiveRoomControlsProps {
  roomId: string;
  onLeave: () => void;
}

export const LiveRoomControls = ({
  roomId,
  onLeave,
}: LiveRoomControlsProps): ReactElement => {
  const { user, showLogin } = useAuthContext();
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
  const { logStandupAction } = useLiveRoomStandupAnalytics({
    roomId,
    user,
    role,
    roomStatus: roomState?.status ?? null,
    roomMode: roomState?.mode ?? null,
    connectionStatus: status,
    participantId,
    isCoHost: privilegeState.isCoHost,
    localStream,
    videoSettings,
  });

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
  const canLeaveStage = isSpeaker && isLive;
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
          <LiveRoomReactionsToolbar
            isBusy={isBusy}
            isAuthenticated={!!user}
            onRequestLogin={promptSignup}
            onSendReaction={(key, emoji) =>
              runAuthenticatedAction(key, async () => {
                await sendReaction(emoji);
                logStandupAction(LogEvent.SendStandupReaction, emoji, {
                  surface: 'controls',
                });
              })
            }
          />
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
                  <SlashedIcon icon={<MicrophoneIcon />} slashed={!isMicOn} />
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
                <LiveRoomTooltipButton tooltip={reactionTooltip}>
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
                </LiveRoomTooltipButton>
                {canRaiseHand ? (
                  <LiveRoomTooltipButton
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
                  </LiveRoomTooltipButton>
                ) : null}
                <LiveRoomTooltipButton tooltip={settingsTooltip}>
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
                </LiveRoomTooltipButton>
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
                  <LiveRoomTooltipButton
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
                  </LiveRoomTooltipButton>
                ) : null}
                {canLeaveStage ? (
                  <LiveRoomTooltipButton
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
                  </LiveRoomTooltipButton>
                ) : null}
              </ControlGroup>

              <Divider />
            </>
          ) : null}

          <ControlGroup>
            {showGoLive ? (
              <LiveRoomTooltipButton
                tooltip="Go live"
                wrapDisabled={isBusy('go-live')}
              >
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
              </LiveRoomTooltipButton>
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
        <LiveRoomSettingsModal
          videoSettings={videoSettings}
          setVideoSetting={setVideoSetting}
          onClose={() => setIsSettingsOpen(false)}
          onTrackSettingChange={(targetId, surface, value) => {
            logStandupAction(LogEvent.ChangeStandupSettings, targetId, {
              surface,
              value,
            });
          }}
        />
      ) : null}
    </div>
  );
};
