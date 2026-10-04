import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  GiftIcon,
  ReadingStreakIcon,
  TriangleArrowIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { FreezeArt } from './rewardArt';

/**
 * A mock of the production reading-streak popover, close enough to judge an
 * addition against.
 *
 * It is a MOCK on purpose. `ReadingStreakPopup` reads boot, the 30-day history,
 * freeze dates, push state and the timezone check out of six hooks, none of
 * which exist in Storybook — so this rebuilds the same markup from static data.
 * The parts it copies verbatim, because they are what the eye measures a new
 * row against: the stat pair (`typo-title3` over `typo-subhead` quaternary),
 * the day row at `gap-2` with `IconSize.Medium` glyphs, the bacon arrow above
 * today, and the freeze row's full-width bordered button.
 *
 * If the real popover's spacing changes, this does not follow it. Check against
 * `components/streak/popup/ReadingStreakPopup.tsx` before trusting a judgement
 * about a few pixels.
 */

/** The nine days the popover shows: this week plus the run-up. */
export const DAY_LETTERS = ['W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T'];

export enum PopoverDay {
  Completed = 'completed',
  Missed = 'missed',
  Today = 'today',
  Upcoming = 'upcoming',
}

/** The state in the screenshot: a six-day run with one missed day behind it. */
export const DEFAULT_DAYS: PopoverDay[] = [
  PopoverDay.Completed,
  PopoverDay.Completed,
  PopoverDay.Missed,
  PopoverDay.Completed,
  PopoverDay.Today,
  PopoverDay.Upcoming,
  PopoverDay.Upcoming,
  PopoverDay.Upcoming,
  PopoverDay.Upcoming,
];

const DayGlyph = ({ day }: { day: PopoverDay }): ReactElement => {
  if (day === PopoverDay.Completed) {
    return <ReadingStreakIcon secondary size={IconSize.Medium} />;
  }

  // A missed day is a filled grey disc, an upcoming one an empty ring. Both are
  // the same box as the flame, or the row's letters stop lining up.
  return (
    <div
      className={classNames(
        'size-7 rounded-full border border-border-subtlest-tertiary',
        day === PopoverDay.Missed && 'bg-text-disabled',
      )}
    />
  );
};

export const PopoverDayRow = ({
  days = DEFAULT_DAYS,
  renderBadge,
}: {
  days?: PopoverDay[];
  /** Per-day slot, for the variants that mark the claimable days in place. */
  renderBadge?: (day: PopoverDay, index: number) => ReactNode;
}): ReactElement => (
  <div className="mt-6 flex flex-row gap-2">
    {days.map((day, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="relative flex flex-col items-center gap-1 text-text-primary typo-footnote"
      >
        {day === PopoverDay.Today && (
          <TriangleArrowIcon
            className="absolute -top-4 text-accent-bacon-default"
            size={IconSize.XXSmall}
          />
        )}
        <span className="relative">
          {day === PopoverDay.Today ? (
            <ReadingStreakIcon size={IconSize.Medium} />
          ) : (
            <DayGlyph day={day} />
          )}
          {renderBadge?.(day, index)}
        </span>
        {DAY_LETTERS[index]}
      </div>
    ))}
  </div>
);

export const PopoverStats = ({
  current = 6,
  longest = 31,
  extra,
}: {
  current?: number;
  longest?: number;
  /** A third column, for the variant that puts the claim among the stats. */
  extra?: ReactNode;
}): ReactElement => (
  <div className="flex flex-row">
    <span className="flex flex-1 flex-col">
      <strong className="typo-title3">{current}</strong>
      <p className="text-text-quaternary typo-subhead">Current streak</p>
    </span>
    <span className="flex flex-1 flex-col">
      <strong className="typo-title3">{longest}</strong>
      <p className="text-text-quaternary typo-subhead">Longest streak 🏆</p>
    </span>
    {extra}
  </div>
);

export const PopoverTotals = (): ReactElement => (
  <div className="mt-4 flex flex-col items-center tablet:flex-row">
    <div className="flex w-full flex-row flex-wrap justify-center gap-2 font-bold text-text-tertiary tablet:w-auto tablet:flex-col tablet:items-start tablet:gap-1">
      <div className="m-auto tablet:m-0">Total reading days: 744</div>
      <div className="flex min-w-0 justify-center font-normal !text-text-quaternary underline decoration-raw-pepper-10 tablet:m-0 tablet:justify-start">
        Europe/Helsinki
      </div>
    </div>
    <span className="ml-auto flex size-10 items-center justify-center rounded-10 bg-surface-float text-text-tertiary">
      ⚙
    </span>
  </div>
);

