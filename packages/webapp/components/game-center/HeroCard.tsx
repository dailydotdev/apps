import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  MedalBadgeIcon,
  ReadingStreakIcon,
  StarIcon,
} from '@dailydotdev/shared/src/components/icons';
import classNames from 'classnames';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { useHoloPointer } from './useHoloPointer';

const xpSegmentCount = 10;

type HeroCardProps = {
  user: LoggedUser;
  level: number;
  levelProgress: number;
  totalXp: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  achievements?: { unlocked: number; total: number };
  footnote?: ReactNode;
};

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: ReactElement;
  label: string;
  value: string;
}): ReactElement => (
  <div className="bg-background-subtle p-2 px-2.5">
    <div className="flex items-center gap-1 text-text-tertiary">
      {icon}
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
      >
        {label}
      </Typography>
    </div>
    <Typography type={TypographyType.Callout} bold className="mt-0.5">
      {value}
    </Typography>
  </div>
);

export const HeroCard = ({
  user,
  level,
  levelProgress,
  totalXp,
  xpToNextLevel,
  currentStreak,
  longestStreak,
  achievements,
  footnote,
}: HeroCardProps): ReactElement => {
  const filledSegments = Math.round((levelProgress / 100) * xpSegmentCount);
  const holo = useHoloPointer();

  return (
    <div
      ref={holo.ref}
      className={classNames('hero-card', holo.isActive && 'is-active')}
      style={holo.style}
      onPointerMove={holo.onPointerMove}
      onPointerLeave={holo.onPointerLeave}
    >
      <article className="hero-card-inner relative isolate overflow-hidden rounded-18 bg-[linear-gradient(150deg,#f7d774_0%,#c98b2f_18%,#f7e7a8_34%,#b9701f_52%,#f5cf6a_70%,#8f5a19_88%,#f7d774_100%)] p-2.5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)]">
        <div className="relative z-1 overflow-hidden rounded-12 bg-background-subtle">
          <header className="flex items-center gap-2 bg-[linear-gradient(180deg,rgba(206,61,243,0.20),rgba(206,61,243,0))] px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Body}
                bold
                className="truncate"
              >
                {user.name}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
                className="truncate"
              >
                @{user.username}
              </Typography>
            </div>
            <div className="flex shrink-0 items-baseline gap-1">
              <Typography
                type={TypographyType.Caption2}
                color={TypographyColor.Tertiary}
                bold
              >
                LVL
              </Typography>
              <Typography type={TypographyType.Title2} bold>
                {level}
              </Typography>
            </div>
          </header>

          <div className="relative mx-2.5 h-40 overflow-hidden rounded-8 border-2 border-[rgba(0,0,0,0.55)] bg-[radial-gradient(120%_90%_at_50%_8%,#3a1050_0%,#170a22_55%,#0a0c0f_100%)]">
            <div className="hero-card-rays pointer-events-none absolute -inset-[40%]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-max bg-[radial-gradient(circle,rgba(230,105,251,0.55),transparent_62%)] blur-md" />
            <ProfilePicture
              user={user}
              size={ProfileImageSize.XXXXLarge}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-[3px] border-[rgba(255,255,255,0.9)] shadow-[0_8px_22px_rgba(0,0,0,0.65)]"
              nativeLazyLoading
            />
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-max bg-accent-bacon-default px-2 py-0.5 font-bold text-white typo-caption2">
              <ReadingStreakIcon secondary size={IconSize.XXSmall} />
              {currentStreak}d
            </span>
          </div>

          <div className="px-3 pt-2.5">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {xpToNextLevel.toLocaleString()} XP to level {level + 1}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                bold
                className="tabular-nums"
              >
                {totalXp.toLocaleString()} XP
              </Typography>
            </div>
            <div className="flex gap-0.5" aria-hidden>
              {Array.from({ length: xpSegmentCount }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < filledSegments
                      ? 'h-1.5 flex-1 rounded-4 bg-[#E669FB]'
                      : 'h-1.5 flex-1 rounded-4 bg-[#5A1E75]'
                  }
                />
              ))}
            </div>
          </div>

          <div className="mx-2.5 mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-8 border border-border-subtlest-tertiary bg-border-subtlest-tertiary">
            <Stat
              icon={<ReadingStreakIcon secondary size={IconSize.XXSmall} />}
              label="Streak"
              value={`${currentStreak}d`}
            />
            <Stat
              icon={<StarIcon secondary size={IconSize.XXSmall} />}
              label="Longest"
              value={`${longestStreak}d`}
            />
            <Stat
              icon={<MedalBadgeIcon size={IconSize.XXSmall} />}
              label="Badges"
              value={
                achievements
                  ? `${achievements.unlocked}/${achievements.total}`
                  : '—'
              }
            />
          </div>

          {footnote && (
            <div className="mx-2.5 mb-3 mt-2.5 border-t border-dashed border-border-subtlest-tertiary pt-2.5">
              {footnote}
            </div>
          )}
        </div>

        <div className="hero-card-shine z-2" aria-hidden />
        <div className="hero-card-glare z-2" aria-hidden />
      </article>
    </div>
  );
};
