import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { subHours } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
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
import { useAuthContext } from '../../contexts/AuthContext';
import usePersistentContext from '../../hooks/usePersistentContext';
import type { Vote } from './DailyFeedback';
import { DailyFeedback } from './DailyFeedback';

type StoredFeedback = { date: string; vote: Vote };

const DAILY_DROP_HOUR = 9;

const todayKey = (timeZone: string): string =>
  formatInTimeZone(
    subHours(new Date(), DAILY_DROP_HOUR),
    timeZone,
    'yyyy-MM-dd',
  );

const formatNextDrop = (timeZone: string): string => {
  const base = utcToZonedTime(new Date(), timeZone);
  base.setDate(base.getDate() + 1);
  base.setHours(DAILY_DROP_HOUR, 0, 0, 0);
  return zonedTimeToUtc(base, timeZone).toLocaleString(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  });
};

export const CoverClosing = (): ReactElement => {
  const { user } = useAuthContext();
  const timezone =
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tomorrow = useMemo(() => formatNextDrop(timezone), [timezone]);
  const { logEvent } = useLogContext();
  const [storedFeedback, setStoredFeedback] =
    usePersistentContext<StoredFeedback | null>('daily_feedback', null);
  const todaysVote =
    storedFeedback?.date === todayKey(timezone) ? storedFeedback.vote : null;

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
          setStoredFeedback({ date: todayKey(timezone), vote });
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
