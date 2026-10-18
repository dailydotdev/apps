import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PinIcon } from '@dailydotdev/shared/src/components/icons/Pin';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import type { ShelfWidget } from './shelf';
import { Shelf } from './shelf';
import type { Sponsor, WidgetKind, WidgetSize } from './catalog';
import { WidgetContent, WidgetSurface, widgetCatalog } from './catalog';
import { CustomizeButton, HeroInFeed } from './frame';

let uid = 0;
export const w = (
  kind: WidgetKind,
  size: WidgetSize,
  extra: Partial<ShelfWidget> = {},
): ShelfWidget => {
  uid += 1;
  return { id: `${kind}-${uid}`, kind, size, ...extra };
};

/** The five-column feed most laptops see; every direction is drawn on it. */
export const COLUMNS = 5;

export const DirectionNotes = ({
  pitch,
  overflow,
  ads,
  risk,
}: {
  pitch: string;
  overflow: string;
  ads: string;
  risk: string;
}): ReactElement => (
  <dl className="grid max-w-[80rem] grid-cols-1 gap-4 tablet:grid-cols-4">
    {[
      ['The idea', pitch],
      ['When it overflows', overflow],
      ['Where the ad lives', ads],
      ['The risk', risk],
    ].map(([term, text]) => (
      <div key={term} className="flex flex-col gap-1">
        <dt className="font-bold uppercase tracking-wider text-text-quaternary typo-caption2">
          {term}
        </dt>
        <dd className="text-text-secondary typo-callout">{text}</dd>
      </div>
    ))}
  </dl>
);

const HeroToolbar = ({
  left,
  isEditing,
  onToggle,
}: {
  left?: ReactNode;
  isEditing: boolean;
  onToggle: () => void;
}): ReactElement => (
  <div className="flex items-center gap-2">
    <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
    <CustomizeButton isEditing={isEditing} onClick={onToggle} />
  </div>
);

const useShelfState = (initial: ShelfWidget[]) => {
  const [widgets, setWidgets] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);
  return { widgets, setWidgets, isEditing, setIsEditing };
};

/* ------------------------------------------------------------------ */
/* A · Home Screen                                                     */
/* ------------------------------------------------------------------ */

export const HomeScreen = ({
  startEditing = false,
}: {
  startEditing?: boolean;
}): ReactElement => {
  const { widgets, setWidgets, isEditing, setIsEditing } = useShelfState([
    w('featured', 'l'),
    w('happening', 'm'),
    w('notifications', 's'),
    w('dms', 's'),
    w('ad', 'm', { isLocked: true }),
    w('bookmarks', 'm'),
    w('digest', 'w'),
    w('podcast', 's'),
    w('streak', 's'),
  ]);
  useEffect(() => setIsEditing(startEditing), [startEditing, setIsEditing]);

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <HeroToolbar
          isEditing={isEditing}
          onToggle={() => setIsEditing((value) => !value)}
        />
        <Shelf
          widgets={widgets}
          columns={COLUMNS}
          overflow="pages"
          isEditing={isEditing}
          onChange={setWidgets}
        />
      </div>
    </HeroInFeed>
  );
};

/* ------------------------------------------------------------------ */
/* B · Smart Stacks                                                    */
/* ------------------------------------------------------------------ */

type StackItem = { kind: WidgetKind; sponsor?: Sponsor };

const StackTile = ({
  items,
  size,
  className,
  autoplayMs,
}: {
  items: StackItem[];
  size: WidgetSize;
  className?: string;
  autoplayMs?: number;
}): ReactElement => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!autoplayMs) {
      return undefined;
    }
    const timer = setInterval(
      () => setIndex((value) => (value + 1) % items.length),
      autoplayMs,
    );
    return () => clearInterval(timer);
  }, [autoplayMs, items.length]);
  const item = items[index];

  return (
    <div className={classNames('relative flex min-h-0 min-w-0', className)}>
      {/* The peeking edge under the top card says "there is more here". */}
      {items.length > 1 && (
        <div className="absolute inset-x-3 -bottom-1.5 h-4 rounded-b-16 bg-surface-float" />
      )}
      <WidgetSurface className="relative flex-1">
        <WidgetContent kind={item.kind} size={size} sponsor={item.sponsor} />
        {items.length > 1 && (
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-1">
            {items.map((stacked, position) => (
              <button
                key={stacked.kind}
                type="button"
                aria-label={`Show ${widgetCatalog[stacked.kind].name}`}
                onClick={() => setIndex(position)}
                className={classNames(
                  'w-1 rounded-max transition-all',
                  position === index
                    ? 'h-3 bg-text-primary'
                    : 'h-1 bg-text-quaternary',
                )}
              />
            ))}
          </div>
        )}
      </WidgetSurface>
    </div>
  );
};

