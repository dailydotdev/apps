import type { MouseEvent, ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { BellIcon, CalendarIcon, ShareIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  ProfilePicture,
  ProfileImageSize,
} from '../../../components/ProfilePicture';
import { useAuthContext } from '../../../contexts/AuthContext';
import { WeeklyQuizSharePopover } from './WeeklyQuizSharePopover';
import type { WeeklyQuiz } from '../types';
import styles from '../WeeklyQuiz.module.css';

const LOGO_URL = '/logos/weekly-quiz-logo.png';

// How many source logos the intro shows before collapsing the rest into "+N".
const SHOWN_SOURCES = 5;

interface WeeklyQuizIntroProps {
  quiz: WeeklyQuiz | undefined;
  isLoading: boolean;
  onStart: () => void;
  // Locked out for the week — already played (server flag or a spent local run).
  alreadyPlayed?: boolean;
}

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

// Landing screen: a single focused column that pitches the challenge — logo, a
// hook line, the week's context, and the Start button. The leaderboard is not
// shown here; it lives on the results screen once you've played.
export const WeeklyQuizIntro = ({
  quiz,
  isLoading,
  onStart,
  alreadyPlayed = false,
}: WeeklyQuizIntroProps): ReactElement => {
  const { user } = useAuthContext();
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
    <div className="relative flex animate-composer-in flex-col items-center gap-6 p-6 text-center tablet:flex-row-reverse tablet:items-center tablet:gap-8 tablet:p-8">
      {/* Right column (on tablet): the logo. */}
      <h1 className="flex shrink-0 justify-center">
        {/* Padding enlarges the mouse-tracked hover box beyond the logo art
            so the 3D tilt reacts over a more generous area. */}
        <span
          ref={logoRef}
          className={classNames('inline-block px-2 py-2', styles.logoTilt)}
          onMouseMove={tiltLogo}
          onMouseLeave={resetLogoTilt}
        >
          <span className="relative inline-block">
            {/* Animated brand glow behind the logo. */}
            <span className={styles.logoAura} aria-hidden />
            <img
              src={LOGO_URL}
              alt="The Weekly Tech News Quiz"
              className="pointer-events-none relative w-72 max-w-none select-none"
            />
            {/* Glow sits over the logo's lightbulb (right side, mid-height). */}
            <span
              className={classNames(
                'absolute right-[13%] top-[31%] h-16 w-16',
                styles.bulbGlow,
              )}
              aria-hidden
            />
          </span>
        </span>
      </h1>

      {/* Left column (on tablet): all the content. */}
      <div className="flex w-full max-w-lg flex-col items-center gap-5 tablet:flex-1">
        {/* The challenge pitch — the focus of this screen. */}
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Title1}
            bold
            tag={TypographyTag.H2}
            className="!text-text-primary"
          >
            Tech News Quiz
          </Typography>
          {quiz?.welcomeText && (
            <Typography
              type={TypographyType.Body}
              className="!text-text-secondary"
            >
              {quiz.welcomeText}
            </Typography>
          )}
        </div>

        {alreadyPlayed ? (
          <div className="flex w-full flex-col items-center gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.XLarge}
              className="w-full"
              disabled
            >
              Start playing
            </Button>
            <Typography
              type={TypographyType.Callout}
              className="text-text-tertiary"
            >
              Try again next week!
            </Typography>
          </div>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            className={classNames('w-full', styles.arcadeBtnIdle)}
            disabled={isLoading || questionCount === 0}
            onClick={onStart}
            icon={
              user ? (
                <ProfilePicture
                  user={user}
                  size={ProfileImageSize.Small}
                  rounded="full"
                />
              ) : undefined
            }
          >
            Start playing
          </Button>
        )}

        {/* Which week + how much news it distils. */}
        {quiz && (
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-10 bg-surface-float px-3 py-1 font-bold text-text-primary typo-footnote">
              <CalendarIcon size={IconSize.XSmall} />
              {formatWeekRange(quiz.startDate, quiz.endDate)}
            </span>
            <Typography
              type={TypographyType.Footnote}
              className="!text-text-tertiary"
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
                    className="h-7 w-7 rounded-full object-cover ring-2 ring-border-subtlest-tertiary"
                  />
                ))}
                {quiz.sourceCount > SHOWN_SOURCES && (
                  <span className="flex h-7 items-center rounded-full bg-surface-float px-2.5 font-bold text-text-primary typo-caption1">
                    +{quiz.sourceCount - SHOWN_SOURCES}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Share + weekly reminder, always available. */}
        <div className="flex w-full flex-col gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            className="w-full"
            icon={<ShareIcon />}
            onClick={() => setIsShareOpen(true)}
          >
            Share
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            className="w-full"
            aria-pressed={reminderSet}
            icon={<BellIcon />}
            onClick={() => setReminderSet(true)}
          >
            {reminderSet ? "You're all set" : 'Set weekly reminder'}
          </Button>
        </div>
      </div>

      {isShareOpen && (
        <WeeklyQuizSharePopover onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
};
