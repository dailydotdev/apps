import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { addDays, isSameDay } from 'date-fns';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import Markdown from '../Markdown';
import { ContentEmbeds } from '../contentEmbeds/ContentEmbeds';
import {
  AppleIcon,
  ArrowIcon,
  BellIcon,
  CalendarIcon,
  DiscussIcon,
  GoogleIcon,
  MegaphoneIcon,
  MicrosoftIcon,
  ShareIcon,
  VIcon,
} from '../icons';
import { RaiseHandIcon } from '../icons/RaiseHand';
import { IconSize } from '../Icon';
import { MenuIcon } from '../MenuIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import type { MenuItemProps } from '../dropdown/common';
import type { LiveRoom as LiveRoomModel } from '../../graphql/liveRooms';
import {
  anchorDefaultRel,
  getPlainTextFromRichContent,
} from '../../lib/strings';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  downloadIcs,
  type AddToCalendarProvider,
  type CalendarEvent,
} from '../../lib/calendar';
import type { UserShortProfile } from '../../lib/user';

const padNumber = (value: number): string => value.toString().padStart(2, '0');

const STANDUP_DURATION_MINUTES = 20;

interface CountdownParts {
  hasDays: boolean;
  hasHours: boolean;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const getCountdownParts = (totalSeconds: number): CountdownParts => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return {
    hasDays: days > 0,
    hasHours: hours > 0 || days > 0,
    days: padNumber(days),
    hours: padNumber(hours),
    minutes: padNumber(minutes),
    seconds: padNumber(seconds),
  };
};

const buildStandupCalendarEvent = (
  room: LiveRoomModel,
  standupUrl: string,
): CalendarEvent | null => {
  if (!room.scheduledStart) {
    return null;
  }
  const start = new Date(room.scheduledStart);
  if (Number.isNaN(start.getTime())) {
    return null;
  }
  const end = new Date(start.getTime() + STANDUP_DURATION_MINUTES * 60 * 1000);
  const plainDescription = getPlainTextFromRichContent({
    html: room.descriptionHtml,
  });
  return {
    title: `daily.dev Standup: ${room.topic}`,
    description:
      plainDescription || `Join the standup on daily.dev: ${standupUrl}`,
    location: standupUrl,
    start,
    end,
    id: `standup-${room.id}`,
  };
};

const formatScheduledStart = (value: string): string => {
  const date = new Date(value);
  const now = new Date();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (isSameDay(date, now)) {
    return `Today at ${time}`;
  }
  if (isSameDay(date, addDays(now, 1))) {
    return `Tomorrow at ${time}`;
  }
  return `${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} at ${time}`;
};

interface LiveRoomLobbyProps {
  room: LiveRoomModel;
  lobbyCountdown: number;
  participantCount: number;
  showParticipantCount: boolean;
  canSubscribeToLobby: boolean;
  subscribed: boolean;
  subscriptionBusy: boolean;
  onToggleSubscription: () => void;
  isHost: boolean;
  onNavigateBack: (surface: string) => void;
  onShare: () => void;
  onAddToCalendar: (provider: AddToCalendarProvider) => void;
  audienceParticipantIds: string[];
  participantProfilesById: Map<string, UserShortProfile>;
  chatPanel: ReactNode;
  hostControls?: ReactNode;
}

const DigitTile = ({ char }: { char: string }): ReactElement => (
  <span
    aria-hidden="true"
    className={classNames(
      'relative flex items-center justify-center overflow-hidden',
      'h-14 w-10 rounded-10 border border-border-subtlest-tertiary bg-background-default',
      'tablet:h-20 tablet:w-14 tablet:rounded-12',
      'font-bold tabular-nums text-text-primary typo-title2 tablet:typo-mega3',
    )}
  >
    <span className="opacity-60 absolute inset-x-0 top-1/2 h-px bg-border-subtlest-tertiary" />
    {char}
  </span>
);

const SegmentSeparator = (): ReactElement => (
  <span
    aria-hidden="true"
    className="flex h-14 flex-col items-center justify-center gap-1.5 px-0.5 tablet:h-20 tablet:gap-2 tablet:px-1"
  >
    <span className="size-1 rounded-full bg-accent-bacon-default tablet:size-1.5" />
    <span className="size-1 rounded-full bg-accent-bacon-default tablet:size-1.5" />
  </span>
);

