import type { ComponentType, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { IconProps } from '@dailydotdev/shared/src/components/Icon';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { BriefIcon } from '@dailydotdev/shared/src/components/icons/Brief';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { EyeIcon } from '@dailydotdev/shared/src/components/icons/Eye';
import { LayoutIcon } from '@dailydotdev/shared/src/components/icons/Layout';
import { DevCardIcon } from '@dailydotdev/shared/src/components/icons/DevCard';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { NewTabIcon } from '@dailydotdev/shared/src/components/icons/NewTab';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { OpenLinkIcon } from '@dailydotdev/shared/src/components/icons/OpenLink';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';

/*
 * daily.dev tips: the strip production shows over the rail's ad slot
 * (features/feedWidgets/widgets/FeedWidgetTip.tsx, #7004) and the /tips
 * page it links to. The tips are production's own list (feedWidgets/tips.ts),
 * so the review is on real copy.
 */

export type Tip = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  tone: string;
  group: TipGroup;
  /** What the reader does next, named on the tip's button. */
  cta: string;
  isExternal?: boolean;
  hideInExtension?: boolean;
};

export type TipGroup = 'Your feed' | 'Read and save' | 'Community' | 'Habits';

export const tips: Tip[] = [
  {
    id: 'feed-tags',
    eyebrow: 'Your feed',
    title: 'Follow tags to shape your feed',
    description:
      'Follow the topics you care about and block the ones you don’t. Your feed adjusts with every tag.',
    icon: HashtagIcon,
    tone: 'cabbage',
    group: 'Your feed',
    cta: 'Choose your tags',
  },
  {
    id: 'custom-feeds',
    eyebrow: 'Custom feeds',
    title: 'Build a feed for every topic',
    description:
      'Make separate feeds for work, side projects, or that new framework, each with its own tags and sources.',
    icon: FilterIcon,
    tone: 'avocado',
    group: 'Your feed',
    cta: 'Create a feed',
  },
  {
    id: 'read-later',
    eyebrow: 'Bookmarks',
    title: 'Save posts to read later',
    description:
      'Bookmark a post when you don’t have time for it now. Your read-it-later list keeps it for when you do.',
    icon: BookmarkIcon,
    tone: 'bun',
    group: 'Read and save',
    cta: 'Open your reading list',
  },
  {
    id: 'squads',
    eyebrow: 'Squads',
    title: 'Find your people in Squads',
    description:
      'Squads are communities around a language, a tool, or a team. Join one to share posts and discuss them together.',
    icon: SquadIcon,
    tone: 'water',
    group: 'Community',
    cta: 'Find a Squad',
  },
  {
    id: 'briefing',
    eyebrow: 'Briefing',
    title: 'Catch up in minutes with a briefing',
    description:
      'Short on time? A briefing sums up what happened in tech, so you can catch up in a few minutes.',
    icon: BriefIcon,
    tone: 'onion',
    group: 'Read and save',
    cta: 'Get a briefing',
  },
  {
    id: 'streaks',
    eyebrow: 'Reading streak',
    title: 'Keep your reading streak going',
    description:
      'Read a post a day to grow your streak. Tune reminders and streak settings so a busy day doesn’t break it.',
    icon: HotIcon,
    tone: 'bacon',
    group: 'Habits',
    cta: 'Open streak settings',
  },
  {
    id: 'search',
    eyebrow: 'Search',
    title: 'Press Cmd/Ctrl + K to search anything',
    description:
      'Jump to posts, tags, and pages from anywhere without leaving the keyboard, or open search and look around.',
    icon: SearchIcon,
    tone: 'blueCheese',
    group: 'Read and save',
    cta: 'Try search',
  },
  {
    id: 'history',
    eyebrow: 'Reading history',
    title: 'Find that post you read last week',
    description:
      'Every post you open lands in your reading history, so the one you meant to come back to is always a search away.',
    icon: EyeIcon,
    tone: 'lettuce',
    group: 'Read and save',
    cta: 'Open your history',
  },
  {
    id: 'appearance',
    eyebrow: 'Appearance',
    title: 'Make daily.dev look your way',
    description:
      'Switch between light and dark mode, show your feed as cards or a list, and choose whether links open in a new tab.',
    icon: LayoutIcon,
    tone: 'cheese',
    group: 'Your feed',
    cta: 'Open appearance',
  },
  {
    id: 'devcard',
    eyebrow: 'DevCard',
    title: 'Show off your dev profile',
    description:
      'Your DevCard sums up what you read and your reputation. Share it on your site, your GitHub README, or anywhere else.',
    icon: DevCardIcon,
    tone: 'burger',
    group: 'Community',
    cta: 'Get your DevCard',
  },
  {
    id: 'notifications',
    eyebrow: 'Notifications',
    title: 'Choose what you hear about',
    description:
      'Pick which replies, mentions, and updates reach you, in the app or by email, and mute the rest.',
    icon: BellIcon,
    tone: 'ketchup',
    group: 'Habits',
    cta: 'Choose notifications',
  },
  {
    id: 'extension',
    eyebrow: 'Browser extension',
    title: 'Get daily.dev on every new tab',
    description:
      'Add the extension and every new tab opens on your feed, the same one millions of developers start their day with.',
    icon: NewTabIcon,
    tone: 'cabbage',
    group: 'Habits',
    cta: 'Add to Chrome',
    isExternal: true,
    hideInExtension: true,
  },
];