export const SmartStacks = (): ReactElement => (
  <HeroInFeed columns={COLUMNS}>
    <div
      className="grid gap-8 py-2"
      style={{
        gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
        gridTemplateRows: '27.5rem',
      }}
    >
      <StackTile
        className="col-span-2"
        size="l"
        items={[{ kind: 'featured' }, { kind: 'digest' }]}
      />
      <StackTile
        size="m"
        items={[
          { kind: 'happening' },
          { kind: 'agents' },
          { kind: 'trending' },
        ]}
      />
      <StackTile
        size="m"
        autoplayMs={4000}
        items={[
          { kind: 'notifications' },
          { kind: 'ad', sponsor: { name: 'Fastmail' } },
          { kind: 'dms' },
          { kind: 'squads' },
        ]}
      />
      <StackTile
        size="m"
        items={[{ kind: 'promo' }, { kind: 'bookmarks' }, { kind: 'whatsnew' }]}
      />
    </div>
  </HeroInFeed>
);

/* ------------------------------------------------------------------ */
/* C · Ours + Yours                                                    */
/* ------------------------------------------------------------------ */

const AddTile = ({ label }: { label: string }): ReactElement => (
  <button
    type="button"
    className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 rounded-16 border border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:bg-surface-hover"
  >
    <PlusIcon size={IconSize.Small} />
    <span className="typo-caption1">{label}</span>
  </button>
);

