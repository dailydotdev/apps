import type { ComponentType, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  AddUserIcon,
  DiscussIcon,
  FeedbackIcon,
  PlayIcon,
  ShareIcon,
} from '../../../components/icons';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import { useGivebackContext } from '../GivebackContext';
import { usePrefersReducedMotion } from '../useGivebackMotion';
import { formatCompactNumber, formatDonationAmount } from '../utils';
import type { GivebackCommunityEvent } from '../types';
import { GivebackAvatar } from './GivebackContributorFaces';

// How often a new win streams to the top of the feed.
const STREAM_MS = 3600;

// Position-based "age" labels: the freshest row reads as "just now" and ages
// grow down the list. The mock has no real timestamps, so this keeps the wire
// believable as rows stream in without faking precise per-event times.
const AGE_LABELS = [
  'just now',
  '14s ago',
  '38s ago',
  '1m ago',
  '3m ago',
  '6m ago',
  '11m ago',
  '18m ago',
];

interface FeedVisual {
  Icon: ComponentType<IconProps>;
  tileClassName: string;
}

// Match each action to a real-action icon + accent so the feed reads like
// genuine platform activity rather than generic log lines.
const getVisual = (actionLabel: string): FeedVisual => {
  const text = actionLabel.toLowerCase();
  if (text.includes('video')) {
    return {
      Icon: PlayIcon,
      tileClassName: 'bg-accent-onion-flat text-accent-onion-default',
    };
  }
  if (
    text.includes('invite') ||
    text.includes('friend') ||
    text.includes('refer')
  ) {
    return {
      Icon: AddUserIcon,
      tileClassName: 'bg-accent-avocado-flat text-accent-avocado-default',
    };
  }
  if (text.includes('feedback') || text.includes('review')) {
    return {
      Icon: FeedbackIcon,
      tileClassName: 'bg-accent-bacon-flat text-accent-bacon-default',
    };
  }
  if (
    text.includes('tip') ||
    text.includes('post') ||
    text.includes('comment')
  ) {
    return {
      Icon: DiscussIcon,
      tileClassName: 'bg-accent-cheese-flat text-accent-cheese-default',
    };
  }
  return {
    Icon: ShareIcon,
    tileClassName: 'bg-accent-cabbage-flat text-accent-cabbage-default',
  };
};

const ActivityRow = ({
  event,
  ageLabel,
}: {
  event: GivebackCommunityEvent;
  ageLabel: string;
}): ReactElement => {
  const { Icon, tileClassName } = getVisual(event.actionLabel);

  return (
    <FlexRow className="items-center gap-3 py-3">
      {/* The person doing the action is the hero of the row — their face, with a
          small action-type badge so the wire still reads what kind of win it is. */}
      <span className="relative shrink-0">
        <GivebackAvatar src={event.actorAvatar} sizeClassName="size-10" />
        <span
          className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-background-default ${tileClassName}`}
        >
          <Icon size={IconSize.XXSmall} />
        </span>
      </span>

      <FlexCol className="min-w-0 flex-1 gap-0.5">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          className="min-w-0 truncate"
        >
          <span className="font-bold">{event.actorName}</span>{' '}
          <span className="text-text-secondary">{event.actionLabel}</span>
        </Typography>
        <FlexRow className="items-center gap-2">
          {event.causeName && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="min-w-0 truncate"
            >
              → {event.causeName}
            </Typography>
          )}
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Quaternary}
            className="shrink-0"
          >
            {ageLabel}
          </Typography>
        </FlexRow>
      </FlexCol>

      <Typography
        bold
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        className="shrink-0 tabular-nums text-status-success"
      >
        {event.amount
          ? `+${formatDonationAmount(event.amount, event.currency)}`
          : 'Love'}
      </Typography>
    </FlexRow>
  );
};

// The anonymized, live pulse of what the community is doing right now. Wins
// stream in from the top on a timer so the feed feels genuinely alive, while
// actor identities stay anonymized by default.
export const GivebackCommunityActivity = (): ReactElement => {
  const { communityEvents, communityRally, showCommunityFeed } =
    useGivebackContext();
  const reducedMotion = usePrefersReducedMotion();
  const [order, setOrder] = useState<GivebackCommunityEvent[]>(communityEvents);
  // Bumps on every stream tick so the new top row re-runs its entrance.
  const [streamKey, setStreamKey] = useState(0);

  useEffect(() => {
    setOrder(communityEvents);
  }, [communityEvents]);

  useEffect(() => {
    if (reducedMotion || !showCommunityFeed || communityEvents.length <= 1) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setOrder((prev) => {
        if (prev.length <= 1) {
          return prev;
        }
        const next = [...prev];
        const last = next.pop();
        return last ? [last, ...next] : next;
      });
      setStreamKey((key) => key + 1);
    }, STREAM_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, showCommunityFeed, communityEvents.length]);

  return (
    <FlexCol className="w-full gap-3">
      <Typography bold tag={TypographyTag.H3} type={TypographyType.Title3}>
        Live community activity
      </Typography>

      {showCommunityFeed && order.length ? (
        <>
          <FlexRow className="items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="bg-status-success/60 absolute inline-flex size-full rounded-full motion-safe:animate-glow-pulse" />
              <span className="relative inline-flex size-2 rounded-full bg-status-success" />
            </span>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              bold
              className="text-status-success"
            >
              {formatCompactNumber(communityRally.contributorsToday)}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              developers contributing right now
            </Typography>
          </FlexRow>

          <FlexCol className="divide-y divide-border-subtlest-tertiary">
            <div
              key={streamKey}
              className="motion-safe:animate-fade-slide-up"
              style={{ animationDelay: '0ms' }}
            >
              <ActivityRow event={order[0]} ageLabel={AGE_LABELS[0]} />
            </div>
            {order.slice(1).map((event, index) => (
              <ActivityRow
                key={event.id}
                event={event}
                ageLabel={AGE_LABELS[(index + 1) % AGE_LABELS.length]}
              />
            ))}
          </FlexCol>
        </>
      ) : (
        <FlexCol className="items-center gap-1 py-10 text-center">
          <Typography bold type={TypographyType.Callout}>
            Community feed hidden
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            Use the QA panel to show or hide anonymized community activity.
          </Typography>
        </FlexCol>
      )}
    </FlexCol>
  );
};