export const tipsFor = (isExtension: boolean): Tip[] =>
  tips.filter((tip) => !isExtension || !tip.hideInExtension);

export const longTip: Tip = {
  ...tips[6],
  id: 'long',
  title:
    'Press Cmd/Ctrl + K anywhere to jump to posts, tags, squads and settings without touching the mouse',
};

const accent = (tone: string): string => `var(--theme-accent-${tone}-default)`;

const preventDefault = (event: React.MouseEvent): void =>
  event.preventDefault();

/* ------------------------------------------------------------------ */
/* Today: production's strip and page, rebuilt for the comparison      */
/* ------------------------------------------------------------------ */

const productionWash = (tone: string): string =>
  `radial-gradient(120% 160% at 0% 50%, color-mix(in srgb, ${accent(
    tone,
  )} 32%, transparent) 0%, transparent 70%)`;

/** FeedWidgetTip as production renders it, with "All tips" on hover. */
export const TipToday = ({
  tip,
  isAllTipsShown,
}: {
  tip: Tip;
  /** Hover with a mouse, or always on touch. */
  isAllTipsShown?: boolean;
}): ReactElement => {
  const { icon: Icon } = tip;
  return (
    <div className="group/tip relative flex shrink-0 flex-col">
      <a
        href="#"
        onClick={preventDefault}
        className="group/strip relative flex h-28 min-w-0 items-center gap-3 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle pl-3 pr-3 transition-[border-color,transform] duration-150 hover:border-border-subtlest-secondary"
        style={{ backgroundImage: productionWash(tip.tone) }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 size-32 -translate-y-1/2 opacity-40"
          style={{
            backgroundImage: `radial-gradient(closest-side, ${accent(
              tip.tone,
            )}, transparent)`,
          }}
        />
        <span
          aria-hidden
          className="relative flex size-9 shrink-0 items-center justify-center rounded-12 text-white shadow-2"
          style={{ background: accent(tip.tone) }}
        >
          <Icon secondary size={IconSize.Small} />
        </span>
        <span className="relative flex min-w-0 flex-1 flex-col">
          <span
            className="truncate font-bold typo-caption1"
            style={{ color: accent(tip.tone) }}
          >
            Tip · {tip.eyebrow}
          </span>
          <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
            {tip.title}
          </span>
          <span className="mt-0.5 line-clamp-2 text-text-tertiary typo-caption1">
            {tip.description}
          </span>
        </span>
        <ArrowIcon
          aria-hidden
          size={IconSize.Size16}
          className="relative shrink-0 rotate-90 text-text-quaternary"
        />
      </a>
      <span
        className={classNames(
          'absolute right-2 top-1/2 z-1 flex h-6 -translate-y-1/2 items-center rounded-8 bg-background-default px-2 font-bold text-text-secondary shadow-2 typo-caption2',
          !isAllTipsShown && 'opacity-0 group-hover/tip:opacity-100',
        )}
      >
        All tips
      </span>
    </div>
  );
};

/** One card of the /tips page as production renders it. */
const TipsPageItemToday = ({ tip }: { tip: Tip }): ReactElement => {
  const { icon: Icon } = tip;
  return (
    <li
      className="flex items-start gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
      style={{ backgroundImage: productionWash(tip.tone) }}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-12 text-white shadow-2"
        style={{ background: accent(tip.tone) }}
      >
        <Icon secondary size={IconSize.Medium} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="font-bold typo-caption1"
          style={{ color: accent(tip.tone) }}
        >
          {tip.eyebrow}
        </span>
        <span className="font-bold text-text-primary typo-callout">
          {tip.title}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {tip.description}
        </span>
      </span>
    </li>
  );
};

export const TipsPageToday = ({
  list = tips,
}: {
  list?: Tip[];
}): ReactElement => (
  <div className="flex flex-col gap-4">
    <h1 className="font-bold text-text-primary typo-title3">daily.dev tips</h1>
    <p className="text-text-tertiary typo-callout">
      Small things that make daily.dev work better for you.
    </p>
    <ul className="flex flex-col gap-3">
      {list.map((tip) => (
        <TipsPageItemToday key={tip.id} tip={tip} />
      ))}
    </ul>
  </div>
);

/* ------------------------------------------------------------------ */
/* Proposed: the tip in the widget grammar                             */
/* ------------------------------------------------------------------ */

/** The tip's glyph on a soft tile of its color: identity, not a banner. */
const TipIcon = ({
  tip,
  isLarge,
}: {
  tip: Tip;
  isLarge?: boolean;
}): ReactElement => {
  const { icon: Icon } = tip;
  return (
    <span
      aria-hidden
      className={classNames(
        'flex shrink-0 items-center justify-center',
        isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10',
      )}
      style={{
        background: `color-mix(in srgb, ${accent(tip.tone)} 16%, transparent)`,
        color: accent(tip.tone),
      }}
    >
      <Icon secondary size={isLarge ? IconSize.Small : IconSize.Size16} />
    </span>
  );
};

/**
 * The proposed tip: explicit enough to act on without leaving the rail.
 * It says it is a tip, names the feature, explains in full what to do,
 * and ends on one button named for that action; All tips stays in sight
 * in the corner and goes straight to the tips page.
 */
export const TipStrip = ({
  tip,
  isEditing,
  onRemove,
}: {
  tip: Tip;
  isEditing?: boolean;
  onRemove?: () => void;
}): ReactElement => (
  <div
    className={classNames(
      'relative flex shrink-0 flex-col gap-2.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3',
      isEditing && 'opacity-60',
    )}
  >
    <div className="flex h-6 items-center justify-between gap-2">
      <span className="font-bold text-text-tertiary typo-caption1">
        daily.dev tip · {tip.eyebrow}
      </span>
      {!isEditing && (
        <Button
          tag="a"
          href="#"
          onClick={preventDefault}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          className="-mr-1.5"
        >
          All tips
        </Button>
      )}
    </div>
    <div className="flex items-start gap-2.5">
      <TipIcon tip={tip} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-footnote">
          {tip.title}
        </span>
        <span className="text-text-secondary typo-caption1">
          {tip.description}
        </span>
      </span>
    </div>
    <Button
      tag="a"
      href="#"
      onClick={preventDefault}
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      className="w-full"
      icon={
        tip.isExternal ? <OpenLinkIcon /> : <ArrowIcon className="rotate-90" />
      }
      iconPosition={ButtonIconPosition.Right}
    >
      {tip.cta}
    </Button>
    {isEditing && onRemove !== undefined && (
      <button
        type="button"
        aria-label="Remove daily.dev tips"
        onClick={onRemove}
        className="absolute -left-2 -top-2 z-3 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
      >
        <MinusIcon size={IconSize.Size16} />
      </button>
    )}
  </div>
);

/** The toast after removing the tips from the rail. */
export const TipsRemovedToast = (): ReactElement => (
  <div className="flex items-center gap-3 rounded-14 bg-text-primary px-4 py-2.5 text-surface-invert shadow-2">
    <span className="flex-1 typo-footnote">daily.dev tips removed</span>
    <button type="button" className="font-bold typo-footnote">
      Undo
    </button>
  </div>
);

/* ------------------------------------------------------------------ */
/* Proposed /tips page                                                 */
/* ------------------------------------------------------------------ */

const groupOrder: TipGroup[] = [
  'Your feed',
  'Read and save',
  'Community',
  'Habits',
];

/**
 * The tips page as a settings-style list: grouped, one row per tip with
 * its glyph, title and description, and the tip's own destination on the
 * row, so twelve washed cards stop competing with each other.
 */
export const TipsPage = ({
  isExtension = false,
  isTipsHidden = false,
}: {
  isExtension?: boolean;
  /** The reader removed the tips from their rail. */
  isTipsHidden?: boolean;
}): ReactElement => {
  const list = tipsFor(isExtension);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-text-primary typo-title3">
          daily.dev tips
        </h1>
        <p className="text-text-tertiary typo-callout">
          Small things that make daily.dev work better for you.
        </p>
      </div>
      {isTipsHidden && (
        <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3">
          <span className="flex-1 text-text-secondary typo-footnote">
            You removed tips from your feed.
          </span>
          <Button variant={ButtonVariant.Secondary} size={ButtonSize.Small}>
            Show tips in my feed
          </Button>
        </div>
      )}
      {groupOrder.map((group) => {
        const groupTips = list.filter((tip) => tip.group === group);
        if (!groupTips.length) {
          return null;
        }
        return (
          <section key={group} className="flex flex-col gap-1">
            <h2 className="font-bold text-text-tertiary typo-footnote">
              {group}
            </h2>
            <ul className="flex flex-col">
              {groupTips.map((tip) => (
                <li
                  key={tip.id}
                  className="border-b border-border-subtlest-tertiary last:border-0"
                >
                  <a
                    href="#"
                    onClick={preventDefault}
                    className="group/row -mx-2 flex items-start gap-3 rounded-12 px-2 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <TipIcon tip={tip} isLarge />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-bold text-text-primary typo-callout">
                        {tip.title}
                      </span>
                      <span className="text-text-tertiary typo-footnote">
                        {tip.description}
                      </span>
                    </span>
                    {tip.isExternal ? (
                      <OpenLinkIcon
                        size={IconSize.Size16}
                        className="mt-1 shrink-0 text-text-quaternary group-hover/row:text-text-primary"
                      />
                    ) : (
                      <ArrowIcon
                        size={IconSize.Size16}
                        className="mt-1 shrink-0 rotate-90 text-text-quaternary group-hover/row:text-text-primary"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
