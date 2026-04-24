import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getFirstName } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { ZenWeather } from './ZenWeather';
import { useZenModules } from '../store/zenModules.store';

const getTimeSalutation = (date: Date): string => {
  const hour = date.getHours();
  if (hour < 5) {
    return 'Still up';
  }
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
};

const formatTime = (date: Date): string =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const formatDate = (date: Date): string =>
  date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

interface ZenAmbientStripProps {
  className?: string;
}

// A single compact horizontal strip at the top of Zen: date · greeting ·
// time · weather. Replaces the old "hero clock + giant greeting" setup
// that competed with the feed for attention. The feed is the star here;
// this strip is context, not content.
export const ZenAmbientStrip = ({
  className,
}: ZenAmbientStripProps): ReactElement => {
  const { user } = useAuthContext();
  const { toggles } = useZenModules();
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timeoutId = 0;
    const schedule = (): void => {
      const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, msUntilNextMinute + 50);
    };
    schedule();
    return () => window.clearTimeout(timeoutId);
  }, []);

  const firstName = useMemo(
    () => (user?.name ? getFirstName(user.name) : undefined),
    [user?.name],
  );

  const greeting = firstName
    ? `${getTimeSalutation(now)}, ${firstName}`
    : getTimeSalutation(now);

  return (
    <header
      aria-label="Ambient status"
      className={classNames(
        'flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2',
        className,
      )}
    >
      <div className="flex items-baseline gap-2">
        <Typography
          type={TypographyType.Title3}
          bold
          className="text-text-primary"
        >
          {greeting}
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {formatDate(now)}
        </Typography>
      </div>
      <div className="flex items-center gap-3">
        <time
          dateTime={now.toISOString()}
          aria-label={`Current time ${formatTime(now)}`}
          className="tabular-nums text-text-secondary typo-callout"
        >
          {formatTime(now)}
        </time>
        {toggles.weather ? <ZenWeather /> : null}
      </div>
    </header>
  );
};
