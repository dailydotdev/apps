import type { MouseEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { BellIcon, CalendarIcon, ShareIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import { WeeklyQuizScoreboard } from './WeeklyQuizScoreboard';
import { WeeklyQuizSharePopover } from './WeeklyQuizSharePopover';
import { WeeklyQuizPeriod } from '../types';
import type { WeeklyQuiz } from '../types';
import type { UseWeeklyQuizAudio } from '../hooks/useWeeklyQuizAudio';
import styles from '../WeeklyQuiz.module.css';

const LOGO_URL = '/logos/weekly-quiz-logo.png';

// How many source logos the intro shows before collapsing the rest into "+N".
// Kept low so the "+N" pill sits inline on the same row as the logos.
const SHOWN_SOURCES = 5;

interface WeeklyQuizIntroProps {
  quiz: WeeklyQuiz | undefined;
  isLoading: boolean;
  onStart: () => void;
  audio?: UseWeeklyQuizAudio;
  // Locked out for the week — already played (server flag or a spent local run).
  alreadyPlayed?: boolean;
}

const socialButtonClass =
  'flex h-20 min-w-[5rem] flex-col items-center justify-center gap-1 whitespace-nowrap rounded-16 bg-white/15 px-4 typo-caption1 font-bold text-white transition-colors hover:bg-white/25';

// "Jul 20–26, 2026" from the quiz's inclusive ISO date range. Parsed from parts
// (not new Date(iso)) so the label doesn't shift a day across timezones.
const formatWeekRange = (start: string, end: string): string => {
  const parse = (iso: string): Date => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const s = parse(start);
  const e = parse(end);
  const month = (date: Date): string =>
    date.toLocaleDateString('en-US', { month: 'short' });
  const year = e.getFullYear();
  return s.getMonth() === e.getMonth()
    ? `${month(s)} ${s.getDate()}–${e.getDate()}, ${year}`
    : `${month(s)} ${s.getDate()} – ${month(e)} ${e.getDate()}, ${year}`;
};

// Landing screen: two separated floating panels — left holds the logo, the
// arcade Start button and social actions; right holds the leaderboard. Stacks
// on mobile, side-by-side from tablet up.
export const WeeklyQuizIntro = ({
  quiz,
  isLoading,
  onStart,
  audio,
  alreadyPlayed = false,
}: WeeklyQuizIntroProps): ReactElement => {
  const { user } = useAuthContext();
  const [period, setPeriod] = useState<WeeklyQuizPeriod>(
    WeeklyQuizPeriod.Weekly,
  );
  // Local-only until the reminder subscription is wired to the backend.
  const [reminderSet, setReminderSet] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const questionCount = quiz?.questions.length ?? 0;

  // Mouse-driven 3D tilt on the logo: rotate toward the cursor, reset on leave.
  const logoRef = useRef<HTMLSpanElement>(null);
  const tiltLogo = (event: MouseEvent<HTMLSpanElement>): void => {
    const el = logoRef.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const max = 16;
    el.style.transform = `perspective(600px) rotateY(${px * max}deg) rotateX(${
      -py * max
    }deg) scale(1.06)`;
  };
  const resetLogoTilt = (): void => {
    if (logoRef.current) {
      logoRef.current.style.transform = '';
    }
  };

  return (
    <div className="flex animate-composer-in flex-col gap-4 p-4 tablet:flex-row tablet:items-stretch">
      <div
        className={classNames(
          'flex flex-col items-center gap-5 rounded-24 p-4 tablet:w-[calc(40%-0.5rem)]',
          styles.panel,
        )}
      >
        <h1 className="flex justify-center">
          {/* Padding enlarges the mouse-tracked hover box beyond the logo art
              so the 3D tilt reacts over a more generous area. */}
          <span
            ref={logoRef}
            className={classNames('inline-block px-2 py-2', styles.logoTilt)}
            onMouseMove={tiltLogo}
            onMouseLeave={resetLogoTilt}
          >
            <span className="relative inline-block">
              <img
                src={LOGO_URL}
                alt="The Weekly Tech News Quiz"
                className="pointer-events-none w-56 max-w-none select-none"
              />
              {/* Glow sits over the logo's lightbulb (right side, mid-height). */}
              <span
                className={classNames(
                  'absolute right-[13%] top-[31%] h-12 w-12',
                  styles.bulbGlow,
                )}
                aria-hidden
              />
            </span>
          </span>
        </h1>

        {/* Which week + how much news it distils — makes it clear the quiz
            recaps the week that just ended, not an older one. */}
        {quiz && (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="bg-white/20 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-white typo-footnote">
              <CalendarIcon size={IconSize.XSmall} />
              {formatWeekRange(quiz.startDate, quiz.endDate)}
            </span>
            <Typography
              type={TypographyType.Callout}
              bold
              className="!text-white"
            >
              {quiz.storyCount} stories from {quiz.sourceCount} sources,
              distilled into {questionCount} questions.
            </Typography>
            {quiz.topSources.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {quiz.topSources.slice(0, SHOWN_SOURCES).map((source) => (
                  <img
                    key={source.id}
                    src={source.image}
                    alt={source.name}
                    title={source.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
                  />
                ))}
                {quiz.sourceCount > SHOWN_SOURCES && (
                  <span className="bg-white/15 flex h-8 items-center rounded-full px-2.5 font-bold text-white typo-caption1">
                    +{quiz.sourceCount - SHOWN_SOURCES}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {alreadyPlayed ? (
          <div className="flex w-full flex-col items-center gap-2">
            <button
              type="button"
              className={classNames(
                styles.arcadeBtn,
                'h-16 w-full px-6 uppercase typo-title1',
              )}
              disabled
            >
              <span className={styles.arcadeBtnLabel}>Start</span>
            </button>
            <Typography
              type={TypographyType.Callout}
              bold
              className="!text-white/80"
            >
              Try again next week!
            </Typography>
          </div>
        ) : (
          <button
            type="button"
            className={classNames(
              styles.arcadeBtn,
              styles.arcadeBtnIdle,
              'flex h-16 w-full items-center justify-center gap-3 px-6 uppercase typo-title1',
            )}
            disabled={isLoading || questionCount === 0}
            onClick={onStart}
          >
            {user && (
              <ProfilePicture
                user={user}
                size={ProfileImageSize.Large}
                rounded="full"
              />
            )}
            <span className={styles.arcadeBtnLabel}>Start</span>
          </button>
        )}

        {/* Share + weekly reminder, always available. (Challenge-a-friend is
            stashed for now.) */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className={socialButtonClass}
            onClick={() => setIsShareOpen(true)}
            title="Share"
          >
            <ShareIcon size={IconSize.Medium} />
            Share
          </button>
          <button
            type="button"
            aria-pressed={reminderSet}
            className={socialButtonClass}
            onClick={() => setReminderSet(true)}
            title="Weekly reminder"
          >
            <BellIcon size={IconSize.Medium} />
            {reminderSet ? "You're all set" : 'Weekly reminder'}
          </button>
        </div>
      </div>

      {isShareOpen && (
        <WeeklyQuizSharePopover onClose={() => setIsShareOpen(false)} />
      )}

      <div
        className={classNames(
          'relative rounded-24 tablet:w-[calc(60%-0.5rem)]',
          styles.panel,
        )}
      >
        <WeeklyQuizScoreboard
          period={period}
          onPeriodChange={setPeriod}
          audio={audio}
          fillHeight
        />
      </div>
    </div>
  );
};