export const OursAndYours = (): ReactElement => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <HeroToolbar
          isEditing={isEditing}
          onToggle={() => setIsEditing((value) => !value)}
          left={
            isEditing && (
              <span className="text-text-tertiary typo-caption1">
                The first three columns are ours. The last two are yours: 3 of 4
                spots used.
              </span>
            )
          }
        />
        <div
          className="grid gap-x-8 gap-y-4 py-2"
          style={{
            gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))`,
            gridTemplateRows: 'repeat(2, 13.25rem)',
          }}
        >
          <div
            className={classNames(
              'col-span-3 row-span-2 grid grid-cols-3 gap-8 rounded-24 transition-all',
              isEditing && 'bg-surface-float p-2 opacity-70',
            )}
          >
            <WidgetSurface className="col-span-2">
              <WidgetContent kind="featured" size="l" />
            </WidgetSurface>
            <WidgetSurface>
              <WidgetContent kind="ad" size="m" />
            </WidgetSurface>
          </div>
          <WidgetSurface className={classNames(isEditing && 'hc-jiggle')}>
            <WidgetContent kind="notifications" size="s" />
          </WidgetSurface>
          <WidgetSurface className={classNames(isEditing && 'hc-jiggle')}>
            <WidgetContent kind="streak" size="s" />
          </WidgetSurface>
          <WidgetSurface className={classNames(isEditing && 'hc-jiggle')}>
            <WidgetContent kind="dms" size="s" />
          </WidgetSurface>
          {isEditing ? (
            <AddTile label="Add a widget" />
          ) : (
            <WidgetSurface>
              <WidgetContent kind="briefing" size="s" />
            </WidgetSurface>
          )}
        </div>
      </div>
    </HeroInFeed>
  );
};

/* ------------------------------------------------------------------ */
/* D · Rail                                                            */
/* ------------------------------------------------------------------ */

export const Rail = (): ReactElement => {
  const { widgets, setWidgets, isEditing, setIsEditing } = useShelfState([
    w('featured', 'l'),
    w('happening', 'm'),
    w('ad', 'm', { isLocked: true }),
    w('agents', 'm'),
    w('podcast', 's'),
    w('streak', 's'),
    w('digest', 'w'),
    w('squads', 'w'),
    w('dms', 'm'),
  ]);

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <HeroToolbar
          isEditing={isEditing}
          onToggle={() => setIsEditing((value) => !value)}
          left={
            <span className="text-text-quaternary typo-caption1">
              Scroll sideways for more →
            </span>
          }
        />
        <Shelf
          widgets={widgets}
          columns={COLUMNS}
          overflow="scroll"
          isEditing={isEditing}
          onChange={setWidgets}
        />
      </div>
    </HeroInFeed>
  );
};

/* ------------------------------------------------------------------ */
/* E · Spaces                                                          */
/* ------------------------------------------------------------------ */

const spaces: { name: string; widgets: ShelfWidget[] }[] = [
  {
    name: 'Morning',
    widgets: [
      w('briefing', 'w'),
      w('happening', 'm'),
      w('ad', 'm', { isLocked: true }),
      w('streak', 's'),
      w('notifications', 'w'),
      w('dms', 's'),
    ],
  },
  {
    name: 'Builder',
    widgets: [
      w('agents', 'l'),
      w('digest', 'm'),
      w('ad', 'm', { isLocked: true }),
      w('trending', 's'),
    ],
  },
  {
    name: 'Community',
    widgets: [
      w('squads', 'l'),
      w('dms', 'm'),
      w('ad', 'm', { isLocked: true }),
    ],
  },
];

export const Spaces = (): ReactElement => {
  const [active, setActive] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <HeroToolbar
          isEditing={isEditing}
          onToggle={() => setIsEditing((value) => !value)}
          left={
            <div className="flex items-center gap-1">
              {spaces.map((space, index) => (
                <button
                  key={space.name}
                  type="button"
                  onClick={() => setActive(index)}
                  className={classNames(
                    'h-8 rounded-10 px-3 font-bold typo-footnote',
                    index === active
                      ? 'bg-surface-float text-text-primary'
                      : 'text-text-tertiary hover:text-text-primary',
                  )}
                >
                  {space.name}
                </button>
              ))}
              <button
                type="button"
                aria-label="New space"
                className="flex size-8 items-center justify-center rounded-10 text-text-tertiary hover:bg-surface-hover"
              >
                <PlusIcon size={IconSize.Size16} />
              </button>
            </div>
          }
        />
        <Shelf
          key={active}
          widgets={spaces[active].widgets}
          columns={COLUMNS}
          overflow="limit"
          isEditing={isEditing}
        />
      </div>
    </HeroInFeed>
  );
};

/* ------------------------------------------------------------------ */
/* F · Sponsored skins                                                 */
/* ------------------------------------------------------------------ */

export const SponsoredSkins = (): ReactElement => (
  <HeroInFeed columns={COLUMNS}>
    <Shelf
      columns={COLUMNS}
      overflow="limit"
      widgets={[
        w('featured', 'l'),
        w('happening', 'm'),
        w('agents', 'm', { sponsor: { name: 'Cursor' } }),
        w('podcast', 's', { sponsor: { name: 'Vercel' } }),
        w('streak', 's'),
      ]}
    />
  </HeroInFeed>
);

/* ------------------------------------------------------------------ */
/* G · Adaptive                                                        */
/* ------------------------------------------------------------------ */

const moments: { name: string; reason: string; widgets: ShelfWidget[] }[] = [
  {
    name: 'Morning',
    reason: 'You read your brief before 10',
    widgets: [
      w('briefing', 'l'),
      w('happening', 'm', { isLocked: true }),
      w('promo', 'm', { sponsor: { name: 'Podcast' } }),
      w('streak', 's'),
      w('notifications', 's'),
    ],
  },
  {
    name: 'Afternoon',
    reason: 'Agents ship in the afternoon',
    widgets: [
      w('featured', 'l'),
      w('happening', 'm', { isLocked: true }),
      w('agents', 'm'),
      w('ad', 'm'),
    ],
  },
  {
    name: 'Evening',
    reason: 'You listen on the way home',
    widgets: [
      w('podcast', 'w'),
      w('continue', 'w'),
      w('happening', 'm', { isLocked: true }),
      w('squads', 'm'),
      w('ad', 's'),
      w('dms', 's'),
    ],
  },
];

export const Adaptive = (): ReactElement => {
  const [active, setActive] = useState(0);
  const moment = moments[active];

  return (
    <HeroInFeed columns={COLUMNS}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-text-tertiary typo-caption1">
            ✦ Arranged for you · {moment.reason}
          </span>
          <span className="flex items-center gap-1 rounded-8 bg-surface-float px-2 py-1 text-text-tertiary typo-caption1">
            <PinIcon size={IconSize.Size16} />
            Happening Now is pinned
          </span>
          <div className="ml-auto flex items-center gap-1 rounded-10 bg-surface-float p-1">
            {moments.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setActive(index)}
                className={classNames(
                  'h-7 rounded-8 px-3 typo-caption1',
                  index === active
                    ? 'bg-text-primary font-bold text-surface-invert'
                    : 'text-text-tertiary',
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        <Shelf
          key={active}
          widgets={moment.widgets}
          columns={COLUMNS}
          overflow="limit"
        />
      </div>
    </HeroInFeed>
  );
};
