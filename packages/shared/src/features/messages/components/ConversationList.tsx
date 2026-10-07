import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FlexCol } from '../../../components/utilities';
import Link from '../../../components/utilities/Link';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { publishTimeRelativeShort } from '../../../lib/dateFormat';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { webappUrl } from '../../../lib/constants';
import { dmConversationsQueryOptions } from '../queries';
import type { DmConversation } from '../types';
import { getMessagePreview } from '../media';

const ConversationRow = ({
  conversation: { peer, lastMessage, unreadCount },
  isActive,
  isMine,
}: {
  conversation: DmConversation;
  isActive: boolean;
  isMine: boolean;
}): ReactElement => {
  const isUnread = unreadCount > 0 && !isActive;

  return (
    <Link href={`${webappUrl}messages/${peer.id}`} passHref>
      <a
        aria-current={isActive ? 'page' : undefined}
        className={classNames(
          'flex items-center gap-3 rounded-12 px-3 py-2.5 transition-colors hover:bg-surface-hover',
          isActive && 'bg-surface-float',
        )}
      >
        <ProfilePicture
          user={peer}
          size={ProfileImageSize.Large}
          nativeLazyLoading
        />
        <FlexCol className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <Typography
              type={TypographyType.Callout}
              bold={isUnread}
              truncate
              className="flex-1"
            >
              {peer.name}
            </Typography>
            <Typography
              tag={TypographyTag.Time}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="shrink-0"
              dateTime={lastMessage.createdAt}
            >
              {publishTimeRelativeShort(lastMessage.createdAt)}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={
                isUnread ? TypographyColor.Primary : TypographyColor.Tertiary
              }
              truncate
              className="flex-1"
            >
              {isMine && 'You: '}
              {getMessagePreview(lastMessage.body)}
            </Typography>
            {isUnread && (
              <span
                aria-label={`${unreadCount} unread`}
                className="size-2 shrink-0 rounded-full bg-accent-cabbage-default"
              />
            )}
          </div>
        </FlexCol>
      </a>
    </Link>
  );
};

export const ConversationList = ({
  activePeerId,
  onNewMessage,
}: {
  activePeerId?: string;
  onNewMessage?: () => void;
}): ReactElement => {
  const { user } = useAuthContext();
  const {
    data: conversations,
    isPending,
    isError,
    refetch,
  } = useQuery(dmConversationsQueryOptions(user));

  if (isError) {
    return (
      <FlexCol className="items-center gap-3 px-6 py-10 text-center">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Couldn&apos;t load your messages.
        </Typography>
        <Button
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </FlexCol>
    );
  }

  if (isPending) {
    return (
      <FlexCol className="gap-2 px-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-12 bg-surface-float"
          />
        ))}
      </FlexCol>
    );
  }

  if (!conversations?.length) {
    return (
      <FlexCol className="items-center gap-1 px-6 py-10 text-center">
        <Typography type={TypographyType.Callout} bold>
          No messages yet
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Find a developer to message, or start from anyone&apos;s profile.
        </Typography>
        {onNewMessage && (
          <Button
            className="mt-3"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={onNewMessage}
          >
            Start a conversation
          </Button>
        )}
      </FlexCol>
    );
  }

  return (
    <nav aria-label="Conversations" className="flex flex-col gap-0.5 px-2">
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.peer.id}
          conversation={conversation}
          isActive={conversation.peer.id === activePeerId}
          isMine={conversation.lastMessage.senderId === user?.id}
        />
      ))}
    </nav>
  );
};
