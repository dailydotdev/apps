import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexRow } from '../../../components/utilities';
import { useGivebackContext } from '../GivebackContext';
import { usePrefersReducedMotion } from '../useGivebackMotion';
import { formatDonationAmount } from '../utils';

// Playful, fabricated "seconds ago" labels so the strip reads as a live wire of
// wins (the mock has no real timestamps). The cadence climbs then resets, which
// keeps the casino-style "it's happening right now" energy.
const TIME_LABELS = ['just now', '6s ago', '14s ago', '27s ago', '48s ago'];

const ROTATE_MS = 3200;

// A constantly-moving "win wire" of anonymized community wins. Borrowed from the
// casino/arcade playbook: visible momentum + social proof + a little FOMO, right
// at the top of the action hub so the community is the first thing you feel.
export const GivebackLiveTicker = (): ReactElement | null => {
  const { communityEvents } = useGivebackContext();
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  const total = communityEvents.length;

  useEffect(() => {
    if (reducedMotion || total <= 1) {
      return undefined;
    }
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % total),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion, total]);

  if (!total) {
    return null;
  }

  const event = communityEvents[index % total];
  const timeLabel = TIME_LABELS[index % TIME_LABELS.length];

  return (
    <FlexRow className="relative items-center gap-3 overflow-hidden">
      <FlexRow className="shrink-0 items-center gap-1.5">
        <span className="relative flex size-2">
          <span className="bg-status-success/60 absolute inline-flex size-full rounded-full motion-safe:animate-glow-pulse" />
          <span className="relative inline-flex size-2 rounded-full bg-status-success" />
        </span>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          bold
          className="uppercase tracking-wider text-status-success"
        >
          Live
        </Typography>
      </FlexRow>

      <span
        aria-hidden
        className="h-4 w-px shrink-0 bg-border-subtlest-tertiary"
      />

      <FlexRow
        key={`${event.id}-${index}`}
        className="min-w-0 flex-1 items-center gap-2 motion-safe:animate-fade-slide-up"
        style={{ animationDelay: '0ms' }}
      >
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="min-w-0 truncate"
        >
          <span className="font-bold text-text-primary">
            {event.actorLabel}
          </span>{' '}
          {event.actionLabel}
          {event.causeName && (
            <>
              {' '}
              for{' '}
              <span className="font-bold text-text-primary">
                {event.causeName}
              </span>
            </>
          )}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          color={TypographyColor.Quaternary}
          className="shrink-0"
        >
          {timeLabel}
        </Typography>
      </FlexRow>

      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        bold
        className="shrink-0 tabular-nums text-status-success"
      >
        {event.amount
          ? `+${formatDonationAmount(event.amount, event.currency)}`
          : 'Love'}
      </Typography>
    </FlexRow>
  );
};
