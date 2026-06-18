import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { VIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import usePersistentContext from '../../hooks/usePersistentContext';
import type { Vote } from './DailyFeedback';
import { DailyFeedback } from './DailyFeedback';

type StoredFeedback = { date: string; vote: Vote };

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const formatTomorrow = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(9, 0, 0, 0);
  return t.toLocaleString(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const CoverClosing = (): ReactElement => {
  const tomorrow = useMemo(formatTomorrow, []);
  const { logEvent } = useLogContext();
  const [storedFeedback, setStoredFeedback] =
    usePersistentContext<StoredFeedback | null>('daily_feedback', null);
  const todaysVote =
    storedFeedback?.date === todayKey() ? storedFeedback.vote : null;

  return (
    <section
      aria-label="End of your Daily"
      className="flex flex-col items-center gap-3 py-6 text-center"
    >
      <DailyFeedback
        prompt="Was today's Daily useful?"
        size="md"
        align="center"
        className="mb-2"
        vote={todaysVote}
        onVote={(vote) => {
          setStoredFeedback({ date: todayKey(), vote });
          logEvent({
            event_name: LogEvent.DailyFeedback,
            extra: JSON.stringify({ origin: Origin.DailyPage, vote }),
          });
        }}
      />

      <div className="flex flex-col items-center gap-0.5">
        <div className="bg-accent-avocado-float flex size-12 items-center justify-center rounded-full text-accent-avocado-default">
          <VIcon size={IconSize.Medium} secondary />
        </div>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Title2}
          bold
          className="!leading-tight tracking-[-0.02em]"
        >
          You&apos;re all caught up
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
        >
          Next Daily drops {tomorrow}.
        </Typography>
      </div>
    </section>
  );
};
