import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Separator } from '../cards/common/common';

interface LiveRoomHeaderProps {
  title: string;
  isLive: boolean;
  isCreated: boolean;
  scheduledStart?: string | null;
  streamDuration: number;
  lobbyCountdown: number;
  participantCount: number;
  showParticipantCount: boolean;
  canSubscribeToLobby: boolean;
  subscribed: boolean;
  subscriptionBusy: boolean;
  onToggleSubscription: () => void;
}

const formatStreamDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};

const AnimatedCount = ({ value }: { value: number }): ReactElement => (
  <span key={value} className="live-room-count-bump tabular-nums">
    {value}
  </span>
);

const LiveBadge = ({ isLive }: { isLive: boolean }): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1 rounded-8 px-1.5 py-px typo-caption2 tablet:gap-1.5 tablet:px-2 tablet:py-0.5 tablet:typo-caption1',
      isLive
        ? 'bg-accent-ketchup-default text-white'
        : 'bg-accent-bacon-default text-white',
    )}
  >
    <span className="size-1 animate-pulse rounded-full bg-white tablet:size-1.5" />
    <span className="font-bold uppercase tracking-wide">
      {isLive ? 'Live' : 'Lobby'}
    </span>
  </span>
);

export const LiveRoomHeader = ({
  title,
  isLive,
  isCreated,
  scheduledStart,
  streamDuration,
  lobbyCountdown,
  participantCount,
  showParticipantCount,
  canSubscribeToLobby,
  subscribed,
  subscriptionBusy,
  onToggleSubscription,
}: LiveRoomHeaderProps): ReactElement => (
  <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-none border-x-0 border-b border-t-0 border-border-subtlest-tertiary bg-surface-float px-3 py-1.5 tablet:gap-x-4 tablet:gap-y-2 tablet:rounded-16 tablet:border-x tablet:border-t tablet:px-4 tablet:py-3">
    <div className="flex min-w-0 items-center gap-3">
      <LiveBadge isLive={isLive} />
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Title3}
        bold
        truncate
        className="min-w-0"
      >
        {title}
      </Typography>
    </div>
    <div className="flex flex-wrap items-center justify-end gap-3 text-text-tertiary typo-caption1">
      {canSubscribeToLobby ? (
        <Button
          type="button"
          size={ButtonSize.Small}
          variant={subscribed ? ButtonVariant.Secondary : ButtonVariant.Primary}
          loading={subscriptionBusy}
          disabled={subscriptionBusy}
          onClick={onToggleSubscription}
        >
          {subscribed ? 'Unsubscribe' : 'Notify me'}
        </Button>
      ) : null}
      {showParticipantCount || scheduledStart ? (
        <span className="inline-flex flex-wrap items-center">
          {isLive ? (
            <span className="font-bold tabular-nums text-text-primary">
              {formatStreamDuration(streamDuration)}
            </span>
          ) : null}
          {isCreated && scheduledStart ? (
            <span className="inline-flex items-center gap-1.5">
              <span>Starting in</span>
              <span className="font-bold tabular-nums text-text-primary">
                {formatStreamDuration(lobbyCountdown)}
              </span>
            </span>
          ) : null}
          {showParticipantCount && (isLive || (isCreated && scheduledStart)) ? (
            <Separator className="mx-2" />
          ) : null}
          {showParticipantCount ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-bold text-text-primary">
                <AnimatedCount value={participantCount} />
              </span>
              <span>watching</span>
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  </header>
);
