import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { Origin } from '../../../lib/log';
import { Button } from '../../../components/buttons/Button';
import { ButtonVariant } from '../../../components/buttons/common';
import Link from '../../../components/utilities/Link';
import { GoBackButton } from '../../../components/post/GoBackHeaderMobile';
import { useAgentShellHeight } from '../../interests/shell';
import { ChatRoomStatus } from '../graphql';
import { chatRoomQueryOptions } from '../queries';
import { useLiveChatEnabled } from '../hooks/useLiveChatEnabled';
import { formatEndsIn, formatOccupants } from '../timeLeft';
import { LiveChatPanel } from './LiveChatPanel';
import { LiveDot } from './LiveDot';

// A word in the middle of the screen, for the states that have no chat to
// show: the room is gone, or the viewer is not in yet.
const Notice = ({
  title,
  children,
}: {
  title: string;
  children?: ReactElement | string;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
    <p className="font-bold text-text-primary typo-title3">{title}</p>
    {children}
  </div>
);

/**
 * A topic chat on its own page: what it is about up top, the chat below,
 * filling the rest of the screen. Landing here is the yes, so a signed-in
 * reader is seated and joined right away; a visitor is asked to sign in.
 */
export const TopicChatScreen = ({
  roomId,
}: {
  roomId: string;
}): ReactElement => {
  const { user, isAuthReady, showLogin } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  // The bottom bar leaves on this route; the composer takes its place.
  const shellHeight = useAgentShellHeight(false, false);
  const { data: room, isPending } = useQuery(
    chatRoomQueryOptions(user, roomId),
  );
  const isOpen = room?.status === ChatRoomStatus.Active;
  const meta = [
    formatOccupants(room?.occupantCount),
    formatEndsIn(room?.expiresAt),
    'nothing is saved',
  ]
    .filter(Boolean)
    .join(' · ');

  let body: ReactElement | null = null;
  if (isPending || !isAuthReady) {
    body = null;
  } else if (!room) {
    body = (
      <Notice title="This chat doesn't exist">
        <Link href="/" passHref>
          <Button tag="a" href="/" variant={ButtonVariant.Primary}>
            Back to the feed
          </Button>
        </Link>
      </Notice>
    );
  } else if (!isOpen) {
    body = (
      <Notice title="This chat has ended">
        <Link href="/" passHref>
          <Button tag="a" href="/" variant={ButtonVariant.Primary}>
            Back to the feed
          </Button>
        </Link>
      </Notice>
    );
  } else if (!user) {
    body = (
      <Notice title="Sign in to join the chat">
        <Button
          variant={ButtonVariant.Primary}
          onClick={() => showLogin({ trigger: AuthTriggers.LiveChat })}
        >
          Sign in
        </Button>
      </Notice>
    );
  } else if (!isEnabled) {
    body = <Notice title="Live chat isn't on for you yet" />;
  } else {
    body = (
      <LiveChatPanel
        roomId={roomId}
        origin={Origin.LiveChatPage}
        canStart={false}
        variant="page"
        joinOnOpen
        className="flex-1"
      />
    );
  }

  return (
    <div
      className={classNames(
        'mx-auto flex w-full min-w-0 max-w-[48rem] flex-col laptop:border-x laptop:border-border-subtlest-tertiary',
        shellHeight,
      )}
    >
      <header className="flex shrink-0 flex-col gap-1 border-b border-border-subtlest-tertiary px-4 py-3">
        <div className="flex items-center gap-2">
          <GoBackButton showLogo={false} fallbackPath="/" className="-ml-2" />
          <LiveDot isLive={isOpen} />
          <span
            className={classNames(
              'font-bold typo-caption1',
              isOpen ? 'text-brand-default' : 'text-text-tertiary',
            )}
          >
            {isOpen ? 'Live chat' : 'Live chat ended'}
          </span>
          {isOpen && meta && (
            <span className="min-w-0 truncate text-text-tertiary typo-caption1">
              <span aria-hidden>· </span>
              {meta}
            </span>
          )}
        </div>
        {room && (
          <>
            <h1 className="break-words font-bold text-text-primary typo-title3">
              {room.title}
            </h1>
            {room.description && (
              <p className="break-words text-text-secondary typo-callout">
                {room.description}
              </p>
            )}
          </>
        )}
      </header>
      {body}
    </div>
  );
};
