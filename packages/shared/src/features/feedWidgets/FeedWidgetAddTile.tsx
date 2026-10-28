import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { PlusIcon } from '../../components/icons/Plus';
import { IconSize } from '../../components/Icon';
import { FeedWidgetKind } from './types';
import type { FeedWidgetTone } from './registry';
import { FeedWidgetIcon, getFeedWidgetDefinition } from './registry';
import { availableFeedWidgets } from './components';

const MAX_FILED = 3;

const webappOrder: FeedWidgetKind[] = [
  FeedWidgetKind.Streak,
  FeedWidgetKind.ReadingList,
  FeedWidgetKind.Shortcuts,
  FeedWidgetKind.TodoList,
  FeedWidgetKind.HappeningNow,
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

const washClassName: Record<FeedWidgetTone, string> = {
  avocado: 'from-accent-avocado-flat',
  bacon: 'from-accent-bacon-flat',
  bun: 'from-accent-bun-flat',
  cabbage: 'from-accent-cabbage-flat',
  cheese: 'from-accent-cheese-flat',
  onion: 'from-accent-onion-flat',
  water: 'from-accent-water-flat',
};

const iconClassName: Record<FeedWidgetTone, string> = {
  avocado: 'text-accent-avocado-default',
  bacon: 'text-accent-bacon-default',
  bun: 'text-accent-bun-default',
  cabbage: 'text-accent-cabbage-default',
  cheese: 'text-accent-cheese-default',
  onion: 'text-accent-onion-default',
  water: 'text-accent-water-default',
};

// Hover pulls the back files up a little; the open one stays put.
const spreadClassName = [
  'group-hover/add:-translate-y-2',
  'group-hover/add:-translate-y-1',
  '',
];

const PlaceholderRow = ({ isShort }: { isShort?: boolean }): ReactElement => (
  <span className="flex items-center gap-2">
    <span className="size-6 shrink-0 rounded-6 bg-surface-float" />
    <span className="flex flex-1 flex-col gap-1">
      <span
        className={classNames(
          'h-2 rounded-max bg-surface-float',
          isShort ? 'w-3/4' : 'w-full',
        )}
      />
      <span className="h-2 w-1/3 rounded-max bg-surface-float" />
    </span>
  </span>
);

/**
 * The empty slot at the end of a rail the reader has not made their own: a
 * plus that opens the gallery, the names of a few widgets it holds, and those
 * widgets filed one behind the other under it, the first one open in front.
 */
export const FeedWidgetAddTile = ({
  kinds,
  onClick,
  style,
}: {
  kinds: FeedWidgetKind[];
  onClick: () => void;
  style?: CSSProperties;
}): ReactElement => {
  const definitions = kinds.map(getFeedWidgetDefinition);
  const files = [...definitions].reverse();
  const spread = spreadClassName.slice(-files.length);

  return (
    <button
      type="button"
      aria-label="Add a widget"
      onClick={onClick}
      style={style}
      className="group/add relative flex min-h-0 snap-start flex-col items-center overflow-hidden rounded-16 border-2 border-dashed border-border-subtlest-secondary pt-20 text-center transition-colors hover:border-border-subtlest-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-16 bg-text-primary text-surface-invert shadow-2 transition-transform duration-200 group-hover/add:scale-105 group-active/add:scale-95 motion-reduce:transition-none">
        <PlusIcon size={IconSize.Large} />
      </span>
      <span className="mt-3 font-bold text-text-primary typo-callout">
        Add a widget
      </span>
      {definitions.length > 0 && (
        <span className="px-4 text-text-tertiary typo-footnote">
          {definitions.map(({ name }) => name).join(', ')} and more
        </span>
      )}
      <span aria-hidden className="relative mt-3 w-full flex-1">
        {files.map((definition, index) => (
          <span
            key={definition.kind}
            className={classNames(
              'absolute inset-x-6 flex flex-col gap-3 rounded-14 border border-border-subtlest-tertiary bg-background-default bg-gradient-to-b to-background-default p-3 text-left shadow-2 transition-transform duration-500 ease-out motion-reduce:transition-none',
              washClassName[definition.tone],
              spread[index],
            )}
            style={{ top: `${0.5 + index * 2.25}rem` }}
          >
            <span className="flex items-center gap-1.5">
              <FeedWidgetIcon
                kind={definition.kind}
                size={IconSize.Size16}
                className={iconClassName[definition.tone]}
              />
              <span className="font-bold text-text-primary typo-caption1">
                {definition.name}
              </span>
            </span>
            {index === files.length - 1 && (
              <>
                <PlaceholderRow />
                <PlaceholderRow isShort />
                <PlaceholderRow />
              </>
            )}
          </span>
        ))}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background-default to-transparent" />
      </span>
    </button>
  );
};
