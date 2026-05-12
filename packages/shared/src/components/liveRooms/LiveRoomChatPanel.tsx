import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import Markdown from '../Markdown';
import RichTextInput, { type RichTextInputRef } from '../fields/RichTextInput';
import { Drawer } from '../drawers';
import { RootPortal } from '../tooltips/Portal';
import { EmojiPicker } from '../fields/EmojiPicker';
import { LIVE_ROOM_QUICK_REACTION_EMOJIS } from '../../lib/liveRoom/reactions';
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
  SendAirplaneIcon,
  TrashIcon,
} from '../icons';
import { IconSize } from '../Icon';
import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import { useViewSize, ViewSize } from '../../hooks';
import { useTouchLongPress } from '../../hooks/useTouchLongPress';
import { chatMarkdownToHtml } from '../../lib/liveRoom/chatMarkdown';
import type { UserShortProfile } from '../../lib/user';
import {
  buildParticipantProfile,
  userDisplayName,
} from './liveRoomParticipants';
import {
  LiveRoomChatReactions,
  getChatReactionGroups,
  type ChatReactionAnalytics,
} from './LiveRoomChatReactions';

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
  const isTablet = useViewSize(ViewSize.Tablet);

  let disabledReason = 'The host disabled your chat access.';
  if (!isLoggedIn) {
    disabledReason = 'Sign in to join the chat.';
  } else if (isEnded) {
    disabledReason = 'Chat has ended for this standup.';
  } else if (!isLive) {
    disabledReason = 'Join the lobby to chat before the standup goes live.';
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
      <div className="border-t border-border-subtlest-tertiary p-1.5 pb-safe-offset-1.5 pl-safe-offset-1.5 pr-safe-offset-1.5 tablet:p-2.5">
        <div className="flex flex-col gap-2 rounded-12 border border-dashed border-border-subtlest-tertiary px-2 py-1.5 tablet:px-3 tablet:py-2.5">
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
    <div className="border-t border-border-subtlest-tertiary pt-1.5 pb-safe-offset-2 pl-safe-offset-1.5 pr-safe-offset-2 tablet:p-0">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(draft).catch(() => undefined);
        }}
      >
        <RichTextInput
          ref={inputRef}
          className={{
            container:
              '!flex-row !items-end !gap-1 !rounded-none !bg-transparent tablet:!flex-col tablet:!items-stretch tablet:!gap-0 [&>*:first-child]:min-w-0',
            input:
              'max-h-[2.75rem] overflow-y-auto break-words !p-1.5 tablet:max-h-none tablet:overflow-visible tablet:!p-2.5 [&_.ProseMirror]:!min-h-[1.5rem] tablet:[&_.ProseMirror]:!min-h-[6rem]',
          }}
          showUserAvatar={false}
          submitCopy="Send"
          isLoading={isSending}
          maxInputLength={1000}
          allowBlockFormatting={false}
          hideToolbar={!isTablet}
          minHeightClassName="min-h-[2rem] tablet:min-h-[3rem]"
          mentionSuggestions={mentionSuggestions}
          markdownToHtml={chatMarkdownToHtml}
          enabledCommand={{
            [MarkdownCommand.Upload]: true,
            [MarkdownCommand.Mention]: true,
            [MarkdownCommand.Emoji]: true,
            [MarkdownCommand.Gif]: true,
          }}
          textareaProps={{
            name: 'chat-message',
            placeholder: 'Write a message',
            rows: isTablet ? 2 : 1,
          }}
          footer={
            isTablet ? undefined : (
              <Button
                type="submit"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                icon={<SendAirplaneIcon />}
                aria-label="Send"
                disabled={isSending || !draft.trim()}
                loading={isSending}
              />
            )
          }
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

const CHAT_AUTO_SCROLL_BOTTOM_THRESHOLD_PX = 32;
const CHAT_AUTO_SCROLL_IDLE_MS = 150;