interface CountdownDisplayProps {
  parts: CountdownParts;
  ariaLabel: string;
}

const CountdownDisplay = ({
  parts,
  ariaLabel,
}: CountdownDisplayProps): ReactElement => {
  const segments = [
    ...(parts.hasDays
      ? [{ key: 'days', value: parts.days, label: 'Days' }]
      : []),
    ...(parts.hasHours
      ? [{ key: 'hours', value: parts.hours, label: 'Hours' }]
      : []),
    { key: 'minutes', value: parts.minutes, label: 'Minutes' },
    ...(parts.hasDays
      ? []
      : [{ key: 'seconds', value: parts.seconds, label: 'Seconds' }]),
  ];

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
      className="flex items-start gap-1.5 tablet:gap-3"
    >
      {segments.map((segment, index) => (
        <React.Fragment key={segment.key}>
          {index > 0 ? <SegmentSeparator /> : null}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1 tablet:gap-1.5">
              <DigitTile char={segment.value[0]} />
              <DigitTile char={segment.value[1]} />
            </div>
            <span className="font-bold uppercase tracking-[0.2em] text-text-tertiary typo-caption2">
              {segment.label}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

interface AudienceStackProps {
  profiles: UserShortProfile[];
  totalCount: number;
}

const AudienceStack = ({
  profiles,
  totalCount,
}: AudienceStackProps): ReactElement | null => {
  if (totalCount <= 0) {
    return null;
  }

  const visible = profiles.slice(0, 6);
  const overflow = Math.max(0, totalCount - visible.length);
  const word = totalCount === 1 ? 'person' : 'people';

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-12 bg-background-default px-4 py-3">
      {visible.length > 0 ? (
        <div className="flex items-center">
          {visible.map((profile, index) => (
            <ProfilePicture
              key={profile.id}
              user={profile}
              size={ProfileImageSize.Medium}
              className={classNames(
                'border-2 border-background-default',
                index > 0 && '-ml-3',
              )}
              nativeLazyLoading
            />
          ))}
          {overflow > 0 ? (
            <span className="-ml-3 inline-flex h-8 min-w-8 items-center justify-center rounded-10 border-2 border-background-default bg-accent-bacon-default px-2 font-bold tabular-nums text-white typo-caption1">
              +{overflow}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-col">
        <Typography type={TypographyType.Title3} bold className="tabular-nums">
          {`${totalCount} ${word} here right now`}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {totalCount === 1
            ? 'Be the welcoming committee. Say hi in chat.'
            : 'Say hi in chat while everyone gathers.'}
        </Typography>
      </div>
    </div>
  );
};

interface StepCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const StepCard = ({
  icon,
  title,
  description,
}: StepCardProps): ReactElement => (
  <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3 tablet:p-4">
    <span className="flex size-8 items-center justify-center rounded-10 bg-background-default text-accent-bacon-default">
      {icon}
    </span>
    <Typography type={TypographyType.Callout} bold>
      {title}
    </Typography>
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {description}
    </Typography>
  </div>
);

const SectionLabel = ({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <div className="flex items-center gap-2">
    {icon ? (
      <span className="flex size-7 items-center justify-center rounded-10 bg-background-default text-accent-bacon-default">
        {icon}
      </span>
    ) : null}
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="font-bold uppercase tracking-[0.18em]"
    >
      {children}
    </Typography>
  </div>
);

export const LiveRoomLobby = ({
  room,
  lobbyCountdown,
  participantCount,
  showParticipantCount,
  canSubscribeToLobby,
  subscribed,
  subscriptionBusy,
  onToggleSubscription,
  isHost,
  onNavigateBack,
  onShare,
  onAddToCalendar,
  audienceParticipantIds,
  participantProfilesById,
  chatPanel,
  hostControls,
}: LiveRoomLobbyProps): ReactElement => {
  const hasScheduledStart = !!room.scheduledStart;
  const isStartingNow = hasScheduledStart && lobbyCountdown <= 0;
  const countdownLabel = isStartingNow ? 'Starting any moment' : 'Goes live in';
  const countdownParts = getCountdownParts(lobbyCountdown);
  const hasEmbeds = !!room.contentEmbeds && room.contentEmbeds.length > 0;
  const standupFullUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return '';
    }
    return `${window.location.origin}/standups/${room.id}`;
  }, [room.id]);
  const calendarEvent =
    hasScheduledStart && standupFullUrl
      ? buildStandupCalendarEvent(room, standupFullUrl)
      : null;
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const calendarOptions: MenuItemProps[] = calendarEvent
    ? [
        {
          icon: <MenuIcon Icon={GoogleIcon} />,
          label: 'Google Calendar',
          action: () => onAddToCalendar('google'),
          anchorProps: {
            href: buildGoogleCalendarUrl(calendarEvent),
            target: '_blank',
            rel: anchorDefaultRel,
          },
        },
        {
          icon: <MenuIcon Icon={MicrosoftIcon} />,
          label: 'Outlook',
          action: () => onAddToCalendar('outlook'),
          anchorProps: {
            href: buildOutlookCalendarUrl(calendarEvent),
            target: '_blank',
            rel: anchorDefaultRel,
          },
        },
        {
          icon: <MenuIcon Icon={AppleIcon} />,
          label: 'Apple Calendar (.ics)',
          action: () => {
            onAddToCalendar('ics');
            downloadIcs(calendarEvent);
          },
        },
      ]
    : [];
  const audienceProfiles = audienceParticipantIds
    .map((id) => participantProfilesById.get(id))
    .filter((profile): profile is UserShortProfile => !!profile);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[1fr_auto] overflow-hidden tablet:grid-rows-none tablet:gap-3 laptop:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="relative flex min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-28 pt-3 tablet:px-1 tablet:pb-32 tablet:pt-0">
          <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 tablet:gap-6">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="-rotate-90" />}
                onClick={() => onNavigateBack('lobby_back')}
              >
                Back
              </Button>
            </div>

            <section
              aria-label="Standup countdown"
              className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
            >
              <div className="flex flex-col gap-5 p-5 tablet:gap-7 tablet:p-8">
                <div className="flex flex-col gap-3">
                  <Typography
                    type={TypographyType.Caption1}
                    className="font-bold uppercase tracking-[0.18em] text-accent-bacon-default"
                  >
                    daily.dev Standup
                  </Typography>
                  <Typography
                    tag={TypographyTag.H1}
                    type={TypographyType.LargeTitle}
                    bold
                    className="break-words"
                  >
                    {room.topic}
                  </Typography>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a
                      href={room.host.permalink}
                      target="_blank"
                      rel={anchorDefaultRel}
                      className="-m-1 inline-flex min-w-0 items-center gap-2 rounded-12 p-1 transition-colors hover:bg-surface-hover"
                    >
                      <ProfilePicture
                        user={room.host}
                        size={ProfileImageSize.Medium}
                      />
                      <div className="flex min-w-0 flex-col">
                        <Typography
                          type={TypographyType.Caption2}
                          color={TypographyColor.Tertiary}
                          className="font-bold uppercase tracking-[0.18em]"
                        >
                          Hosted by
                        </Typography>
                        <Typography
                          type={TypographyType.Footnote}
                          bold
                          truncate
                          className="min-w-0"
                        >
                          {room.host.name}
                        </Typography>
                      </div>
                    </a>
                    {hasScheduledStart ? (
                      <Typography
                        type={TypographyType.Footnote}
                        color={TypographyColor.Tertiary}
                        className="inline-flex items-center gap-1.5"
                      >
                        <CalendarIcon size={IconSize.XSmall} secondary />
                        {formatScheduledStart(room.scheduledStart as string)}
                      </Typography>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 tablet:gap-3">
                  {canSubscribeToLobby ? (
                    <Button
                      type="button"
                      variant={
                        subscribed
                          ? ButtonVariant.Secondary
                          : ButtonVariant.Primary
                      }
                      icon={
                        subscribed ? (
                          <VIcon
                            secondary
                            data-testid="standup-reminder-set-icon"
                          />
                        ) : (
                          <BellIcon data-testid="standup-remind-icon" />
                        )
                      }
                      loading={subscriptionBusy}
                      disabled={subscriptionBusy}
                      onClick={onToggleSubscription}
                    >
                      {subscribed ? 'Reminder set' : 'Remind me'}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant={ButtonVariant.Secondary}
                    icon={<ShareIcon />}
                    onClick={onShare}
                  >
                    Share
                  </Button>
                  {calendarEvent ? (
                    <DropdownMenu
                      open={calendarMenuOpen}
                      onOpenChange={setCalendarMenuOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant={ButtonVariant.Secondary}
                          icon={<CalendarIcon secondary />}
                        >
                          Add to calendar
                        </Button>
                      </DropdownMenuTrigger>
                      {calendarMenuOpen ? (
                        <DropdownMenuContent>
                          <DropdownMenuOptions options={calendarOptions} />
                        </DropdownMenuContent>
                      ) : null}
                    </DropdownMenu>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary pt-5 tablet:gap-5 tablet:pt-7">
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="font-bold uppercase tracking-[0.18em]"
                  >
                    {countdownLabel}
                  </Typography>

                  {hasScheduledStart ? (
                    <CountdownDisplay
                      parts={countdownParts}
                      ariaLabel={`${countdownLabel} ${
                        countdownParts.hasDays
                          ? `${countdownParts.days} days `
                          : ''
                      }${
                        countdownParts.hasHours
                          ? `${countdownParts.hours} hours `
                          : ''
                      }${countdownParts.minutes} minutes${
                        countdownParts.hasDays
                          ? ''
                          : ` ${countdownParts.seconds} seconds`
                      }`}
                    />
                  ) : (
                    <Typography
                      type={TypographyType.Title2}
                      bold
                      color={TypographyColor.Primary}
                    >
                      Awaiting host
                    </Typography>
                  )}

                  {showParticipantCount && participantCount > 0 ? (
                    <AudienceStack
                      profiles={audienceProfiles}
                      totalCount={participantCount}
                    />
                  ) : null}
                </div>

                {isHost ? (
                  <div className="bg-accent-bacon-bolder/5 rounded-12 border border-dashed border-accent-bacon-subtler px-3 py-2 text-text-secondary typo-footnote">
                    You&apos;re the host. When you&apos;re ready, tap{' '}
                    <span className="font-bold text-text-primary">Go live</span>{' '}
                    from the controls below to start streaming.
                  </div>
                ) : null}
              </div>
            </section>

            <section
              aria-label="What we'll cover"
              className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-5"
            >
              <SectionLabel>What we&apos;ll cover</SectionLabel>
              {room.descriptionHtml ? (
                <Markdown
                  content={room.descriptionHtml}
                  className="break-words text-text-primary"
                  openLinksInNewTab
                />
              ) : (
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Tertiary}
                >
                  The host hasn&apos;t shared an agenda yet. Drop into the chat
                  to ask what&apos;s on the docket.
                </Typography>
              )}
              {hasEmbeds ? (
                <ContentEmbeds embeds={room.contentEmbeds} variant="post" />
              ) : null}
            </section>

            <section
              aria-label="First standup?"
              className="flex flex-col gap-3"
            >
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="px-1 font-bold uppercase tracking-[0.18em]"
              >
                First standup?
              </Typography>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
                <StepCard
                  icon={<MegaphoneIcon size={IconSize.Small} secondary />}
                  title="Tune in live"
                  description="Engineers thinking out loud, unscripted. Drop in any time the room is live and follow the conversation in real time."
                />
                <StepCard
                  icon={<RaiseHandIcon size={IconSize.Small} secondary />}
                  title="Take the mic"
                  description="The best discussions need your voice. Raise your hand and the host can invite you on stage with mic and camera."
                />
                <StepCard
                  icon={<DiscussIcon size={IconSize.Small} secondary />}
                  title="Bring your questions"
                  description="Chat runs the whole standup. Ask anything, share a link, drop a reaction. The host weaves the best stuff into the room."
                />
              </div>
            </section>
          </div>
        </div>
        {hostControls}
      </div>

      <aside
        aria-label="Lobby chat"
        className="flex h-[40dvh] min-h-0 flex-col overflow-hidden rounded-none border-x-0 border-b-0 border-t border-border-subtlest-tertiary bg-background-subtle tablet:h-auto tablet:rounded-16 tablet:border tablet:border-border-subtlest-tertiary"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-3 py-2 tablet:px-4 tablet:py-3">
          <div className="flex items-center gap-2">
            <DiscussIcon
              size={IconSize.Small}
              secondary
              className="text-accent-bacon-default"
            />
            <Typography type={TypographyType.Callout} bold>
              Lobby chat
            </Typography>
          </div>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Say hi while you wait
          </Typography>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{chatPanel}</div>
      </aside>
    </div>
  );
};
