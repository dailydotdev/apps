import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { useQueries } from '@tanstack/react-query';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Loader } from '../Loader';
import Markdown from '../Markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { LiveRoomVideoTile } from './LiveRoomVideoTile';
import { LiveRoomControls } from './LiveRoomControls';
import {
  LiveRoomProvider,
  type LiveRoomChatEntry,
  useLiveRoom as useLiveRoomConnection,
  type LiveRoomReaction,
  type RemoteMediaStream,
} from '../../contexts/LiveRoomContext';
import type { LiveRoomParticipantRecord } from '../../lib/liveRoom/protocol';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';
import { useLiveRoom as useLiveRoomQuery } from '../../hooks/liveRooms/useLiveRoom';
import { useToastNotification } from '../../hooks/useToastNotification';
import { webappUrl } from '../../lib/constants';
import type { UserShortProfile } from '../../lib/user';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import { Tooltip } from '../tooltip/Tooltip';
import {
  BlockIcon,
  DiscussIcon,
  LockIcon,
  MenuIcon,
  PlusUserIcon,
  RemoveUserIcon,
  TimerIcon,
  TrashIcon,
  UserIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { getUserShortInfo } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';
import RichTextInput, { type RichTextInputRef } from '../fields/RichTextInput';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import { chatMarkdownToHtml } from '../../lib/liveRoom/chatMarkdown';

interface LiveRoomProps {
  roomId: string;
}

type SidePanelTab = 'chat' | 'queue';

const formatStreamDuration = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
};

const useStreamDuration = (isLive: boolean): number => {
  const startedAtRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) {
      startedAtRef.current = null;
      setElapsed(0);
      return undefined;
    }
    if (startedAtRef.current === null) {
      startedAtRef.current = Date.now();
    }
    const tick = () => {
      const start = startedAtRef.current;
      if (start === null) {
        return;
      }
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isLive]);

  return elapsed;
};

const AnimatedCount = ({ value }: { value: number }): ReactElement => (
  <span key={value} className="live-room-count-bump tabular-nums">
    {value}
  </span>
);

const buildParticipantStream = (
  targetParticipantId: string | null | undefined,
  remoteStreams: RemoteMediaStream[],
  localStream: MediaStream | null,
  participantId: string | null,
): MediaStream | null => {
  if (!targetParticipantId) {
    return null;
  }
  if (targetParticipantId === participantId) {
    return localStream;
  }
  const tracks: MediaStreamTrack[] = [];
  remoteStreams
    .filter((entry) => entry.participantId === targetParticipantId)
    .forEach((entry) => {
      entry.stream.getTracks().forEach((track) => tracks.push(track));
    });
  if (tracks.length === 0) {
    return null;
  }
  return new MediaStream(tracks);
};

const participantLabel = (participantId: string): string =>
  `Participant ${participantId.slice(0, 6)}`;

const userDisplayName = (user: Pick<UserShortProfile, 'username'>): string =>
  `@${user.username}`;

const buildParticipantProfile = (participantId: string): UserShortProfile => ({
  id: participantId,
  name: participantLabel(participantId),
  username: participantId,
  image: '',
  createdAt: '',
  reputation: 0,
  permalink: '#',
});

const buildDisplayProfile = (user: UserShortProfile): UserShortProfile => ({
  ...user,
  name: userDisplayName(user),
});

