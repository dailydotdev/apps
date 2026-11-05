import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../components/icons/Plus';
import { BookmarkIcon } from '../../components/icons/Bookmark';
import { ChecklistAIcon } from '../../components/icons/ChecklistA';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { ShortcutsIcon } from '../../components/icons/Shortcuts';
import { IconSize } from '../../components/Icon';
import { FeedWidgetKind } from './types';
import type { FeedWidgetAvailability } from './registry';
import { FeedWidgetIcon, getFeedWidgetDefinition } from './registry';
import { availableFeedWidgets } from './components';
import { happeningNowGlow, LiveDot, todoListGlow } from './widgets/material';

const MAX_FILED = 4;
const MAX_FANNED = 3;

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

export type AddTileKinds = {
  /** What the tile names and the gallery opens on: addable, best first. */
  addable: FeedWidgetKind[];
  /**
   * The cards in the hand: the addable ones, then widgets already on the
   * rail, so a rail that holds every suggestion still shows what a widget is.
   */
  fanned: FeedWidgetKind[];
};

/** The widgets the tile names and files, best first, none already on the rail. */
export const getAddTileKinds = ({
  onRail,
  isLoggedIn,
  isReadingStreakOn,
  isExtension,
}: Pick<FeedWidgetAvailability, 'isLoggedIn' | 'isReadingStreakOn'> & {
  onRail: FeedWidgetKind[];
  isExtension: boolean;
}): AddTileKinds => {
  const availability: FeedWidgetAvailability = {
    isLoggedIn,
    isReadingStreakOn,
    hasSquads: false,
    hasMessages: false,
    hasLiveChat: false,
  };
  const addableSet = new Set(
    availableFeedWidgets(availability)
      .filter((definition) => !definition.disabledReason?.(availability))
      .map(({ kind }) => kind),
  );
  const order = (isExtension ? extensionOrder : webappOrder).filter((kind) =>
    addableSet.has(kind),
  );
  const addable = order
    .filter((kind) => !onRail.includes(kind))
    .slice(0, MAX_FILED);
  const fanned = [
    ...addable,
    ...order.filter((kind) => onRail.includes(kind)),
  ].slice(0, MAX_FANNED);

  return { addable, fanned };
};

type FiledHeader = { icon: ReactNode; title: string; glow?: CSSProperties };

// Each widget's own header and corner glow, as the widget draws them, kept
// here so the rail does not load the widgets' code to show their headers.
const filedHeaders: Partial<Record<FeedWidgetKind, FiledHeader>> = {
  [FeedWidgetKind.HappeningNow]: {
    icon: <LiveDot />,
    title: 'Happening now',
    glow: happeningNowGlow,
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
    glow: todoListGlow,
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

/** A widget as a card: the widget surface, its own header, its loading rows. */
const WidgetCard = ({
  kind,
  isBehind = false,
  style,
}: {
  kind: FeedWidgetKind;
  isBehind?: boolean;
  style: CSSProperties;
}): ReactElement => {
  const { icon, title, glow } = headerFor(kind);

  return (
    <span
      className="absolute left-1/2 isolate flex h-36 w-40 flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle py-3 text-left shadow-2 transition-transform duration-500 ease-out motion-reduce:transition-none"
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
      {isBehind && (
        <span className="pointer-events-none absolute inset-0 bg-background-default opacity-16" />
      )}
    </span>
  );
};

/** A hand of three: the lead widget in front, the next two fanned behind it. */
const FannedCards = ({ kinds }: { kinds: FeedWidgetKind[] }): ReactElement => {
  const [lead, ...behind] = kinds.slice(0, MAX_FANNED);

  return (
    <>
      {behind.map((kind, index) => {
        const side = index === 0 ? -1 : 1;
        return (
          <WidgetCard
            key={kind}
            kind={kind}
            isBehind
            style={{
              top: '2rem',
              transform: `translateX(calc(-50% + ${side} * (42% + var(--add-tile-lift, 0) * 6%))) rotate(calc(${side} * (13deg + var(--add-tile-lift, 0) * 3deg)))`,
            }}
          />
        );
      })}
      {lead && (
        <WidgetCard
          kind={lead}
          style={{
            top: '0.5rem',
            transform:
              'translateX(-50%) translateY(calc(var(--add-tile-lift, 0) * -0.375rem))',
          }}
        />
      )}
    </>
  );
};

/**
 * The empty slot at the end of a rail the reader has not made their own: a
 * plus that opens the gallery, the names of a few widgets it holds, and those
 * widgets as cards under it, each on the widget surface with its own header,
 * fanned like a hand.
 */
export const FeedWidgetAddTile = ({
  kinds,
  onClick,
  style,
}: {
  kinds: AddTileKinds;
  onClick: () => void;
  style?: CSSProperties;
}): ReactElement => (
  <button
    type="button"
    aria-label="Add a widget"
    onClick={onClick}
    style={style}
    className="group/add relative flex min-h-0 snap-start flex-col items-center overflow-hidden rounded-16 border-2 border-dashed border-border-subtlest-secondary pt-20 text-center transition-colors hover:border-border-subtlest-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default motion-safe:focus-visible:[--add-tile-lift:1] motion-safe:mouse:hover:[--add-tile-lift:1]"
  >
    <span className="flex size-14 shrink-0 items-center justify-center rounded-16 bg-surface-float text-text-primary transition-[transform,background-color,color] duration-200 group-active/add:scale-95 motion-reduce:transition-none mouse:group-hover/add:scale-105 mouse:group-hover/add:bg-text-primary mouse:group-hover/add:text-surface-invert">
      <PlusIcon size={IconSize.Large} />
    </span>
    <span className="mt-3 font-bold text-text-primary typo-callout">
      Add a widget
    </span>
    {kinds.addable.length > 0 && (
      <span className="px-4 text-text-tertiary typo-footnote">
        {kinds.addable
          .map((kind) => getFeedWidgetDefinition(kind).name)
          .join(', ')}{' '}
        and more
      </span>
    )}
    <span aria-hidden className="relative mt-3 w-full flex-1">
      <FannedCards kinds={kinds.fanned} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background-default to-transparent" />
    </span>
  </button>
);
