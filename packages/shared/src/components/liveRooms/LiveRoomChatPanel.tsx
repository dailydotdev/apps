import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import Markdown from '../Markdown';
import RichTextInput, { type RichTextInputRef } from '../fields/RichTextInput';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  BlockIcon,
  DiscussIcon,
  LockIcon,
  MenuIcon,
  PlusIcon,
  TrashIcon,
} from '../icons';
import { IconSize } from '../Icon';
import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import { chatMarkdownToHtml } from '../../lib/liveRoom/chatMarkdown';
import { LIVE_ROOM_QUICK_REACTION_EMOJIS } from '../../lib/liveRoom/reactions';
import type { UserShortProfile } from '../../lib/user';
import {
  buildParticipantProfile,
  userDisplayName,
} from './liveRoomParticipants';

export type ChatReactionSource =
  | 'active_chip'
  | 'quick_shortcut'
  | 'custom_picker';

export interface ChatReactionAnalytics {
  source: ChatReactionSource;
  activeReactionCount: number;
  quickReactionCount: number;
}

interface ChatReactionGroup {
  key: string;
  count: number;
  isReactedByCurrentParticipant: boolean;
}

const getChatReactionGroups = (
  message: LiveRoomChatEntry,
  currentParticipantId: string | null,
): ChatReactionGroup[] => {
  const groups = new Map<string, ChatReactionGroup>();

  message.reactions?.forEach((reaction) => {
    const group = groups.get(reaction.key) ?? {
      key: reaction.key,
      count: 0,
      isReactedByCurrentParticipant: false,
    };

    groups.set(reaction.key, {
      ...group,
      count: group.count + 1,
      isReactedByCurrentParticipant:
        group.isReactedByCurrentParticipant ||
        reaction.participantId === currentParticipantId,
    });
  });

  return [...groups.values()];
};

const reactionPopKeyframes: Keyframe[] = [
  { transform: 'scale(1)' },
  { transform: 'scale(1.18)' },
  { transform: 'scale(1)' },
];

