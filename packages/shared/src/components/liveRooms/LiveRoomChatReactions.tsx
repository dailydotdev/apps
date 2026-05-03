import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EmojiPicker } from '../fields/EmojiPicker';
import { IconSize } from '../Icon';
import { PlusIcon } from '../icons';
import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import { LIVE_ROOM_QUICK_REACTION_EMOJIS } from '../../lib/liveRoom/reactions';

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

interface FirstReactionBurstState {
  emoji: string;
  signal: number;
}

interface ChatReactionAnimationState {
  firstReactionBurst: FirstReactionBurstState | null;
  getPulseSignal: (reactionKey: string) => number;
}

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
const MAX_REACTION_SLOTS = 5;

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

const getReactionCounts = (
  message: LiveRoomChatEntry,
): {
  counts: Map<string, number>;
  firstReactionEmoji: string | null;
  hasReactions: boolean;
} => {
  const counts = new Map<string, number>();
  let firstReactionEmoji: string | null = null;

  message.reactions?.forEach((reaction) => {
    counts.set(reaction.key, (counts.get(reaction.key) ?? 0) + 1);
    firstReactionEmoji ??= reaction.key;
  });

  return {
    counts,
    firstReactionEmoji,
    hasReactions: counts.size > 0,
  };
};

const useChatReactionAnimations = (
  message: LiveRoomChatEntry,
): ChatReactionAnimationState => {
  const [reactionPulseSignals, setReactionPulseSignals] = useState<
    Map<string, number>
  >(() => new Map());
  const [firstReactionBurst, setFirstReactionBurst] =
    useState<FirstReactionBurstState | null>(null);
  const previousReactionCountsRef = useRef<Map<string, number>>(new Map());
  const previousHadReactionsRef = useRef(false);
  const hasInitializedReactionsRef = useRef(false);
  const firstReactionBurstTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    return () => {
      if (firstReactionBurstTimeoutRef.current) {
        clearTimeout(firstReactionBurstTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const { counts, firstReactionEmoji, hasReactions } =
      getReactionCounts(message);

    if (hasInitializedReactionsRef.current) {
      const newlyIncreased: string[] = [];
      counts.forEach((count, key) => {
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

      if (
        hasReactions &&
        !previousHadReactionsRef.current &&
        firstReactionEmoji
      ) {
        setFirstReactionBurst((current) => ({
          emoji: firstReactionEmoji,
          signal: (current?.signal ?? 0) + 1,
        }));

        if (firstReactionBurstTimeoutRef.current) {
          clearTimeout(firstReactionBurstTimeoutRef.current);
        }

        firstReactionBurstTimeoutRef.current = setTimeout(() => {
          setFirstReactionBurst(null);
          firstReactionBurstTimeoutRef.current = null;
        }, FIRST_REACTION_BURST_CLEAR_DELAY_MS);
      }
    }

    previousReactionCountsRef.current = counts;
    previousHadReactionsRef.current = hasReactions;
    hasInitializedReactionsRef.current = true;
  }, [message]);

  return {
    firstReactionBurst,
    getPulseSignal: (reactionKey) => reactionPulseSignals.get(reactionKey) ?? 0,
  };
};

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

interface LiveRoomChatReactionsProps {
  message: LiveRoomChatEntry;
  currentParticipantId: string | null;
  canChat: boolean;
  senderName: string;
  reactionBusy: string | null;
  onReactionAction: (
    messageId: string,
    reactionKey: string,
    analytics: ChatReactionAnalytics,
    shouldRemove?: boolean,
  ) => void;
}

export const LiveRoomChatReactions = ({
  message,
  currentParticipantId,
  canChat,
  senderName,
  reactionBusy,
  onReactionAction,
}: LiveRoomChatReactionsProps): ReactElement | null => {
  const { firstReactionBurst, getPulseSignal } =
    useChatReactionAnimations(message);
  const reactionGroups = getChatReactionGroups(message, currentParticipantId);
  const reactionKeys = new Set(reactionGroups.map((reaction) => reaction.key));
  const quickReactionKeys = LIVE_ROOM_QUICK_REACTION_EMOJIS.filter(
    (reactionKey) => !reactionKeys.has(reactionKey),
  ).slice(0, Math.max(0, MAX_REACTION_SLOTS - reactionGroups.length));
  const showQuickReactions = canChat && quickReactionKeys.length > 0;
  const hasActiveReactions = reactionGroups.length > 0;
  const baseReactionAnalytics = {
    activeReactionCount: reactionGroups.length,
    quickReactionCount: quickReactionKeys.length,
  };

  if (!canChat && reactionGroups.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames(
        'relative mt-1 flex flex-wrap items-center gap-1 transition-opacity',
        !hasActiveReactions
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
              reaction.isReactedByCurrentParticipant ? 'Remove' : 'React'
            } ${reaction.key} ${
              reaction.isReactedByCurrentParticipant ? 'reaction from' : 'to'
            } message from ${senderName}`}
            disabled={!canChat || !!reactionBusy}
            isSending={reactionBusy === reactionKey}
            pulseSignal={getPulseSignal(reaction.key)}
            onClick={() =>
              onReactionAction(
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
          key={hasActiveReactions ? 'active-reactions' : 'empty-reactions'}
          className={classNames(
            'flex flex-wrap items-center gap-1 transition-opacity',
            hasActiveReactions &&
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
                      onReactionAction(message.messageId, reactionKey, {
                        ...baseReactionAnalytics,
                        source: 'quick_shortcut',
                      })
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

              onReactionAction(message.messageId, reactionKey, {
                ...baseReactionAnalytics,
                source: 'custom_picker',
              });
            }}
            renderTrigger={({ isOpen, toggleOpen }) => (
              <Button
                type="button"
                size={ButtonSize.XSmall}
                variant={isOpen ? ButtonVariant.Primary : ButtonVariant.Float}
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
  );
};