const ReactionOverlay = ({
  reactions,
}: {
  reactions: LiveRoomReaction[];
}): ReactElement | null => {
  if (reactions.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 top-1/4 z-3 overflow-hidden"
      aria-hidden
    >
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="live-room-reaction absolute bottom-0 text-4xl"
          style={
            {
              '--live-room-reaction-left': `${16 + reaction.lane * 16}%`,
              '--live-room-reaction-drift':
                reaction.lane % 2 === 0 ? '-1rem' : '1rem',
            } as React.CSSProperties
          }
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
};

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

interface SidePanelTabsProps {
  active: SidePanelTab;
  secondaryCount: number;
  secondaryLabel: string;
  onChange: (tab: SidePanelTab) => void;
}

const SidePanelTabs = ({
  active,
  secondaryCount,
  secondaryLabel,
  onChange,
}: SidePanelTabsProps): ReactElement => {
  const tabs: { id: SidePanelTab; label: string; count?: number }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'queue', label: secondaryLabel, count: secondaryCount },
  ];
  return (
    <div
      role="tablist"
      aria-label="Live room side panel"
      className="flex items-center gap-1 border-b border-border-subtlest-tertiary p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={classNames(
              'flex flex-1 items-center justify-center gap-2 rounded-10 px-3 py-2 transition-colors typo-callout',
              isActive
                ? 'bg-surface-float font-bold text-text-primary'
                : 'text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={classNames(
                  'rounded-full px-1.5 typo-caption2',
                  isActive
                    ? 'bg-action-upvote-float text-action-upvote-default'
                    : 'bg-surface-float text-text-tertiary',
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

interface LiveRoomChatComposerProps {
  canChat: boolean;
  isLive: boolean;
  isEnded: boolean;
  isLoggedIn: boolean;
  mentionSuggestions: UserShortProfile[];
  onSendMessage: (body: string) => Promise<void>;
  onRequestLogin: () => void;
}

const LiveRoomChatComposer = ({
  canChat,
  isLive,
  isEnded,
  isLoggedIn,
  mentionSuggestions,
  onSendMessage,
  onRequestLogin,
}: LiveRoomChatComposerProps): ReactElement => {
  const inputRef = useRef<RichTextInputRef | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState('');

  let disabledReason = 'The host disabled your chat access.';
  if (!isLoggedIn) {
    disabledReason = 'Sign in to join the chat.';
  } else if (isEnded) {
    disabledReason = 'Chat has ended for this room.';
  } else if (!isLive) {
    disabledReason = 'Chat opens when the room goes live.';
  }

  const handleSubmit = async (body: string): Promise<void> => {
    const trimmed = body.trim();
    if (!trimmed || isSending || !canChat) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(trimmed);
      setDraft('');
      inputRef.current?.setInput('');
      inputRef.current?.clearDraft();
    } finally {
      setIsSending(false);
    }
  };

  if (!canChat) {
    return (
      <div className="border-t border-border-subtlest-tertiary p-2.5">
        <div className="flex flex-col gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-3 py-2.5">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {disabledReason}
          </Typography>
          {!isLoggedIn ? (
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Primary}
              onClick={onRequestLogin}
            >
              Sign in to chat
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border-subtlest-tertiary">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(draft).catch(() => undefined);
        }}
      >
        <RichTextInput
          ref={inputRef}
          className={{
            container: '!rounded-none !bg-transparent',
            input: '!p-2.5',
          }}
          showUserAvatar={false}
          submitCopy="Send"
          isLoading={isSending}
          maxInputLength={1000}
          allowBlockFormatting={false}
          minHeightClassName="min-h-[3rem]"
          mentionSuggestions={mentionSuggestions}
          markdownToHtml={chatMarkdownToHtml}
          enabledCommand={{
            [MarkdownCommand.Upload]: true,
            [MarkdownCommand.Mention]: true,
            [MarkdownCommand.Gif]: true,
          }}
          textareaProps={{
            name: 'chat-message',
            placeholder: 'Write a message',
            rows: 2,
          }}
          onValueUpdate={setDraft}
          onSubmit={(event) =>
            handleSubmit(event.currentTarget.value).catch(() => undefined)
          }
        />
      </form>
    </div>
  );
};

