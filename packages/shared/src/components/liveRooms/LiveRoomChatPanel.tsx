import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
  TrashIcon,
} from '../icons';
import { IconSize } from '../Icon';
import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import { MarkdownCommand } from '../../hooks/input/useMarkdownInput';
import { chatMarkdownToHtml } from '../../lib/liveRoom/chatMarkdown';
import type { UserShortProfile } from '../../lib/user';
import {
  buildParticipantProfile,
  userDisplayName,
} from './liveRoomParticipants';

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

export const LiveRoomChatPanel = ({
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
