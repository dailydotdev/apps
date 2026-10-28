import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../components/icons/Plus';
import { BookmarkIcon } from '../../components/icons/Bookmark';
import { ChecklistAIcon } from '../../components/icons/ChecklistA';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { ShortcutsIcon } from '../../components/icons/Shortcuts';
import { IconSize } from '../../components/Icon';
import { FeedWidgetKind } from './types';
import { FeedWidgetIcon, getFeedWidgetDefinition } from './registry';
import { availableFeedWidgets } from './components';

const MAX_FILED = 4;

const webappOrder: FeedWidgetKind[] = [
  FeedWidgetKind.HappeningNow,
  FeedWidgetKind.TodoList,
  FeedWidgetKind.Shortcuts,
  FeedWidgetKind.Streak,
  FeedWidgetKind.ReadingList,
];

// The new tab is where shortcuts live, so the extension leads with them.
const extensionOrder: FeedWidgetKind[] = [
  FeedWidgetKind.Shortcuts,
  ...webappOrder.filter((kind) => kind !== FeedWidgetKind.Shortcuts),
];

/** The widgets the tile names and files, best first, none already on the rail. */
export const getAddTileKinds = ({
  onRail,
  isLoggedIn,
  isExtension,
}: {
  onRail: FeedWidgetKind[];
  isLoggedIn: boolean;
  isExtension: boolean;
}): FeedWidgetKind[] => {
  // Only sign-in decides these kinds, so the rest of the reader's context
  // stays off.
  const available = new Set(
    availableFeedWidgets({
      isLoggedIn,
      hasSquads: false,
      isReadingStreakOn: true,
      hasMessages: false,
      hasLiveChat: false,
    }).map(({ kind }) => kind),
  );

  return (isExtension ? extensionOrder : webappOrder)
    .filter((kind) => available.has(kind) && !onRail.includes(kind))
    .slice(0, MAX_FILED);
};

const LiveDot = (): ReactElement => (
  <span className="relative flex size-4 shrink-0 items-center">
    <span className="absolute left-1 size-2 animate-ping rounded-max bg-accent-avocado-default opacity-50 motion-reduce:animate-none" />
    <span className="relative left-1 size-2 rounded-max bg-accent-avocado-default" />
  </span>
);

type FiledHeader = { icon: ReactNode; title: string; glow?: CSSProperties };

// Each widget's own header and corner glow, as the widget draws them, kept
// here so the rail does not load the widgets' code to show their headers.
const filedHeaders: Partial<Record<FeedWidgetKind, FiledHeader>> = {
  [FeedWidgetKind.HappeningNow]: {
    icon: <LiveDot />,
    title: 'Happening now',
    glow: {
      backgroundImage:
        'radial-gradient(90% 60% at 0% 0%, color-mix(in srgb, var(--theme-accent-avocado-default) 22%, transparent) 0%, transparent 70%)',
    },
  },
  [FeedWidgetKind.TodoList]: {
    icon: (
      <ChecklistAIcon
        secondary
        size={IconSize.Size16}
        className="shrink-0 text-accent-cabbage-default"
      />
    ),
    title: 'To-do list',
    glow: {
      backgroundImage:
        'radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%)',
    },
  },
  [FeedWidgetKind.Shortcuts]: {
    icon: (
      <ShortcutsIcon
        secondary
        size={IconSize.Size16}
        className="shrink-0 text-accent-water-default"
      />
    ),
    title: 'Shortcuts',
  },
  [FeedWidgetKind.Streak]: {
    icon: (
      <ReadingStreakIcon
        secondary
        size={IconSize.Size16}
        className="shrink-0 text-accent-bacon-default"
      />
    ),
    title: 'Streak',
  },
  [FeedWidgetKind.ReadingList]: {
    icon: (
      <BookmarkIcon
        secondary
        size={IconSize.Size16}
        className="shrink-0 text-accent-bun-default"
      />
    ),
    title: 'Bookmarks',
  },
};

const headerFor = (kind: FeedWidgetKind): FiledHeader =>
  filedHeaders[kind] ?? {
    icon: (
      <FeedWidgetIcon
        kind={kind}
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary"
      />
    ),
    title: getFeedWidgetDefinition(kind).name,
  };

/** The rows a widget shows while its data loads, as FeedWidgetLoading draws them. */
const loadingRowClassNames = [
  'h-5 w-2/5',
  'h-4 w-full',
  'h-4 w-4/5',
  'h-4 w-3/5',
];

// Cards further back sit in less light.
const dimClassName = ['', 'opacity-16', 'opacity-40', 'opacity-50'];

