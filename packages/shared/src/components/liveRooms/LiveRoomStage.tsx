import type { Dispatch, ReactElement, SetStateAction } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { UserIcon } from '../icons';
import { IconSize } from '../Icon';
import type { LiveRoom as LiveRoomModel } from '../../graphql/liveRooms';
import type { UserShortProfile } from '../../lib/user';
import { LiveRoomControls } from './LiveRoomControls';
import { LiveRoomLobbyContent } from './LiveRoomLobbyContent';
import { LiveRoomVideoTile } from './LiveRoomVideoTile';

export interface LiveRoomStageSpeaker {
  id: string;
  profile: UserShortProfile;
  stream: MediaStream | null;
  selfView: boolean;
  isHost: boolean;
  isCoHost: boolean;
  raisedHandQueuePosition?: number;
  isMuted: boolean;
}

interface LiveRoomStageProps {
  room: LiveRoomModel;
  roomId: string;
  isCreated: boolean;
  isEnded: boolean;
  stagePageCount: number;
  clampedStagePage: number;
  setStagePage: Dispatch<SetStateAction<number>>;
  stageGridColumnCount: number;
  stageGridRowCount: number;
  speakers: LiveRoomStageSpeaker[];
  focusedSpeakerIndex: number | null;
  waitingPrompt: string;
  hasHostPrivileges: boolean;
  isHost: boolean;
  moderationBusy: string | null;
  onFocusSpeaker: (index: number) => void;
  onUnfocusSpeaker: () => void;
  onSpeakerFocusNavigate: (delta: 1 | -1) => void;
  guardedModerationAction: (
    key: string,
    action: () => Promise<void>,
  ) => Promise<void>;
  onGrantCoHost: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onRevokeCoHost: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onRemoveSpeaker: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onKickParticipant: (
    targetParticipantId: string,
    surface: string,
  ) => Promise<void>;
  onNavigateBack: (surface: string) => void;
  showControls: boolean;
  onLeave: () => void;
}

export const LiveRoomStage = ({
  room,
  roomId,
  isCreated,
  isEnded,
  stagePageCount,
  clampedStagePage,
  setStagePage,
  stageGridColumnCount,
  stageGridRowCount,
  speakers,
  focusedSpeakerIndex,
  waitingPrompt,
  hasHostPrivileges,
  isHost,
  moderationBusy,
  onFocusSpeaker,
  onUnfocusSpeaker,
  onSpeakerFocusNavigate,
  guardedModerationAction,
  onGrantCoHost,
  onRevokeCoHost,
  onRemoveSpeaker,
  onKickParticipant,
  onNavigateBack,
  showControls,
  onLeave,
}: LiveRoomStageProps): ReactElement => (
  <section aria-label="Speakers" className="relative flex min-h-0 flex-col">
    {!isCreated && stagePageCount > 1 ? (
      <div className="flex items-center justify-end gap-2 px-1.5 pb-3">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Page {clampedStagePage + 1} / {stagePageCount}
        </Typography>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          disabled={clampedStagePage === 0}
          onClick={() =>
            setStagePage((currentPage) => Math.max(0, currentPage - 1))
          }
        >
          Prev
        </Button>
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          disabled={clampedStagePage >= stagePageCount - 1}
          onClick={() =>
            setStagePage((currentPage) =>
              Math.min(stagePageCount - 1, currentPage + 1),
            )
          }
        >
          Next
        </Button>
      </div>
    ) : null}
    {isCreated ? <LiveRoomLobbyContent room={room} /> : null}
    {!isCreated && speakers.length > 0 ? (
      <div
        className="grid min-h-0 flex-1 gap-3 overflow-hidden p-1.5 pb-24 tablet:pb-28"
        style={{
          gridTemplateColumns: `repeat(${stageGridColumnCount}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${stageGridRowCount}, minmax(0, 1fr))`,
        }}
      >
        {speakers.map((speaker, index) => {
          const canModerate = hasHostPrivileges && !speaker.isHost;
          const canManageCoHosts = isHost && !speaker.isHost;

          return (
            <div
              key={speaker.id}
              className="flex min-h-0 min-w-0 items-center justify-center"
            >
              <LiveRoomVideoTile
                stream={speaker.stream}
                user={speaker.profile}
                selfView={speaker.selfView}
                isHost={speaker.isHost}
                isCoHost={speaker.isCoHost}
                raisedHandQueuePosition={speaker.raisedHandQueuePosition}
                isMuted={speaker.isMuted}
                isFocused={focusedSpeakerIndex === index}
                onFocus={() => onFocusSpeaker(index)}
                onUnfocus={onUnfocusSpeaker}
                onSwipeNext={() => onSpeakerFocusNavigate(1)}
                onSwipePrev={() => onSpeakerFocusNavigate(-1)}
                onGrantCoHost={
                  canManageCoHosts && !speaker.isCoHost
                    ? () =>
                        guardedModerationAction(
                          `tile-grant-cohost-${speaker.id}`,
                          () => onGrantCoHost(speaker.id, 'stage_tile'),
                        )
                    : undefined
                }
                onRevokeCoHost={
                  canManageCoHosts && speaker.isCoHost
                    ? () =>
                        guardedModerationAction(
                          `tile-revoke-cohost-${speaker.id}`,
                          () => onRevokeCoHost(speaker.id, 'stage_tile'),
                        )
                    : undefined
                }
                onRemoveSpeaker={
                  canModerate
                    ? () =>
                        guardedModerationAction(
                          `tile-remove-${speaker.id}`,
                          () => onRemoveSpeaker(speaker.id, 'stage_tile'),
                        )
                    : undefined
                }
                onKick={
                  canModerate
                    ? () =>
                        guardedModerationAction(`tile-kick-${speaker.id}`, () =>
                          onKickParticipant(speaker.id, 'stage_tile'),
                        )
                    : undefined
                }
                isRemoving={moderationBusy === `tile-remove-${speaker.id}`}
                isGrantingCoHost={
                  moderationBusy === `tile-grant-cohost-${speaker.id}`
                }
                isRevokingCoHost={
                  moderationBusy === `tile-revoke-cohost-${speaker.id}`
                }
                isKicking={moderationBusy === `tile-kick-${speaker.id}`}
                moderationDisabled={!!moderationBusy}
              />
            </div>
          );
        })}
      </div>
    ) : null}
    {!isCreated && speakers.length === 0 ? (
      <div className="flex flex-1 items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
            <UserIcon size={IconSize.Small} />
          </span>
          <Typography type={TypographyType.Footnote} bold>
            No visible speakers
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {waitingPrompt}
          </Typography>
        </div>
      </div>
    ) : null}

    {isEnded ? (
      <div className="absolute inset-0 flex items-center justify-center bg-background-default p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Typography type={TypographyType.Title3} bold>
            This standup has ended
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Thanks for joining — catch the next one soon.
          </Typography>
          <Button
            className="mt-2"
            variant={ButtonVariant.Primary}
            onClick={() => onNavigateBack('ended_state')}
          >
            Back home
          </Button>
        </div>
      </div>
    ) : null}

    {showControls && !isEnded ? (
      <LiveRoomControls roomId={roomId} onLeave={onLeave} />
    ) : null}
  </section>
);