const getDistanceFromBottom = (scrollContainer: HTMLDivElement): number =>
  scrollContainer.scrollHeight -
  scrollContainer.scrollTop -
  scrollContainer.clientHeight;

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
  const isUserScrollingRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);
  const pendingAutoScrollRef = useRef(false);
  const autoScrollFrameRef = useRef<number | null>(null);
  const releaseProgrammaticScrollRef = useRef<number | null>(null);
  const scrollIdleTimeoutRef = useRef<number | null>(null);
  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [reactionBusyKeys, setReactionBusyKeys] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const isTablet = useViewSize(ViewSize.Tablet);
  const isMobile = !isTablet;
  const [pickerMessageId, setPickerMessageId] = useState<string | null>(null);
  const longPressHandlers = useTouchLongPress<string>({
    enabled: isMobile && canChat,
    onLongPress: (messageId) => {
      window.getSelection()?.removeAllRanges();
      setPickerMessageId(messageId);
    },
  });

  const pickerMessage = pickerMessageId
    ? chatMessages.find((m) => m.messageId === pickerMessageId) ?? null
    : null;
  const pickerReactionKeysSet = new Set(
    pickerMessage
      ? getChatReactionGroups(pickerMessage, currentParticipantId).map(
          (r) => r.key,
        )
      : [],
  );
  const pickerQuickReactionKeys = LIVE_ROOM_QUICK_REACTION_EMOJIS.filter(
    (key) => !pickerReactionKeysSet.has(key),
  );
  const pickerBaseAnalytics = {
    activeReactionCount: pickerReactionKeysSet.size,
    quickReactionCount: pickerQuickReactionKeys.length,
  };

  const closePicker = (): void => setPickerMessageId(null);

  useEffect(() => {
    if (pickerMessageId && !pickerMessage) {
      closePicker();
    }
  }, [pickerMessage, pickerMessageId]);

  const clearScheduledAutoScroll = useCallback((): void => {
    if (autoScrollFrameRef.current !== null) {
      cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const scrollToBottom = useCallback((): void => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return;
    }

    if (releaseProgrammaticScrollRef.current !== null) {
      cancelAnimationFrame(releaseProgrammaticScrollRef.current);
    }

    isProgrammaticScrollRef.current = true;
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    shouldAutoScrollRef.current = true;
    pendingAutoScrollRef.current = false;

    releaseProgrammaticScrollRef.current = requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
      releaseProgrammaticScrollRef.current = null;
    });
  }, []);

  const scheduleAutoScroll = useCallback((): void => {
    if (!shouldAutoScrollRef.current) {
      pendingAutoScrollRef.current = false;
      return;
    }

    if (isUserScrollingRef.current) {
      pendingAutoScrollRef.current = true;
      return;
    }

    clearScheduledAutoScroll();
    autoScrollFrameRef.current = requestAnimationFrame(() => {
      autoScrollFrameRef.current = requestAnimationFrame(() => {
        autoScrollFrameRef.current = null;
        if (!shouldAutoScrollRef.current || isUserScrollingRef.current) {
          pendingAutoScrollRef.current = shouldAutoScrollRef.current;
          return;
        }

        scrollToBottom();
      });
    });
  }, [clearScheduledAutoScroll, scrollToBottom]);

  const finishUserScroll = useCallback((): void => {
    isUserScrollingRef.current = false;
    scrollIdleTimeoutRef.current = null;

    if (pendingAutoScrollRef.current && shouldAutoScrollRef.current) {
      scheduleAutoScroll();
    }
  }, [scheduleAutoScroll]);

  useEffect(() => {
    scheduleAutoScroll();
  }, [chatMessages, scheduleAutoScroll]);

  useEffect(
    () => () => {
      clearScheduledAutoScroll();
      if (releaseProgrammaticScrollRef.current !== null) {
        cancelAnimationFrame(releaseProgrammaticScrollRef.current);
      }
      if (scrollIdleTimeoutRef.current !== null) {
        clearTimeout(scrollIdleTimeoutRef.current);
      }
    },
    [clearScheduledAutoScroll],
  );

  const handleScroll = (): void => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return;
    }

    shouldAutoScrollRef.current =
      getDistanceFromBottom(scrollContainer) <
      CHAT_AUTO_SCROLL_BOTTOM_THRESHOLD_PX;

    if (!shouldAutoScrollRef.current) {
      pendingAutoScrollRef.current = false;
    }

    if (isProgrammaticScrollRef.current) {
      return;
    }

    isUserScrollingRef.current = true;
    if (scrollIdleTimeoutRef.current !== null) {
      clearTimeout(scrollIdleTimeoutRef.current);
    }

    scrollIdleTimeoutRef.current = window.setTimeout(
      finishUserScroll,
      CHAT_AUTO_SCROLL_IDLE_MS,
    );
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
    if (reactionBusyKeys.includes(key) || !canChat) {
      return;
    }

    setReactionBusyKeys((current) => [...current, key]);
    const action = shouldRemove
      ? onRemoveMessageReaction
      : onSendMessageReaction;
    action(messageId, reactionKey, analytics)
      .catch(() => undefined)
      .finally(() =>
        setReactionBusyKeys((current) =>
          current.filter((busyKey) => busyKey !== key),
        ),
      );
  };

  const applyLongPressReaction = (
    reactionKey: string,
    source: 'long_press_quick' | 'long_press_picker',
  ): void => {
    if (!pickerMessageId) {
      return;
    }
    runReactionAction(pickerMessageId, reactionKey, {
      ...pickerBaseAnalytics,
      source,
    });
    closePicker();
  };

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        data-testid="live-room-chat-scroll"
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2"
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
              {isLive
                ? 'Chat is live and messages disappear when the standup ends.'
                : 'Chat is available while everyone waits in the lobby.'}
            </Typography>
          </div>
        ) : (
          chatMessages.map((message, messageIndex) => {
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
            const senderName = userDisplayName(sender);

            return (
              <article
                key={message.messageId}
                className={classNames(
                  'group relative flex items-start gap-2 px-1 py-1',
                  isMobile && 'select-none [-webkit-touch-callout:none]',
                )}
                onTouchStart={(event) =>
                  longPressHandlers.onTouchStart(event, message.messageId)
                }
                onTouchEnd={longPressHandlers.onTouchEnd}
                onTouchMove={longPressHandlers.onTouchMove}
                onTouchCancel={longPressHandlers.onTouchCancel}
                onContextMenu={(event) => {
                  if (isMobile) {
                    event.preventDefault();
                  }
                }}
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
                      openLinksInNewTab
                    />
                  </div>
                  <LiveRoomChatReactions
                    message={message}
                    currentParticipantId={currentParticipantId}
                    canChat={canChat}
                    senderName={senderName}
                    reactionBusyKeys={reactionBusyKeys}
                    hideQuickReactions={isMobile}
                    floatingTrayPlacement={
                      messageIndex === 0 ? 'below' : 'above'
                    }
                    onReactionAction={runReactionAction}
                  />
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
      <RootPortal>
        <Drawer
          isOpen={!!pickerMessageId}
          onClose={closePicker}
          title="Add reaction"
          displayCloseButton={false}
          className={{
            wrapper: '!overflow-hidden',
            title: 'sticky top-0 z-1 bg-background-default',
          }}
        >
          <div className="overflow-y-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-2">
              {pickerQuickReactionKeys.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Float}
                  aria-label={`React ${emoji}`}
                  onClick={() =>
                    applyLongPressReaction(emoji, 'long_press_quick')
                  }
                >
                  <span className="text-base leading-none">{emoji}</span>
                </Button>
              ))}
              <EmojiPicker
                value=""
                label={null}
                className="shrink-0"
                onChange={(reactionKey) => {
                  if (!reactionKey) {
                    return;
                  }
                  applyLongPressReaction(reactionKey, 'long_press_picker');
                }}
                renderTrigger={({ isOpen, toggleOpen }) => (
                  <Button
                    type="button"
                    size={ButtonSize.Small}
                    variant={
                      isOpen ? ButtonVariant.Primary : ButtonVariant.Float
                    }
                    icon={<PlusIcon />}
                    aria-label="Custom reaction"
                    aria-expanded={isOpen}
                    onClick={toggleOpen}
                  />
                )}
              />
            </div>
          </div>
        </Drawer>
      </RootPortal>
    </div>
  );
};