/** A widget as a card: the widget surface, its own header, its loading rows. */
const WidgetCard = ({
  kind,
  depth = 0,
  className,
  style,
}: {
  kind: FeedWidgetKind;
  /** How far behind the front card it sits; 0 is the front. */
  depth?: number;
  className?: string;
  style?: CSSProperties;
}): ReactElement => {
  const { icon, title, glow } = headerFor(kind);

  return (
    <span
      className={classNames(
        'absolute isolate flex h-36 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle py-3 text-left shadow-2 transition-transform duration-500 ease-out motion-reduce:transition-none',
        className,
      )}
      style={style}
    >
      {glow && (
        <span
          className="pointer-events-none absolute inset-0 -z-1"
          style={glow}
        />
      )}
      <span className="flex h-6 min-w-0 shrink-0 items-center gap-1.5 px-4">
        {icon}
        <span className="truncate font-bold text-text-primary typo-caption1">
          {title}
        </span>
      </span>
      <span className="mt-2 flex flex-col gap-3 px-4">
        {loadingRowClassNames.map((row) => (
          <span
            key={row}
            className={classNames('rounded-8 bg-surface-float', row)}
          />
        ))}
      </span>
      {depth > 0 && (
        <span
          className={classNames(
            'pointer-events-none absolute inset-0 bg-background-default',
            dimClassName[depth],
          )}
        />
      )}
    </span>
  );
};

const STACK_STEP_REM = 2.5;
const STACK_SCALE_STEP = 0.06;

/**
 * A deck seen from the front: the lead widget in front, each one behind it a
 * step up, a little smaller and dimmer. Hover lifts the deck apart.
 */
const StackedCards = ({
  kinds,
  isHovered,
}: {
  kinds: FeedWidgetKind[];
  isHovered: boolean;
}): ReactElement => {
  const back = kinds.length - 1;

  return (
    <>
      {[...kinds].reverse().map((kind, index) => {
        const depth = back - index;
        const lift = isHovered ? depth * 0.375 : 0;
        return (
          <WidgetCard
            key={kind}
            kind={kind}
            depth={depth}
            className="inset-x-6"
            style={{
              top: `${0.5 + index * STACK_STEP_REM}rem`,
              transform: `translateY(-${lift}rem) scale(${
                1 - depth * STACK_SCALE_STEP
              })`,
              transformOrigin: 'top center',
            }}
          />
        );
      })}
    </>
  );
};

// Back left, back right, then the lead widget in front; hover opens the hand.
const fanPlacement = [
  {
    rest: 'translateX(-80%) rotate(-10deg)',
    open: 'translateX(-90%) rotate(-14deg)',
    top: '2rem',
  },
  {
    rest: 'translateX(-20%) rotate(10deg)',
    open: 'translateX(-10%) rotate(14deg)',
    top: '2rem',
  },
];

/** A hand of three: the lead widget in front, the next two fanned behind it. */
const FannedCards = ({
  kinds,
  isHovered,
}: {
  kinds: FeedWidgetKind[];
  isHovered: boolean;
}): ReactElement => {
  const [lead, ...rest] = kinds.slice(0, 3);

  return (
    <>
      {rest.map((kind, index) => (
        <WidgetCard
          key={kind}
          kind={kind}
          depth={1}
          className="left-1/2 w-36"
          style={{
            top: fanPlacement[index].top,
            transform: isHovered
              ? fanPlacement[index].open
              : fanPlacement[index].rest,
          }}
        />
      ))}
      {lead && (
        <WidgetCard
          kind={lead}
          className="left-1/2 w-36"
          style={{
            top: '0.5rem',
            transform: `translateX(-50%) translateY(${
              isHovered ? '-0.5rem' : '0'
            })`,
          }}
        />
      )}
    </>
  );
};

export type FeedWidgetAddTileLayout = 'stack' | 'fan';

/**
 * The empty slot at the end of a rail the reader has not made their own: a
 * plus that opens the gallery, the names of a few widgets it holds, and those
 * widgets as cards under it, each on the widget surface with its own header,
 * stacked one behind the other or fanned like a hand.
 */
export const FeedWidgetAddTile = ({
  kinds,
  onClick,
  layout = 'stack',
  style,
}: {
  kinds: FeedWidgetKind[];
  onClick: () => void;
  layout?: FeedWidgetAddTileLayout;
  style?: CSSProperties;
}): ReactElement => {
  const [isHovered, setIsHovered] = useState(false);
  const Cards = layout === 'fan' ? FannedCards : StackedCards;

  return (
    <button
      type="button"
      aria-label="Add a widget"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      style={style}
      className="group/add relative flex min-h-0 snap-start flex-col items-center overflow-hidden rounded-16 border-2 border-dashed border-border-subtlest-secondary pt-20 text-center transition-colors hover:border-border-subtlest-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-16 bg-surface-float text-text-primary transition-[transform,background-color,color] duration-200 group-hover/add:scale-105 group-hover/add:bg-text-primary group-hover/add:text-surface-invert group-active/add:scale-95 motion-reduce:transition-none">
        <PlusIcon size={IconSize.Large} />
      </span>
      <span className="mt-3 font-bold text-text-primary typo-callout">
        Add a widget
      </span>
      {kinds.length > 0 && (
        <span className="px-4 text-text-tertiary typo-footnote">
          {kinds.map((kind) => getFeedWidgetDefinition(kind).name).join(', ')}{' '}
          and more
        </span>
      )}
      <span aria-hidden className="relative mt-3 w-full flex-1">
        <Cards kinds={kinds} isHovered={isHovered} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background-default to-transparent" />
      </span>
    </button>
  );
};
