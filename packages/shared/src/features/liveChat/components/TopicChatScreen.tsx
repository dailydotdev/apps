import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { AuthTriggers } from '../../../lib/auth';
import { LogEvent, Origin, TargetType } from '../../../lib/log';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { useLiveChatModeration } from '../hooks/useLiveChatModeration';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import Link from '../../../components/utilities/Link';
import { GoBackButton } from '../../../components/post/GoBackHeaderMobile';
import { ShellPage } from '../../../components/shell/ShellPageContext';
import { useAgentShellHeight } from '../../interests/shell';
import { ChatRoomStatus } from '../graphql';
import { chatRoomQueryOptions } from '../queries';
import { isDmAvailable } from '../../messages/transport';
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
 *
 * The page does not ask the live chat flag: the go-live push reaches every
 * active reader, and this page is all a topic room has, so a reader who
 * followed the push is in. The flag keeps gating the feed surfaces that
 * lead here on their own.
 */
export const TopicChatScreen = ({
  roomId,
}: {
  roomId: string;
}): ReactElement => {
  const { user, isAuthReady, showLogin } = useAuthContext();
  // The bottom bar leaves on this route; the composer takes its place.
  const shellHeight = useAgentShellHeight(false, false);
  const {
    data: room,
    isPending,
    isError,
    refetch,
  } = useQuery(chatRoomQueryOptions(user, roomId));
  const isOpen = room?.status === ChatRoomStatus.Active;
  const canModerate = !!user?.isTeamMember;
  const { end: endChat } = useLiveChatModeration({
    roomId,
    origin: Origin.LiveChatPage,
  });
  // The funnel's "opened" step. The push tags its link, so an open from it
  // is told apart from a link pasted somewhere; the feed rows log their own
  // click before the page loads.
  const router = useRouter();
  const cameFromPush = router?.query?.utm_medium === 'push';
  useLogEventOnce(
    () => ({
      event_name: LogEvent.OpenLiveChat,
      target_type: TargetType.ChatRoom,
      target_id: roomId,
      extra: JSON.stringify({
        origin: cameFromPush ? Origin.Push : Origin.DirectLink,
        utm_campaign: router?.query?.utm_campaign,
      }),
    }),
    { condition: !!router?.isReady && !!room },
  );
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
  } else if (isError && !room) {
    // A failed read is not a missing room; someone in from the push gets
    // another go rather than a dead end.
    body = (
      <Notice title="Couldn't load this chat">
        <Button variant={ButtonVariant.Primary} onClick={() => refetch()}>
          Try again
        </Button>
      </Notice>
    );
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
  } else if (!isDmAvailable) {
    body = (
      <Notice title="Live chat isn't available in this app yet">
        <Link href="/" passHref>
          <Button tag="a" href="/" variant={ButtonVariant.Primary}>
            Back to the feed
          </Button>
        </Link>
      </Notice>
    );
  } else {
    body = (
      <LiveChatPanel
        roomId={roomId}
        origin={Origin.LiveChatPage}
        canStart={false}
        canModerate={canModerate}
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
      {/* On phones the shell's top block already has a back square, so the
          page's own back shows from tablet up and the block carries the name. */}
      <ShellPage title="Live chat" />
      <header className="flex shrink-0 flex-col gap-1 border-b border-border-subtlest-tertiary px-4 py-3">
        <div className="flex items-center gap-2">
          <GoBackButton
            showLogo={false}
            fallbackPath="/"
            className="-ml-2 hidden tablet:flex"
          />
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
          {canModerate && isOpen && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              className="-mr-2 ml-auto shrink-0"
              onClick={() => endChat()}
            >
              End chat
            </Button>
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
