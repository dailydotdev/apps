import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Tooltip } from '../tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { BlockIcon, PlusUserIcon, RemoveUserIcon, UserIcon } from '../icons';
import { IconSize } from '../Icon';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import type { LiveRoomParticipantRecord } from '../../lib/liveRoom/protocol';
import type { UserShortProfile } from '../../lib/user';
import {
  buildParticipantProfile,
  userDisplayName,
} from './liveRoomParticipants';
import type { LiveRoomSidePanelTab } from './LiveRoomSidePanelTabs';

interface StageParticipantItemProps {
  participantId: string;
  profile?: UserShortProfile;
  subtitle?: string;
  leading?: ReactNode;
  actions?: ReactNode;
}

const StageParticipantItem = ({
  participantId,
  profile,
  subtitle,
  leading,
  actions,
}: StageParticipantItemProps): ReactElement => {
  const user = profile ?? buildParticipantProfile(participantId);

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
      {leading}
      <ProfilePicture user={user} size={ProfileImageSize.Small} />
      <div className="min-w-0 flex-1">
        <Typography type={TypographyType.Footnote} bold truncate>
          {userDisplayName(user)}
        </Typography>
        {subtitle ? (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            truncate
          >
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {actions}
    </li>
  );
};

interface LiveRoomQueuePanelProps {
  tab: Extract<LiveRoomSidePanelTab, 'queue' | 'audience'>;
  mode: 'moderated' | 'free_for_all';
  activeSpeakerParticipantIds: string[];
  queuedParticipantIds: string[];
  audienceParticipantIds: string[];
  participantsById: Record<string, LiveRoomParticipantRecord>;
  participantProfilesById: Map<string, UserShortProfile>;
  isHost: boolean;
  stageLimit?: number | null;
  moderationBusy: string | null;
  guardedModerationAction: (
    key: string,
    fn: () => Promise<void>,
  ) => Promise<void>;
  promoteSpeaker: (targetParticipantId: string) => Promise<void>;
  removeSpeaker: (targetParticipantId: string) => Promise<void>;
  kickParticipant: (targetParticipantId: string) => Promise<void>;
}

export const LiveRoomQueuePanel = ({
  tab,
  mode,
  activeSpeakerParticipantIds,
  queuedParticipantIds,
  audienceParticipantIds,
  participantsById,
  participantProfilesById,
  isHost,
  stageLimit,
  moderationBusy,
  guardedModerationAction,
  promoteSpeaker,
  removeSpeaker,
  kickParticipant,
}: LiveRoomQueuePanelProps): ReactElement => {
  const getProfile = (participantId: string): UserShortProfile =>
    participantProfilesById.get(participantId) ??
    buildParticipantProfile(participantId);

  const activeSpeakers = activeSpeakerParticipantIds
    .map((participantId) => participantsById[participantId])
    .filter(
      (participant): participant is LiveRoomParticipantRecord => !!participant,
    );
  const audienceMembers = audienceParticipantIds
    .map((participantId) => participantsById[participantId])
    .filter(
      (participant): participant is LiveRoomParticipantRecord => !!participant,
    );
  const isAudienceTab = tab === 'audience';
  const showStageSection = !isAudienceTab || mode === 'free_for_all';
  const sectionTitle = isAudienceTab ? 'Audience' : 'Queue';
  const sectionCount = isAudienceTab
    ? audienceMembers.length
    : queuedParticipantIds.length;
  const listIds = isAudienceTab ? audienceParticipantIds : queuedParticipantIds;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {showStageSection ? (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Typography type={TypographyType.Footnote} bold>
                On stage
              </Typography>
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
              >
                {stageLimit && mode === 'free_for_all'
                  ? `${activeSpeakers.length}/${stageLimit}`
                  : activeSpeakers.length}
              </Typography>
            </div>
            {activeSpeakers.length === 0 ? (
              <div className="flex items-center gap-3 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-4 text-text-tertiary">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-float">
                  <UserIcon size={IconSize.Small} />
                </span>
                <div className="min-w-0 flex-1">
                  <Typography type={TypographyType.Footnote} bold>
                    No active speakers
                  </Typography>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                  >
                    {mode === 'free_for_all'
                      ? 'Audience members can hop on stage while seats are open.'
                      : 'Promote someone from the queue to bring them on stage.'}
                  </Typography>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {activeSpeakers.map((participant) => {
                  const id = participant.participantId;
                  const profile = getProfile(id);

                  return (
                    <StageParticipantItem
                      key={id}
                      participantId={id}
                      profile={profile}
                      actions={
                        isHost ? (
                          <div className="flex shrink-0 items-center gap-1">
                            <Tooltip
                              content={`Remove ${userDisplayName(
                                profile,
                              )} from stage`}
                            >
                              <Button
                                type="button"
                                size={ButtonSize.XSmall}
                                variant={ButtonVariant.Tertiary}
                                icon={<RemoveUserIcon />}
                                loading={moderationBusy === `remove-${id}`}
                                disabled={!!moderationBusy}
                                aria-label={`Remove ${userDisplayName(
                                  profile,
                                )}`}
                                onClick={() =>
                                  guardedModerationAction(`remove-${id}`, () =>
                                    removeSpeaker(id),
                                  )
                                }
                              />
                            </Tooltip>
                            <Tooltip
                              content={`Kick ${userDisplayName(
                                profile,
                              )} from room`}
                            >
                              <Button
                                type="button"
                                size={ButtonSize.XSmall}
                                variant={ButtonVariant.Tertiary}
                                icon={<BlockIcon />}
                                loading={moderationBusy === `kick-${id}`}
                                disabled={!!moderationBusy}
                                aria-label={`Kick ${userDisplayName(profile)}`}
                                onClick={() =>
                                  guardedModerationAction(`kick-${id}`, () =>
                                    kickParticipant(id),
                                  )
                                }
                              />
                            </Tooltip>
                          </div>
                        ) : null
                      }
                    />
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Typography type={TypographyType.Footnote} bold>
              {sectionTitle}
            </Typography>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {sectionCount}
            </Typography>
          </div>
          {sectionCount === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary p-6 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
                <UserIcon size={IconSize.Small} />
              </span>
              <Typography type={TypographyType.Footnote} bold>
                {isAudienceTab ? 'Audience is quiet' : 'Queue is empty'}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {isAudienceTab
                  ? 'New listeners will show up here until they join the stage.'
                  : 'Audience members can request to speak.'}
              </Typography>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {listIds.map((participantId) => {
                const participant = participantsById[participantId];
                if (!participant) {
                  return null;
                }

                const profile = getProfile(participantId);

                return (
                  <StageParticipantItem
                    key={participantId}
                    participantId={participantId}
                    profile={profile}
                    actions={
                      isHost ? (
                        <div className="flex shrink-0 items-center gap-1">
                          {!isAudienceTab && mode === 'moderated' ? (
                            <Tooltip
                              content={`Promote ${userDisplayName(
                                profile,
                              )} to speaker`}
                            >
                              <Button
                                type="button"
                                size={ButtonSize.XSmall}
                                variant={ButtonVariant.Primary}
                                icon={<PlusUserIcon />}
                                loading={
                                  moderationBusy === `promote-${participantId}`
                                }
                                disabled={!!moderationBusy}
                                aria-label={`Promote ${userDisplayName(
                                  profile,
                                )}`}
                                onClick={() =>
                                  guardedModerationAction(
                                    `promote-${participantId}`,
                                    () => promoteSpeaker(participantId),
                                  )
                                }
                              />
                            </Tooltip>
                          ) : null}
                          <Tooltip
                            content={`Kick ${userDisplayName(
                              profile,
                            )} from room`}
                          >
                            <Button
                              type="button"
                              size={ButtonSize.XSmall}
                              variant={ButtonVariant.Tertiary}
                              icon={<BlockIcon />}
                              loading={
                                moderationBusy === `kick-${participantId}`
                              }
                              disabled={!!moderationBusy}
                              aria-label={`Kick ${userDisplayName(profile)}`}
                              onClick={() =>
                                guardedModerationAction(
                                  `kick-${participantId}`,
                                  () => kickParticipant(participantId),
                                )
                              }
                            />
                          </Tooltip>
                        </div>
                      ) : null
                    }
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
