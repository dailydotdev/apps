import type { MouseEvent, ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
  ButtonColor,
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

// The week pill ("Jul 20–26, 2026"). Exported so it can ride on the surface's
// top line next to the daily.dev logo instead of in the intro body.
export const WeeklyQuizDateChip = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): ReactElement => (
  <span className="inline-flex items-center gap-1.5 font-bold text-text-primary typo-footnote">
    <CalendarIcon size={IconSize.XSmall} />
    {formatWeekRange(startDate, endDate)}
  </span>
);

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
  // Hovering (or focusing) Start rains more paper, faster.
  const [startHovered, setStartHovered] = useState(false);
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

  // Smoothly ramp the falling papers' playback rate on Start hover (eases
  // slow→fast instead of jumping). Setting playbackRate keeps each sheet's
  // position continuous; only the speed changes.
  const papersRef = useRef<HTMLSpanElement>(null);
  const rateRef = useRef(1);
  useEffect(() => {
    const el = papersRef.current;
    const target = startHovered ? 3.4 : 1;
    const from = rateRef.current;
    if (!el || from === target) {
      return undefined;
    }
    const durationMs = 650;
    let raf = 0;
    let startTs: number | null = null;
    const tick = (now: number): void => {
      if (startTs === null) {
        startTs = now;
      }
      const progress = Math.min(1, (now - startTs) / durationMs);
      const eased = 1 - (1 - progress) ** 2; // easeOutQuad
      rateRef.current = from + (target - from) * eased;
      el.getAnimations({ subtree: true }).forEach((animation) => {
        // eslint-disable-next-line no-param-reassign
        animation.playbackRate = rateRef.current;
      });
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [startHovered]);

  return (
    <div className="relative flex animate-composer-in flex-col items-center gap-6 p-6 text-center tablet:flex-row-reverse tablet:items-center tablet:gap-8 tablet:p-8">
      {/* A few A4 papers drifting down the whole surface, behind the content.
          Hovering Start reveals the extra sheets and speeds them all up. */}
      <span
        ref={papersRef}
        className={classNames(
          styles.papers,
          startHovered && styles.papersBoost,
        )}
        aria-hidden
      >
        <span className={styles.paper} />
        <span className={styles.paper} />
        <span className={styles.paper} />
        <span className={styles.paper} />
        <span className={classNames(styles.paper, styles.paperExtra)} />
        <span className={classNames(styles.paper, styles.paperExtra)} />
        <span className={classNames(styles.paper, styles.paperExtra)} />
        <span className={classNames(styles.paper, styles.paperExtra)} />
      </span>

      {/* Logo (on tablet, the right column). */}
      <h1 className="z-10 relative flex shrink-0 justify-center">
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
              className="pointer-events-none relative w-64 max-w-none select-none"
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

      {/* Content column (on tablet, the left side). */}
      <div className="z-10 relative flex w-full max-w-lg flex-col items-center gap-5 tablet:min-w-0 tablet:flex-1">
        {/* The challenge pitch — the focus of this screen. */}
        <div className="flex flex-col items-center gap-2">
          <Typography
            type={TypographyType.Title1}
            bold
            tag={TypographyTag.H2}
            className="!text-text-primary"
          >
            The Tech News Quiz
          </Typography>
          {/* Mobile only: the week pill sits under the title. On tablet+ it
              rides the top bar instead (passed as the surface's headerRight). */}
          {quiz && (
            <span className="flex justify-center tablet:hidden">
              <WeeklyQuizDateChip
                startDate={quiz.startDate}
                endDate={quiz.endDate}
              />
            </span>
          )}
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
              color={ButtonColor.Cabbage}
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
            color={ButtonColor.Cabbage}
            size={ButtonSize.XLarge}
            className={classNames('w-full', styles.arcadeBtnIdle)}
            disabled={isLoading || questionCount === 0}
            onClick={onStart}
            onMouseEnter={() => setStartHovered(true)}
            onMouseLeave={() => setStartHovered(false)}
            onFocus={() => setStartHovered(true)}
            onBlur={() => setStartHovered(false)}
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

        {/* How much news it distils (the week pill rides on the top bar). */}
        {quiz && (
          <div className="flex flex-col items-center gap-2">
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

        {/* Share + weekly reminder, always available — one row. */}
        <div className="flex w-full flex-row items-center justify-center gap-2">
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            className="flex-1 !border-border-subtlest-tertiary"
            icon={<ShareIcon />}
            onClick={() => setIsShareOpen(true)}
          >
            Share
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Medium}
            className="flex-1 !border-border-subtlest-tertiary"
            aria-pressed={reminderSet}
            icon={<BellIcon />}
            onClick={() => setReminderSet(true)}
          >
            {reminderSet ? "You're all set" : 'Weekly reminder'}
          </Button>
        </div>
      </div>

      {isShareOpen && (
        <WeeklyQuizSharePopover onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  );
};
