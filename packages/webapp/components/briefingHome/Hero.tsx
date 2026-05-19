import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useReadingStreak } from '@dailydotdev/shared/src/hooks/streaks/useReadingStreak';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { briefCopy } from './copy';

interface HeroProps {
  storyCount: number;
  readMinutes: number;
}

const greetingFor = (name: string): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return briefCopy.greeting.morning(name);
  }
  if (hour < 18) {
    return briefCopy.greeting.afternoon(name);
  }
  return briefCopy.greeting.evening(name);
};

const formatDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

export const Hero = ({ storyCount, readMinutes }: HeroProps): ReactElement => {
  const { user } = useAuthContext();
  const { streak } = useReadingStreak();
  const displayName = useMemo(
    () => user?.name?.split(' ')[0] || user?.username || 'there',
    [user],
  );

  return (
    <header className="flex flex-col gap-3 pb-6 pt-2">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
        className="font-bold uppercase tracking-[0.18em]"
      >
        {formatDate()}
      </Typography>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="!leading-[1.1] tracking-[-0.025em]"
      >
        {greetingFor(displayName)}
      </Typography>
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Tertiary}
        className="max-w-prose"
      >
        {briefCopy.heroFrame(storyCount, readMinutes)}
      </Typography>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5">
          <TimerIcon size={IconSize.XXSmall} className="text-text-tertiary" />
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Secondary}
            bold
          >
            {briefCopy.readPill(readMinutes)}
          </Typography>
        </span>
        {streak?.current ? (
          <span
            className={classNames(
              'inline-flex items-center gap-2 rounded-full border border-border-subtlest-tertiary px-3 py-1.5',
            )}
            aria-label={`${streak.current}${briefCopy.streakSuffix}`}
          >
            <span className="inline-block size-1.5 rounded-full bg-accent-bun-default" />
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-[0.08em]"
            >
              <span className="font-bold text-text-primary">
                {streak.current}
              </span>
              {briefCopy.streakSuffix}
            </Typography>
          </span>
        ) : null}
      </div>
    </header>
  );
};