interface LiveRoomChatPanelProps {
  chatMessages: LiveRoomChatEntry[];
  participantProfilesById: Map<string, UserShortProfile>;
  mentionSuggestions: UserShortProfile[];
  participantChatPermissions: Record<string, boolean>;
  hostParticipantId: string;
  canChat: boolean;
  isLive: boolean;
  isEnded: boolean;
  isLoggedIn: boolean;
  isHost: boolean;
  onSendMessage: (body: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onKickParticipant: (participantId: string) => Promise<void>;
  onSetParticipantChatEnabled: (
    targetParticipantId: string,
    canChat: boolean,
  ) => Promise<void>;
  onRequestLogin: () => void;
}

const LiveRoomChatPanel = ({
  chatMessages,
  participantProfilesById,
  mentionSuggestions,
  participantChatPermissions,
  hostParticipantId,
  canChat,
  isLive,
  isEnded,
  isLoggedIn,
  isHost,
  onSendMessage,
  onDeleteMessage,
  onKickParticipant,
  onSetParticipantChatEnabled,
  onRequestLogin,
}: LiveRoomChatPanelProps): ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !shouldAutoScrollRef.current) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [chatMessages]);

  const onScroll = (): void => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }

    const distanceFromBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 32;
  };

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-3"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
              <DiscussIcon size={IconSize.Small} />
            </span>
            <Typography type={TypographyType.Footnote} bold>
              No messages yet
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Chat is live and messages disappear when the room ends.
            </Typography>
          </div>
        ) : (
          chatMessages.map((message) => {
            const sender =
              participantProfilesById.get(message.participantId) ??
              buildParticipantProfile(message.participantId);
            const isSenderBlocked =
              (participantChatPermissions[message.participantId] ?? true) ===
              false;
            const canModerateParticipant =
              isHost &&
              message.participantId !== hostParticipantId &&
              message.participantId !== '';

            return (
              <article
                key={message.messageId}
                className="group flex items-start gap-2 px-1 py-1.5"
              >
                <ProfilePicture user={sender} size={ProfileImageSize.Small} />
                <div className="min-w-0 flex-1">
                  <div className="min-w-0 text-[0.9375rem] leading-[1.5]">
                    <span className="mr-2 inline font-bold">
                      {userDisplayName(sender)}
                    </span>
                    <Markdown
                      className="inline !text-[0.9375rem] [&_a]:!text-[0.9375rem] [&_code]:rounded-[0.375rem] [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:py-0.5 [&_p]:inline [&_p]:!text-[0.9375rem] [&_p]:!leading-[1.5]"
                      content={chatMarkdownToHtml(message.body, {
                        mentions: mentionSuggestions,
                      })}
                    />
                  </div>
                </div>
                {isHost ? (
                  <div
                    className={classNames(
                      'ml-2 shrink-0 pt-0.5 transition-opacity',
                      openMenuId === message.messageId
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    <DropdownMenu
                      open={openMenuId === message.messageId}
                      onOpenChange={(open) =>
                        setOpenMenuId(open ? message.messageId : null)
                      }
                    >
                      <DropdownMenuTrigger
                        tooltip={{ content: 'Chat moderation options' }}
                        asChild
                      >
                        <Button
                          type="button"
                          size={ButtonSize.XSmall}
                          variant={ButtonVariant.Tertiary}
                          icon={<MenuIcon />}
                          aria-label={`Chat moderation options for ${userDisplayName(
                            sender,
                          )}`}
                          disabled={!!moderationBusy}
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          disabled={!!moderationBusy}
                          onClick={() => {
                            if (moderationBusy) {
                              return;
                            }

                            setModerationBusy(`delete-${message.messageId}`);
                            onDeleteMessage(message.messageId)
                              .catch(() => undefined)
                              .finally(() => {
                                setModerationBusy(null);
                                setOpenMenuId(null);
                              });
                          }}
                        >
                          <div className="flex items-center gap-2 typo-callout">
                            <TrashIcon /> Delete message
                          </div>
                        </DropdownMenuItem>
                        {canModerateParticipant ? (
                          <DropdownMenuItem
                            disabled={!!moderationBusy}
                            onClick={() => {
                              if (moderationBusy) {
                                return;
                              }

                              setModerationBusy(
                                `kick-${message.participantId}`,
                              );
                              onKickParticipant(message.participantId)
                                .catch(() => undefined)
                                .finally(() => {
                                  setModerationBusy(null);
                                  setOpenMenuId(null);
                                });
                            }}
                          >
                            <div className="flex items-center gap-2 typo-callout">
                              <BlockIcon /> Kick user
                            </div>
                          </DropdownMenuItem>
                        ) : null}
                        {canModerateParticipant && !isSenderBlocked ? (
                          <DropdownMenuItem
                            disabled={!!moderationBusy}
                            onClick={() => {
                              if (moderationBusy) {
                                return;
                              }

                              setModerationBusy(
                                `toggle-${message.participantId}`,
                              );
                              onSetParticipantChatEnabled(
                                message.participantId,
                                false,
                              )
                                .catch(() => undefined)
                                .finally(() => {
                                  setModerationBusy(null);
                                  setOpenMenuId(null);
                                });
                            }}
                          >
                            <div className="flex items-center gap-2 typo-callout">
                              <LockIcon /> Revoke chat access
                            </div>
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
      <LiveRoomChatComposer
        canChat={canChat}
        isLive={isLive}
        isEnded={isEnded}
        isLoggedIn={isLoggedIn}
        mentionSuggestions={mentionSuggestions}
        onSendMessage={onSendMessage}
        onRequestLogin={onRequestLogin}
      />
    </div>
  );
};

interface LiveRoomQueuePanelProps {
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

const LiveRoomQueuePanel = ({
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
  const activeSpeakers = activeSpeakerParticipantIds
    .map((id) => participantsById[id])
    .filter(
      (participant): participant is LiveRoomParticipantRecord => !!participant,
    );
  const audienceMembers = audienceParticipantIds
    .map((id) => participantsById[id])
    .filter(
      (participant): participant is LiveRoomParticipantRecord => !!participant,
    );
  const sectionTitle = mode === 'free_for_all' ? 'Audience' : 'Queue';
  const sectionCount =
    mode === 'free_for_all'
      ? audienceMembers.length
      : queuedParticipantIds.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
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
                return (
                  <StageParticipantItem
                    key={id}
                    participantId={id}
                    profile={participantProfilesById.get(id)}
                    actions={
                      isHost ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <Tooltip
                            content={`Remove ${userDisplayName(
                              participantProfilesById.get(id) ??
                                buildParticipantProfile(id),
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
                                participantProfilesById.get(id) ??
                                  buildParticipantProfile(id),
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
                              participantProfilesById.get(id) ??
                                buildParticipantProfile(id),
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
                                participantProfilesById.get(id) ??
                                  buildParticipantProfile(id),
                              )}`}
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
                {mode === 'free_for_all'
                  ? 'Audience is quiet'
                  : 'Queue is empty'}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {mode === 'free_for_all'
                  ? 'New listeners will show up here until they join the stage.'
                  : 'Audience members can request to speak.'}
              </Typography>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {(mode === 'free_for_all'
                ? audienceParticipantIds
                : queuedParticipantIds
              ).map((id) => {
                const participant = participantsById[id];
                if (!participant) {
                  return null;
                }

                const profile =
                  participantProfilesById.get(id) ??
                  buildParticipantProfile(id);
                return (
                  <StageParticipantItem
                    key={id}
                    participantId={id}
                    profile={profile}
                    actions={
                      isHost ? (
                        <div className="flex shrink-0 items-center gap-1">
                          {mode === 'moderated' ? (
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
                                loading={moderationBusy === `promote-${id}`}
                                disabled={!!moderationBusy}
                                aria-label={`Promote ${userDisplayName(
                                  profile,
                                )}`}
                                onClick={() =>
                                  guardedModerationAction(`promote-${id}`, () =>
                                    promoteSpeaker(id),
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
      </div>
    </div>
  );
};

interface LiveBadgeProps {
  isLive: boolean;
}

const LiveBadge = ({ isLive }: LiveBadgeProps): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1.5 rounded-8 px-2 py-0.5 typo-caption1',
      isLive
        ? 'bg-accent-ketchup-default text-white'
        : 'bg-surface-float text-text-tertiary',
    )}
  >
    <span
      className={classNames(
        'size-1.5 rounded-full',
        isLive ? 'animate-pulse bg-white' : 'bg-text-quaternary',
      )}
    />
    <span className="font-bold uppercase tracking-wide">
      {isLive ? 'Live' : 'Setup'}
    </span>
  </span>
);

const LiveRoomInner = ({ roomId }: LiveRoomProps): ReactElement => {
  const router = useRouter();
  const { displayToast } = useToastNotification();
  const { isAuthReady, showLogin, user } = useAuthContext();
  const {
    status,
    errorMessage,
    roomState,
    role,
    participantId,
    sendChatMessage,
    deleteChatMessage,
    setParticipantChatEnabled,
    promoteSpeaker,
    removeSpeaker,
    kickParticipant,
    canChat,
    localStream,
    remoteStreams,
    reactions,
    chatMessages,
  } = useLiveRoomConnection();
  const {
    data: room,
    error: roomError,
    isLoading: isRoomLoading,
  } = useLiveRoomQuery(roomId);

  const handleLeave = (): void => {
    router.push(`${webappUrl}live`);
  };

  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('chat');
  const streamDuration = useStreamDuration(roomState?.status === 'live');

  const guardedModerationAction = async (
    key: string,
    fn: () => Promise<void>,
  ): Promise<void> => {
    if (moderationBusy) {
      return;
    }
    setModerationBusy(key);
    try {
      await fn();
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setModerationBusy(null);
    }
  };

  const handleSendChatMessage = async (body: string): Promise<void> => {
    try {
      await sendChatMessage(body);
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Message failed');
    }
  };

  const handleChatLogin = (): void => {
    showLogin({ trigger: AuthTriggers.MainButton });
  };

  const handleDeleteChatMessage = async (messageId: string): Promise<void> => {
    try {
      await deleteChatMessage(messageId);
    } catch (err) {
      displayToast(
        err instanceof Error ? err.message : 'Could not delete message',
      );
    }
  };

  const handleSetParticipantChatEnabled = async (
    targetParticipantId: string,
    nextCanChat: boolean,
  ): Promise<void> => {
    try {
      await setParticipantChatEnabled(targetParticipantId, nextCanChat);
    } catch (err) {
      displayToast(
        err instanceof Error ? err.message : 'Could not update chat access',
      );
    }
  };

  const handleKickChatParticipant = async (
    targetParticipantId: string,
  ): Promise<void> => {
    try {
      await kickParticipant(targetParticipantId);
    } catch (err) {
      displayToast(err instanceof Error ? err.message : 'Could not kick user');
    }
  };

  const participantIds = useMemo(() => {
    const ids = new Set<string>();

    Object.keys(roomState?.participants ?? {}).forEach((id) => {
      if (id && id !== room?.host.id) {
        ids.add(id);
      }
    });
    chatMessages.forEach((message) => {
      if (message.participantId && message.participantId !== room?.host.id) {
        ids.add(message.participantId);
      }
    });

    return [...ids];
  }, [chatMessages, room?.host.id, roomState?.participants]);
  const participantProfileQueries = useQueries({
    queries: participantIds.map((id) => ({
      queryKey: generateQueryKey(
        RequestKey.Profile,
        undefined,
        'live-room-participant',
        id,
      ),
      queryFn: () => getUserShortInfo(id),
      staleTime: ONE_MINUTE,
    })),
  });
  const participantProfilesById = new Map<string, UserShortProfile>();
  participantIds.forEach((id, index) => {
    const profile = participantProfileQueries[index]?.data;
    if (profile) {
      participantProfilesById.set(id, profile);
    }
  });

  if (!isAuthReady || isRoomLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          We couldn&apos;t load this live room
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {roomError?.message ?? 'The room may no longer be available.'}
        </Typography>
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={handleLeave}
        >
          Back to live rooms
        </Button>
      </div>
    );
  }

  if (status === 'error' || status === 'closed') {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Typography type={TypographyType.Title3} bold>
          {status === 'closed'
            ? 'Live room connection closed'
            : "We couldn't connect to this live room"}
        </Typography>
        {errorMessage ? (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {errorMessage}
          </Typography>
        ) : null}
        <Button
          className="mt-2"
          variant={ButtonVariant.Primary}
          onClick={handleLeave}
        >
          Back to live rooms
        </Button>
      </div>
    );
  }

  const isHost = role === 'host';
  const isCreated = roomState?.status === 'created';
  const isLive = roomState?.status === 'live';
  const isEnded = roomState?.status === 'ended' || room.status === 'ended';
  const roomMode = roomState?.mode ?? room.mode;
  const isFreeForAll = roomMode === 'free_for_all';
  const participantCount = roomState
    ? Object.keys(roomState.participants).length
    : 0;
  const activeSpeakerIds =
    roomState?.stage.activeSpeakerParticipantIds.filter(
      (id) => !!roomState.participants[id] && id !== room.host.id,
    ) ?? [];
  const queuedParticipantIds =
    roomState?.stage.speakerQueueParticipantIds.filter(
      (id) => !!roomState.participants[id],
    ) ?? [];
  const audienceParticipantIds = roomState
    ? Object.values(roomState.participants)
        .map((participant) => participant.participantId)
        .filter(
          (id) =>
            id !== room.host.id &&
            !activeSpeakerIds.includes(id) &&
            !queuedParticipantIds.includes(id),
        )
    : [];
  const stageLimit = roomState?.stage.speakerLimit ?? null;
  const remainingSeats =
    stageLimit === null
      ? null
      : Math.max(stageLimit - activeSpeakerIds.length, 0);
  let waitingPrompt = 'Audience can join the queue';
  if (isFreeForAll) {
    waitingPrompt =
      remainingSeats === 0
        ? 'The stage is full right now'
        : `${remainingSeats ?? 0} open stage spots`;
  } else if (queuedParticipantIds.length > 0) {
    waitingPrompt = `${queuedParticipantIds.length} in queue`;
  }
  const hostProfile = room.host;
  const hostDisplayProfile = buildDisplayProfile(room.host);
  participantProfilesById.set(room.host.id, hostProfile);
  const mentionSuggestions = [
    hostProfile,
    ...participantIds
      .map((id) => participantProfilesById.get(id))
      .filter((profile): profile is UserShortProfile => !!profile),
  ];

  const stageSpeakers: {
    id: string;
    profile: UserShortProfile;
    stream: MediaStream | null;
    selfView: boolean;
    isHost: boolean;
  }[] = [];
  const hostStream = buildParticipantStream(
    room.host.id,
    remoteStreams,
    localStream,
    participantId,
  );
  stageSpeakers.push({
    id: room.host.id,
    profile: hostDisplayProfile,
    stream: hostStream,
    selfView: room.host.id === participantId,
    isHost: true,
  });
  activeSpeakerIds.forEach((activeSpeakerId) => {
    stageSpeakers.push({
      id: activeSpeakerId,
      profile: buildDisplayProfile(
        participantProfilesById.get(activeSpeakerId) ??
          buildParticipantProfile(activeSpeakerId),
      ),
      stream: buildParticipantStream(
        activeSpeakerId,
        remoteStreams,
        localStream,
        participantId,
      ),
      selfView: activeSpeakerId === participantId,
      isHost: false,
    });
  });

  const showAudienceWaiting = isCreated && !isHost;

  return (
    <div className="relative flex flex-1 flex-col gap-3 overflow-hidden p-3 tablet:p-4">
      <ReactionOverlay reactions={reactions} />

      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <LiveBadge isLive={!!isLive} />
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.Title3}
            bold
            truncate
            className="min-w-0"
          >
            {room.topic}
          </Typography>
        </div>
        {roomState ? (
          <div className="flex items-center gap-4 text-text-tertiary typo-caption1">
            {isLive ? (
              <span className="inline-flex items-center gap-1.5">
                <TimerIcon size={IconSize.XSmall} />
                <span className="tabular-nums text-text-secondary">
                  {formatStreamDuration(streamDuration)}
                </span>
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <UserIcon size={IconSize.XSmall} />
              <span className="font-bold text-text-primary">
                <AnimatedCount value={participantCount} />
              </span>
              <span>watching</span>
            </span>
          </div>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          aria-label="Speakers"
          className="relative flex min-h-0 flex-col"
        >
          <div className="flex flex-1 flex-wrap content-start gap-3 overflow-y-auto p-1.5 pb-24 tablet:pb-28">
            {stageSpeakers.map((speaker) => {
              const canModerate = isHost && !speaker.isHost;
              return (
                <div
                  key={speaker.id}
                  className="flex min-w-[18rem] flex-1 basis-[20rem]"
                >
                  <LiveRoomVideoTile
                    stream={speaker.stream}
                    user={speaker.profile}
                    selfView={speaker.selfView}
                    isHost={speaker.isHost}
                    onRemoveSpeaker={
                      canModerate
                        ? () =>
                            guardedModerationAction(
                              `tile-remove-${speaker.id}`,
                              () => removeSpeaker(speaker.id),
                            )
                        : undefined
                    }
                    onKick={
                      canModerate
                        ? () =>
                            guardedModerationAction(
                              `tile-kick-${speaker.id}`,
                              () => kickParticipant(speaker.id),
                            )
                        : undefined
                    }
                    isRemoving={moderationBusy === `tile-remove-${speaker.id}`}
                    isKicking={moderationBusy === `tile-kick-${speaker.id}`}
                    moderationDisabled={!!moderationBusy}
                  />
                </div>
              );
            })}
            {stageSpeakers.length === 1 ? (
              <div className="flex min-w-[18rem] flex-1 basis-[20rem] items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex size-10 items-center justify-center rounded-full bg-surface-float text-text-tertiary">
                    <UserIcon size={IconSize.Small} />
                  </span>
                  <Typography type={TypographyType.Footnote} bold>
                    Waiting for the next speaker
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
          </div>

          {showAudienceWaiting ? (
            <div className="absolute inset-x-0 top-0 flex justify-center p-3">
              <span className="rounded-10 bg-overlay-base-tertiary px-3 py-1.5 backdrop-blur">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  Waiting for the host to start the room…
                </Typography>
              </span>
            </div>
          ) : null}

          {isEnded ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-overlay-base-tertiary backdrop-blur">
              <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
                <Typography type={TypographyType.Title3} bold>
                  This live room has ended
                </Typography>
                <Button variant={ButtonVariant.Primary} onClick={handleLeave}>
                  Back to live rooms
                </Button>
              </div>
            </div>
          ) : null}

          {roomState && !isEnded ? (
            <LiveRoomControls onLeave={handleLeave} />
          ) : null}
        </section>

        <aside
          aria-label="Live room side panel"
          className="flex min-h-0 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float"
        >
          <SidePanelTabs
            active={activeTab}
            secondaryCount={
              isFreeForAll
                ? audienceParticipantIds.length
                : queuedParticipantIds.length
            }
            secondaryLabel={isFreeForAll ? 'Audience' : 'Queue'}
            onChange={setActiveTab}
          />
          <div className="min-h-0 flex-1">
            {activeTab === 'chat' ? (
              <LiveRoomChatPanel
                chatMessages={chatMessages}
                participantProfilesById={participantProfilesById}
                mentionSuggestions={mentionSuggestions}
                participantChatPermissions={roomState?.chatPermissions ?? {}}
                hostParticipantId={room.host.id}
                canChat={canChat}
                isLive={!!isLive}
                isEnded={!!isEnded}
                isLoggedIn={!!user}
                isHost={isHost}
                onSendMessage={handleSendChatMessage}
                onDeleteMessage={handleDeleteChatMessage}
                onKickParticipant={handleKickChatParticipant}
                onSetParticipantChatEnabled={handleSetParticipantChatEnabled}
                onRequestLogin={handleChatLogin}
              />
            ) : (
              <LiveRoomQueuePanel
                mode={roomMode}
                activeSpeakerParticipantIds={activeSpeakerIds}
                queuedParticipantIds={queuedParticipantIds}
                audienceParticipantIds={audienceParticipantIds}
                participantsById={roomState?.participants ?? {}}
                participantProfilesById={participantProfilesById}
                isHost={isHost}
                stageLimit={stageLimit}
                moderationBusy={moderationBusy}
                guardedModerationAction={guardedModerationAction}
                promoteSpeaker={promoteSpeaker}
                removeSpeaker={removeSpeaker}
                kickParticipant={kickParticipant}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export const LiveRoom = ({ roomId }: LiveRoomProps): ReactElement => (
  <LiveRoomProvider roomId={roomId}>
    <LiveRoomInner roomId={roomId} />
  </LiveRoomProvider>
);

export default LiveRoom;