const reactionPopOptions: KeyframeAnimationOptions = {
  duration: 260,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

const FIRST_REACTION_PARTICLE_COUNT = 6;
const FIRST_REACTION_BURST_DURATION_MS = 720;
const FIRST_REACTION_PARTICLE_MAX_DELAY_MS = 90;
const FIRST_REACTION_BURST_CLEAR_DELAY_MS =
  FIRST_REACTION_BURST_DURATION_MS + FIRST_REACTION_PARTICLE_MAX_DELAY_MS;

interface FirstReactionBurstProps {
  emoji: string;
  signal: number;
}

const FirstReactionBurst = ({
  emoji,
  signal,
}: FirstReactionBurstProps): ReactElement | null => {
  const particles = useMemo(() => {
    if (!signal) {
      return [];
    }

    const arcSpan = Math.PI * 0.9;
    const baseAngle = -Math.PI / 2 - arcSpan / 2;
    const step = arcSpan / Math.max(1, FIRST_REACTION_PARTICLE_COUNT - 1);

    return Array.from({ length: FIRST_REACTION_PARTICLE_COUNT }, (_, index) => {
      const angle = baseAngle + step * index + (Math.random() - 0.5) * 0.25;
      const distance = 26 + Math.random() * 18;
      return {
        tx: Math.round(Math.cos(angle) * distance),
        ty: Math.round(Math.sin(angle) * distance),
        delay: Math.round(Math.random() * FIRST_REACTION_PARTICLE_MAX_DELAY_MS),
      };
    });
  }, [signal]);

  if (!signal) {
    return null;
  }

  return (
    <span
      key={signal}
      aria-hidden
      className="z-10 pointer-events-none absolute left-2 top-0 block size-0"
    >
      {particles.map((particle, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="absolute left-0 top-0 block animate-reaction-burst text-sm leading-none opacity-0"
          style={
            {
              '--burst-tx': `${particle.tx}px`,
              '--burst-ty': `${particle.ty}px`,
              animationDelay: `${particle.delay}ms`,
            } as React.CSSProperties
          }
        >
          {emoji}
        </span>
      ))}
    </span>
  );
};

interface ChatReactionChipProps {
  emoji: string;
  count: number;
  ariaLabel: string;
  disabled: boolean;
  isSending: boolean;
  pulseSignal: number;
  onClick: () => void;
}

const ChatReactionChip = ({
  emoji,
  count,
  ariaLabel,
  disabled,
  isSending,
  pulseSignal,
  onClick,
}: ChatReactionChipProps): ReactElement => {
  const ref = useRef<HTMLButtonElement>(null);
  const lastPulseRef = useRef(pulseSignal);

  useEffect(() => {
    if (pulseSignal === lastPulseRef.current) {
      return;
    }

    lastPulseRef.current = pulseSignal;
    ref.current?.animate?.(reactionPopKeyframes, reactionPopOptions);
  }, [pulseSignal]);

  return (
    <button
      ref={ref}
      type="button"
      className="flex h-6 items-center gap-1 rounded-8 border border-border-subtlest-tertiary bg-surface-float px-1.5 text-xs leading-none text-text-secondary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{emoji}</span>
      <span>{count}</span>
      {isSending ? <span className="sr-only">Sending</span> : null}
    </button>
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
    disabledReason = 'Chat has ended for this standup.';
  } else if (!isLive) {
    disabledReason = 'Chat opens when the standup goes live.';
  }

  const handleSubmit = async (body: string): Promise<void> => {
    const trimmedBody = body.trim();
    if (!trimmedBody || isSending || !canChat) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(trimmedBody);
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
  currentParticipantId: string | null;
  hostParticipantId: string;
  coHostParticipantIds: string[];
  canChat: boolean;
  isLive: boolean;
  isEnded: boolean;
  isLoggedIn: boolean;
  hasHostPrivileges: boolean;
  onSendMessage: (body: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onSendMessageReaction: (
    messageId: string,
    key: string,
    analytics: ChatReactionAnalytics,
  ) => Promise<void>;
  onRemoveMessageReaction: (
    messageId: string,
    key: string,
    analytics: ChatReactionAnalytics,
  ) => Promise<void>;
  onKickParticipant: (participantId: string) => Promise<void>;
  onSetParticipantChatEnabled: (
    targetParticipantId: string,
    canChat: boolean,
  ) => Promise<void>;
  onRequestLogin: () => void;
}

export const LiveRoomChatPanel = ({
  chatMessages,
  participantProfilesById,
  mentionSuggestions,
  participantChatPermissions,
  currentParticipantId,
  hostParticipantId,
  coHostParticipantIds,
  canChat,
  isLive,
  isEnded,
  isLoggedIn,
  hasHostPrivileges,
  onSendMessage,
  onDeleteMessage,
  onSendMessageReaction,
  onRemoveMessageReaction,
  onKickParticipant,
  onSetParticipantChatEnabled,
  onRequestLogin,
}: LiveRoomChatPanelProps): ReactElement => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [reactionBusy, setReactionBusy] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [reactionPulseSignals, setReactionPulseSignals] = useState<
    Map<string, number>
  >(() => new Map());
  const [firstReactionBursts, setFirstReactionBursts] = useState<
    Map<string, { emoji: string; signal: number }>
  >(() => new Map());
  const previousReactionCountsRef = useRef<Map<string, number>>(new Map());
  const previousMessagesWithReactionsRef = useRef<Set<string>>(new Set());
  const hasInitializedReactionsRef = useRef(false);
  const firstReactionBurstTimeoutsRef = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  useEffect(() => {
    const firstReactionBurstTimeouts = firstReactionBurstTimeoutsRef.current;

    return () => {
      firstReactionBurstTimeouts.forEach(clearTimeout);
      firstReactionBurstTimeouts.clear();
    };
  }, []);

  useEffect(() => {
    const nextCounts = new Map<string, number>();
    const messagesWithReactions = new Set<string>();
    const firstReactionEmojiByMessage = new Map<string, string>();

    chatMessages.forEach((message) => {
      message.reactions?.forEach((reaction) => {
        const key = `${message.messageId}-${reaction.key}`;
        nextCounts.set(key, (nextCounts.get(key) ?? 0) + 1);
        messagesWithReactions.add(message.messageId);
        if (!firstReactionEmojiByMessage.has(message.messageId)) {
          firstReactionEmojiByMessage.set(message.messageId, reaction.key);
        }
      });
    });

    if (hasInitializedReactionsRef.current) {
      const newlyIncreased: string[] = [];
      nextCounts.forEach((count, key) => {
        const previousCount = previousReactionCountsRef.current.get(key) ?? 0;
        if (count > previousCount) {
          newlyIncreased.push(key);
        }
      });

      if (newlyIncreased.length > 0) {
        setReactionPulseSignals((current) => {
          const next = new Map(current);
          newlyIncreased.forEach((key) => {
            next.set(key, (next.get(key) ?? 0) + 1);
          });
          return next;
        });
      }

      const newlyReactedMessageIds: { messageId: string; emoji: string }[] = [];
      messagesWithReactions.forEach((messageId) => {
        if (previousMessagesWithReactionsRef.current.has(messageId)) {
          return;
        }
        const emoji = firstReactionEmojiByMessage.get(messageId);
        if (!emoji) {
          return;
        }
        newlyReactedMessageIds.push({ messageId, emoji });
      });

      if (newlyReactedMessageIds.length > 0) {
        setFirstReactionBursts((current) => {
          const next = new Map(current);
          newlyReactedMessageIds.forEach(({ messageId, emoji }) => {
            const previous = next.get(messageId);
            next.set(messageId, {
              emoji,
              signal: (previous?.signal ?? 0) + 1,
            });
          });
          return next;
        });

        newlyReactedMessageIds.forEach(({ messageId }) => {
          const currentTimeout =
            firstReactionBurstTimeoutsRef.current.get(messageId);
          if (currentTimeout) {
            clearTimeout(currentTimeout);
          }

          const timeout = setTimeout(() => {
            setFirstReactionBursts((activeBursts) => {
              const activeBurst = activeBursts.get(messageId);
              if (!activeBurst) {
                return activeBursts;
              }

              const remainingBursts = new Map(activeBursts);
              remainingBursts.delete(messageId);
              return remainingBursts;
            });
            firstReactionBurstTimeoutsRef.current.delete(messageId);
          }, FIRST_REACTION_BURST_CLEAR_DELAY_MS);
          firstReactionBurstTimeoutsRef.current.set(messageId, timeout);
        });
      }
    }

    previousReactionCountsRef.current = nextCounts;
    previousMessagesWithReactionsRef.current = messagesWithReactions;
    hasInitializedReactionsRef.current = true;
  }, [chatMessages]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || !shouldAutoScrollRef.current) {
      return;
    }

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [chatMessages]);

  const handleScroll = (): void => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const distanceFromBottom =
      scrollContainer.scrollHeight -
      scrollContainer.scrollTop -
      scrollContainer.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 32;
  };

  const runModerationAction = (
    key: string,
    action: () => Promise<void>,
  ): void => {
    if (moderationBusy) {
      return;
    }

    setModerationBusy(key);
    action()
      .catch(() => undefined)
      .finally(() => {
        setModerationBusy(null);
        setOpenMenuId(null);
      });
  };

  const runReactionAction = (
    messageId: string,
    reactionKey: string,
    analytics: ChatReactionAnalytics,
    shouldRemove = false,
  ): void => {
    const key = `${messageId}-${reactionKey}`;
    if (reactionBusy || !canChat) {
      return;
    }

    setReactionBusy(key);
    const action = shouldRemove
      ? onRemoveMessageReaction
      : onSendMessageReaction;
    action(messageId, reactionKey, analytics)
      .catch(() => undefined)
      .finally(() => setReactionBusy(null));
  };

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
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
              Chat is live and messages disappear when the standup ends.
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
            const isSenderHost = message.participantId === hostParticipantId;
            const isSenderCoHost =
              !isSenderHost &&
              coHostParticipantIds.includes(message.participantId);
            const canModerateParticipant =
              hasHostPrivileges &&
              message.participantId !== hostParticipantId &&
              message.participantId !== '';
            const reactionGroups = getChatReactionGroups(
              message,
              currentParticipantId,
            );
            const reactionKeys = new Set(
              reactionGroups.map((reaction) => reaction.key),
            );
            const quickReactionKeys = LIVE_ROOM_QUICK_REACTION_EMOJIS.filter(
              (reactionKey) => !reactionKeys.has(reactionKey),
            ).slice(0, Math.max(0, 5 - reactionGroups.length));
            const showQuickReactions = canChat && quickReactionKeys.length > 0;
            const showReactionRow =
              canChat || showQuickReactions || reactionGroups.length > 0;
            const senderName = userDisplayName(sender);
            const baseReactionAnalytics = {
              activeReactionCount: reactionGroups.length,
              quickReactionCount: quickReactionKeys.length,
            };
            const firstReactionBurst = firstReactionBursts.get(
              message.messageId,
            );

            return (
              <article
                key={message.messageId}
                className="group flex items-start gap-2 px-1 py-1.5"
              >
                <ProfilePicture user={sender} size={ProfileImageSize.Small} />
                <div className="min-w-0 flex-1">
                  <div className="min-w-0 text-[0.9375rem] leading-[1.5]">
                    <span className="mr-2 inline font-bold">{senderName}</span>
                    {isSenderHost ? (
                      <span className="mr-2 inline rounded-6 bg-surface-float px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-accent-bun-default">
                        Host
                      </span>
                    ) : null}
                    {isSenderCoHost ? (
                      <span className="mr-2 inline rounded-6 bg-surface-float px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-accent-water-bolder">
                        Co-host
                      </span>
                    ) : null}
                    <Markdown
                      className="inline !text-[0.9375rem] [&_a]:!text-[0.9375rem] [&_code]:rounded-[0.375rem] [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:py-0.5 [&_p]:inline [&_p]:!text-[0.9375rem] [&_p]:!leading-[1.5]"
                      content={chatMarkdownToHtml(message.body, {
                        mentions: mentionSuggestions,
                      })}
                    />
                  </div>
                  {showReactionRow ? (
                    <div
                      className={classNames(
                        'relative mt-1 flex flex-wrap items-center gap-1 transition-opacity',
                        reactionGroups.length === 0
                          ? 'opacity-100 tablet:opacity-0 tablet:group-focus-within:opacity-100 tablet:group-hover:opacity-100'
                          : 'opacity-100',
                      )}
                    >
                      {firstReactionBurst ? (
                        <FirstReactionBurst
                          emoji={firstReactionBurst.emoji}
                          signal={firstReactionBurst.signal}
                        />
                      ) : null}
                      {reactionGroups.map((reaction) => {
                        const reactionKey = `${message.messageId}-${reaction.key}`;

                        return (
                          <ChatReactionChip
                            key={reaction.key}
                            emoji={reaction.key}
                            count={reaction.count}
                            ariaLabel={`${
                              reaction.isReactedByCurrentParticipant
                                ? 'Remove'
                                : 'React'
                            } ${reaction.key} ${
                              reaction.isReactedByCurrentParticipant
                                ? 'reaction from'
                                : 'to'
                            } message from ${senderName}`}
                            disabled={!canChat || !!reactionBusy}
                            isSending={reactionBusy === reactionKey}
                            pulseSignal={
                              reactionPulseSignals.get(reactionKey) ?? 0
                            }
                            onClick={() =>
                              runReactionAction(
                                message.messageId,
                                reaction.key,
                                {
                                  ...baseReactionAnalytics,
                                  source: 'active_chip',
                                },
                                reaction.isReactedByCurrentParticipant,
                              )
                            }
                          />
                        );
                      })}
                      {showQuickReactions || canChat ? (
                        <div
                          className={classNames(
                            'flex flex-wrap items-center gap-1 transition-opacity',
                            reactionGroups.length > 0 &&
                              'opacity-100 tablet:opacity-0 tablet:group-focus-within:opacity-100 tablet:group-hover:opacity-100',
                          )}
                        >
                          {showQuickReactions
                            ? quickReactionKeys.map((reactionKey) => {
                                const busyKey = `${message.messageId}-${reactionKey}`;

                                return (
                                  <button
                                    key={reactionKey}
                                    type="button"
                                    className="flex size-6 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-surface-float text-sm leading-none text-text-secondary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label={`React ${reactionKey} to message from ${senderName}`}
                                    disabled={!!reactionBusy}
                                    onClick={() =>
                                      runReactionAction(
                                        message.messageId,
                                        reactionKey,
                                        {
                                          ...baseReactionAnalytics,
                                          source: 'quick_shortcut',
                                        },
                                      )
                                    }
                                  >
                                    <span>{reactionKey}</span>
                                    {reactionBusy === busyKey ? (
                                      <span className="sr-only">Sending</span>
                                    ) : null}
                                  </button>
                                );
                              })
                            : null}
                          <EmojiPicker
                            value=""
                            label={null}
                            className="shrink-0"
                            onChange={(reactionKey) => {
                              if (!reactionKey) {
                                return;
                              }

                              runReactionAction(
                                message.messageId,
                                reactionKey,
                                {
                                  ...baseReactionAnalytics,
                                  source: 'custom_picker',
                                },
                              );
                            }}
                            renderTrigger={({ isOpen, toggleOpen }) => (
                              <Button
                                type="button"
                                size={ButtonSize.XSmall}
                                variant={
                                  isOpen
                                    ? ButtonVariant.Primary
                                    : ButtonVariant.Float
                                }
                                className="!size-6 shrink-0"
                                icon={<PlusIcon size={IconSize.Size16} />}
                                aria-label={`Custom reaction to message from ${senderName}`}
                                aria-expanded={isOpen}
                                disabled={!!reactionBusy}
                                onClick={toggleOpen}
                              />
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {hasHostPrivileges ? (
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
                          onClick={() =>
                            runModerationAction(
                              `delete-${message.messageId}`,
                              () => onDeleteMessage(message.messageId),
                            )
                          }
                        >
                          <div className="flex items-center gap-2 typo-callout">
                            <TrashIcon /> Delete message
                          </div>
                        </DropdownMenuItem>
                        {canModerateParticipant ? (
                          <DropdownMenuItem
                            disabled={!!moderationBusy}
                            onClick={() =>
                              runModerationAction(
                                `kick-${message.participantId}`,
                                () => onKickParticipant(message.participantId),
                              )
                            }
                          >
                            <div className="flex items-center gap-2 typo-callout">
                              <BlockIcon /> Kick user
                            </div>
                          </DropdownMenuItem>
                        ) : null}
                        {canModerateParticipant && !isSenderBlocked ? (
                          <DropdownMenuItem
                            disabled={!!moderationBusy}
                            onClick={() =>
                              runModerationAction(
                                `toggle-${message.participantId}`,
                                () =>
                                  onSetParticipantChatEnabled(
                                    message.participantId,
                                    false,
                                  ),
                              )
                            }
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
