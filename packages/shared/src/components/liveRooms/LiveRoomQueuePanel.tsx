import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Tooltip } from '../tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  BlockIcon,
  PlusUserIcon,
  RemoveUserIcon,
  ShieldCheckIcon as ShieldCheckActionIcon,
  ShieldIcon as ShieldActionIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import type {
  LiveRoomModeValue,
  LiveRoomParticipantRecord,
} from '../../lib/liveRoom/protocol';
import type { UserShortProfile } from '../../lib/user';
import { anchorDefaultRel } from '../../lib/strings';
import {
  buildParticipantProfile,
  userDisplayName,
} from './liveRoomParticipants';
import type { LiveRoomSidePanelTab } from './LiveRoomSidePanelTabs';

interface StageParticipantItemProps {
  participantId: string;
  profile?: UserShortProfile;
  subtitle?: string;
  badgeLabel?: string;
  leading?: ReactNode;
  actions?: ReactNode;
}

const StageParticipantItem = ({
  participantId,
  profile,
  subtitle,
  badgeLabel,
  leading,
  actions,
}: StageParticipantItemProps): ReactElement => {
  const user = profile ?? buildParticipantProfile(participantId);
  const displayName = userDisplayName(user);
  const profilePermalink = profile?.permalink;
  const avatar = profilePermalink ? (
    <ProfileTooltip userId={profile.id} initialUser={profile}>
      <a
        href={profilePermalink}
        target="_blank"
        rel={anchorDefaultRel}
        aria-label={`Open ${displayName} profile`}
        className="shrink-0"
      >
        <ProfilePicture user={user} size={ProfileImageSize.Small} />
      </a>
    </ProfileTooltip>
  ) : (
    <ProfilePicture user={user} size={ProfileImageSize.Small} />
  );
  const name = profilePermalink ? (
    <ProfileTooltip userId={profile.id} initialUser={profile}>
      <a
        href={profilePermalink}
        target="_blank"
        rel={anchorDefaultRel}
        className="min-w-0"
      >
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          bold
          truncate
          className="hover:underline"
          title={displayName}
        >
          {displayName}
        </Typography>
      </a>
    </ProfileTooltip>
  ) : (
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      bold
      truncate
      title={displayName}
    >
      {displayName}
    </Typography>
  );

  return (
    <li className="flex min-w-0 items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2">
      {leading}
      {avatar}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {name}
          {badgeLabel ? (
            <span className="shrink-0 rounded-6 bg-surface-float px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-accent-water-bolder">
              {badgeLabel}
            </span>
          ) : null}
        </div>
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
  mode: LiveRoomModeValue;
  activeSpeakerParticipantIds: string[];
  queuedParticipantIds: string[];
  audienceParticipantIds: string[];
  participantsById: Record<string, LiveRoomParticipantRecord>;
  participantProfilesById: Map<string, UserShortProfile>;
  coHostParticipantIds: string[];
  canModerate: boolean;
  canManageCoHosts: boolean;
  stageLimit?: number | null;
  moderationBusy: string | null;
  guardedModerationAction: (
    key: string,
    fn: () => Promise<void>,
  ) => Promise<void>;
  grantCoHost: (targetParticipantId: string) => Promise<void>;
  revokeCoHost: (targetParticipantId: string) => Promise<void>;
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
  coHostParticipantIds,
  canModerate,
  canManageCoHosts,
  stageLimit,
  moderationBusy,
  guardedModerationAction,
  grantCoHost,
  revokeCoHost,
  promoteSpeaker,
  removeSpeaker,
  kickParticipant,
}: LiveRoomQueuePanelProps): ReactElement => {
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
                  const profile = participantProfilesById.get(id);
                  const displayProfile = profile ?? buildParticipantProfile(id);
                  const isCoHost = coHostParticipantIds.includes(id);

                  return (
                    <StageParticipantItem
                      key={id}
                      participantId={id}
                      profile={profile}
                      badgeLabel={isCoHost ? 'Co-host' : undefined}
                      actions={
                        canModerate || canManageCoHosts ? (
                          <div className="flex shrink-0 items-center gap-1">
                            {canModerate ? (
                              <Tooltip
                                content={`Remove ${userDisplayName(
                                  displayProfile,
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
                                    displayProfile,
                                  )}`}
                                  onClick={() =>
                                    guardedModerationAction(
                                      `remove-${id}`,
                                      () => removeSpeaker(id),
                                    )
                                  }
                                />
                              </Tooltip>
                            ) : null}
                            {canManageCoHosts ? (
                              <Tooltip
                                content={`${
                                  isCoHost
                                    ? 'Revoke co-host from'
                                    : 'Grant co-host to'
                                } ${userDisplayName(displayProfile)}`}
                              >
                                <Button
                                  type="button"
                                  size={ButtonSize.XSmall}
                                  variant={ButtonVariant.Tertiary}
                                  icon={
                                    isCoHost ? (
                                      <ShieldCheckActionIcon />
                                    ) : (
                                      <ShieldActionIcon />
                                    )
                                  }
                                  loading={
                                    moderationBusy ===
                                    `${
                                      isCoHost ? 'revoke' : 'grant'
                                    }-cohost-${id}`
                                  }
                                  disabled={!!moderationBusy}
                                  aria-label={`${
                                    isCoHost
                                      ? 'Revoke co-host from'
                                      : 'Grant co-host to'
                                  } ${userDisplayName(displayProfile)}`}
                                  onClick={() =>
                                    guardedModerationAction(
                                      `${
                                        isCoHost ? 'revoke' : 'grant'
                                      }-cohost-${id}`,
                                      () =>
                                        isCoHost
                                          ? revokeCoHost(id)
                                          : grantCoHost(id),
                                    )
                                  }
                                />
                              </Tooltip>
                            ) : null}
                            {canModerate ? (
                              <Tooltip
                                content={`Kick ${userDisplayName(
                                  displayProfile,
                                )} from room`}
                              >
                                <Button
                                  type="button"
                                  size={ButtonSize.XSmall}
                                  variant={ButtonVariant.Tertiary}
                                  icon={<BlockIcon />}
                                  loading={moderationBusy === `kick-${id}`}
                                  disabled={!!moderationBusy}
                                  aria-label={`Kick ${userDisplayName(
                                    displayProfile,
                                  )}`}
                                  onClick={() =>
                                    guardedModerationAction(`kick-${id}`, () =>
                                      kickParticipant(id),
                                    )
                                  }
                                />
                              </Tooltip>
                            ) : null}
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

                const profile = participantProfilesById.get(participantId);
                const displayProfile =
                  profile ?? buildParticipantProfile(participantId);
                const isCoHost = coHostParticipantIds.includes(participantId);

                return (
                  <StageParticipantItem
                    key={participantId}
                    participantId={participantId}
                    profile={profile}
                    badgeLabel={isCoHost ? 'Co-host' : undefined}
                    actions={
                      canModerate || canManageCoHosts ? (
                        <div className="flex shrink-0 items-center gap-1">
                          {canModerate &&
                          !isAudienceTab &&
                          mode === 'moderated' ? (
                            <Tooltip
                              content={`Promote ${userDisplayName(
                                displayProfile,
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
                                  displayProfile,
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
                          {canManageCoHosts ? (
                            <Tooltip
                              content={`${
                                isCoHost
                                  ? 'Revoke co-host from'
                                  : 'Grant co-host to'
                              } ${userDisplayName(displayProfile)}`}
                            >
                              <Button
                                type="button"
                                size={ButtonSize.XSmall}
                                variant={ButtonVariant.Tertiary}
                                icon={
                                  isCoHost ? (
                                    <ShieldCheckActionIcon />
                                  ) : (
                                    <ShieldActionIcon />
                                  )
                                }
                                loading={
                                  moderationBusy ===
                                  `${
                                    isCoHost ? 'revoke' : 'grant'
                                  }-cohost-${participantId}`
                                }
                                disabled={!!moderationBusy}
                                aria-label={`${
                                  isCoHost
                                    ? 'Revoke co-host from'
                                    : 'Grant co-host to'
                                } ${userDisplayName(displayProfile)}`}
                                onClick={() =>
                                  guardedModerationAction(
                                    `${
                                      isCoHost ? 'revoke' : 'grant'
                                    }-cohost-${participantId}`,
                                    () =>
                                      isCoHost
                                        ? revokeCoHost(participantId)
                                        : grantCoHost(participantId),
                                  )
                                }
                              />
                            </Tooltip>
                          ) : null}
                          {canModerate ? (
                            <Tooltip
                              content={`Kick ${userDisplayName(
                                displayProfile,
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
                                aria-label={`Kick ${userDisplayName(
                                  displayProfile,
                                )}`}
                                onClick={() =>
                                  guardedModerationAction(
                                    `kick-${participantId}`,
                                    () => kickParticipant(participantId),
                                  )
                                }
                              />
                            </Tooltip>
                          ) : null}
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