/** The production freeze row: the whole row is the button. */
export const PopoverFreezeRow = (): ReactElement => (
  <button
    type="button"
    className="mt-3 flex w-full items-center gap-2 border-t border-border-subtlest-tertiary px-4 py-3 text-left"
  >
    {/* The run's own 3D freeze art, not the icon set's flame: a balance of
        freezes and a freeze won on day 3 are the same thing, and they should
        not be drawn two different ways. */}
    <FreezeArt sizeClass="size-6" />
    <Typography type={TypographyType.Callout} bold className="flex-1">
      1 streak freeze left
    </Typography>
    <Typography type={TypographyType.Callout} color={TypographyColor.Link}>
      Buy more
    </Typography>
  </button>
);

/**
 * The popover shell.
 *
 * `tablet:max-w-[21.75rem]` is production's own width — every variant has to
 * earn its space inside it, which is most of the exercise.
 */
export const StreakPopover = ({ children }: { children: ReactNode }) => (
  <div className="flex w-[21.75rem] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-2">
    {children}
  </div>
);

/** The body padding production applies to everything above the freeze row. */
export const PopoverBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex flex-col p-4', className)}>{children}</div>
);

/**
 * The panel as it would ship: production's own popover with one row added.
 *
 * The row is built exactly like the freeze row below it — whole row is the
 * button, same top border, same padding — so it adds a position in a panel
 * people already know rather than a new kind of thing in it. It sits ABOVE the
 * freeze row because it is the one with something waiting; the freeze row is a
 * balance, and a balance can be last.
 */
/**
 * The gift's nudge, on a loop.
 *
 * The motion is production's own `nudge-shake` — the same translate/rotate
 * steps the intro-quest button uses to ask for attention — but that one is a
 * 600ms one-shot fired on an event. A row that sits there waiting has no event
 * to fire on, so the shake is compressed into the first fifth of a four-second
 * cycle and the rest of the cycle is still. A gift that shakes continuously
 * reads as a broken loop rather than a nudge.
 */
const GiftNudgeStyles = (): ReactElement => (
  <style>
    {`
      @keyframes zdGiftNudge {
        0%, 15%, 100% { transform: translateX(0); }
        2% { transform: translateX(-4px) rotate(-3deg); }
        5% { transform: translateX(4px) rotate(3deg); }
        7% { transform: translateX(-3px) rotate(-2deg); }
        10% { transform: translateX(3px) rotate(2deg); }
        12% { transform: translateX(-2px) rotate(-1deg); }
      }
      .zd-gift-nudge { animation: zdGiftNudge 4s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .zd-gift-nudge { animation: none; }
      }
    `}
  </style>
);

export const StreakPanel = ({
  claimable = 3,
}: {
  /** Rewards waiting. The row is not rendered at zero. */
  claimable?: number;
}): ReactElement => (
  <StreakPopover>
    <GiftNudgeStyles />
    <PopoverBody>
      <PopoverStats />
      <PopoverDayRow />
      <PopoverTotals />
    </PopoverBody>
    {claimable > 0 && (
      // The one row in the panel with something waiting, and the only one
      // tinted: every other row here is a fact, this one is an errand. A plain
      // row in the same grey as the freeze balance below it was being read as
      // one more line of status and skipped.
      //
      // It is NOT the whole-row-is-the-button pattern the freeze row uses —
      // a filled CTA inside a button is invalid, and a row this loud should
      // say exactly what the press does rather than leave the target implied.
      <div className="flex w-full items-center gap-3 border-t border-border-subtlest-tertiary bg-accent-bacon-default/10 px-4 py-3">
        {/* The gift from the production profile menu, not a Cores coin: what
            is waiting may be a freeze as well as Cores, and the row is about
            there being something to collect rather than about the currency. */}
        <GiftIcon
          secondary
          size={IconSize.Medium}
          className="zd-gift-nudge text-accent-bacon-default"
        />
        <span className="flex min-w-0 flex-1 flex-col">
          <Typography type={TypographyType.Callout} bold>
            {claimable} reward{claimable === 1 ? '' : 's'} ready
          </Typography>
          {/* The condition, not a second CTA. A count alone does not say what
              it is for, and this panel is where someone lands without having
              opened the run. */}
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            From your reading week
          </Typography>
        </span>
        <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
          Claim
        </Button>
      </div>
    )}
    <PopoverFreezeRow />
  </StreakPopover>
);
