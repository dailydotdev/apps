import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { TipIcon } from '@dailydotdev/shared/src/components/icons/Tip';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { toneClass } from '../data';
import type { WidgetCategory, WidgetKind, WidgetSize } from './catalog';
import {
  sizeLabel,
  sizeSpan,
  WidgetContent,
  widgetCatalog,
  WidgetSurface,
} from './catalog';
import { isCardWidget } from './production';
import { tips, TipStrip } from './tips';

/*
 * The widget gallery, rebuilt around what Apple's does well: you choose a
 * widget by seeing it. Production's gallery (feedWidgets/
 * FeedWidgetGallery.tsx) is a list of rows, each an icon, a name, a line
 * and an Add button, so the reader adds a widget without knowing what it
 * will look like or which sizes it comes in. Here the list is for finding
 * (search, suggestions, categories); the stage shows the real widget, live,
 * at the size the reader picks, and adds it in that size. Production's
 * rules carry over: kinds already on the rail say so, some can be added
 * more than once (a squad each), some need something first, a full rail
 * says why, and removed tips can come back.
 */

const order: WidgetKind[] = [
  'featured',
  'mybrief',
  'happening',
  'agents',
  'digest',
  'briefing',
  'podcast',
  'notifications',
  'dms',
  'bookmarks',
  'streak',
  'introquests',
  'squads',
  'weather',
  'shortcuts',
  'todo',
  'promo',
];

const suggested: WidgetKind[] = ['weather', 'todo', 'streak', 'digest'];

const categoryOrder: WidgetCategory[] = [
  'News',
  'You',
  'Community',
  'Tools',
  'daily.dev',
];

/** Kinds a reader can add more than once, each with its own subject. */
const allowMultiple: WidgetKind[] = ['squads'];

export type Unavailable = Partial<
  Record<WidgetKind, { reason: string; action: string }>
>;

export const unavailableExamples: Unavailable = {
  dms: {
    reason: 'Messages aren’t on for your account yet.',
    action: 'Learn about messages',
  },
  squads: {
    reason: 'Join a squad first, then follow its new posts here.',
    action: 'Find a squad',
  },
  streak: {
    reason: 'Reading streaks are off in your settings.',
    action: 'Turn on streaks',
  },
};

const rem = 16;
const sizeRem = (size: WidgetSize) => {
  const { cols, rows } = sizeSpan[size];
  return {
    width: cols * 17.25 + (cols - 1) * 2,
    height: rows * 13.25 + (rows - 1),
  };
};

/** The real widget, live, scaled to fit the room it is given. */
export const LivePreview = ({
  kind,
  size,
  maxWidth,
  maxHeight,
}: {
  kind: WidgetKind;
  size: WidgetSize;
  /** In rem. */
  maxWidth: number;
  maxHeight: number;
}): ReactElement => {
  const { width, height } = sizeRem(size);
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return (
    <div
      className="shrink-0"
      style={{ width: width * scale * rem, height: height * scale * rem }}
    >
      <div
        className="flex"
        style={{
          width: width * rem,
          height: height * rem,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        <WidgetSurface className="flex-1" isBare={isCardWidget(kind, size)}>
          <WidgetContent kind={kind} size={size} />
        </WidgetSurface>
      </div>
    </div>
  );
};

const KindIcon = ({
  kind,
  isLarge,
}: {
  kind: WidgetKind;
  isLarge?: boolean;
}): ReactElement => {
  const def = widgetCatalog[kind];
  return (
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center',
        isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10',
        toneClass[def.tone].subtle,
        toneClass[def.tone].text,
      )}
    >
      {def.icon(isLarge ? IconSize.Small : IconSize.Size16)}
    </span>
  );
};

const sizesOf = (kind: WidgetKind): WidgetSize[] =>
  (['s', 'm', 'l'] as WidgetSize[]).filter((size) =>
    widgetCatalog[kind].sizes.includes(size),
  );

const SizePicker = ({
  kind,
  size,
  onChange,
}: {
  kind: WidgetKind;
  size: WidgetSize;
  onChange: (size: WidgetSize) => void;
}): ReactElement => (
  <span role="radiogroup" className="flex rounded-10 bg-surface-float p-0.5">
    {sizesOf(kind).map((value) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={size === value}
        onClick={() => onChange(value)}
        className={classNames(
          'h-7 rounded-8 px-3 typo-footnote transition-colors',
          size === value
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {sizeLabel[value]}
      </button>
    ))}
  </span>
);

type Selection = WidgetKind | 'tips';

const Row = ({
  icon,
  name,
  isSelected,
  isOnRail,
  isLocked,
  onClick,
}: {
  icon: ReactNode;
  name: string;
  isSelected: boolean;
  isOnRail?: boolean;
  isLocked?: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    aria-current={isSelected}
    onClick={onClick}
    className={classNames(
      'flex h-11 w-full items-center gap-2.5 rounded-12 px-2 text-left transition-colors',
      isSelected ? 'bg-surface-float' : 'hover:bg-surface-hover',
    )}
  >
    {icon}
    <span
      className={classNames(
        'min-w-0 flex-1 truncate typo-callout',
        isSelected ? 'font-bold text-text-primary' : 'text-text-secondary',
      )}
    >
      {name}
    </span>
    {isOnRail && (
      <VIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-tertiary"
        aria-label="On your rail"
      />
    )}
    {isLocked && (
      <LockIcon
        size={IconSize.Size16}
        className="shrink-0 text-text-quaternary"
      />
    )}
  </button>
);

const TipsIcon = (): ReactElement => (
  <span className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-accent-cabbage-flat text-accent-cabbage-default">
    <TipIcon size={IconSize.Size16} />
  </span>
);

const Footer = ({
  kind,
  size,
  onRail,
  unavailable,
  isRailFull,
  onAdd,
}: {
  kind: WidgetKind;
  size: WidgetSize;
  onRail: WidgetKind[];
  unavailable: Unavailable;
  isRailFull: boolean;
  onAdd: (kind: WidgetKind, size: WidgetSize) => void;
}): ReactElement => {
  const isMultiple = allowMultiple.includes(kind);
  const isAdded = onRail.includes(kind);
  const blocked = unavailable[kind];
  const message =
    (blocked && blocked.reason) ||
    (isRailFull &&
      'Your rail is full. Remove a widget, or hide one, to add this.') ||
    (isAdded &&
      (isMultiple
        ? 'On your rail. Add another for a different squad.'
        : 'Already on your rail.')) ||
    `Adds a ${sizeLabel[size]} widget at the end of your rail.`;
  let action: ReactNode;
  if (blocked) {
    action = (
      <Button variant={ButtonVariant.Secondary} size={ButtonSize.Medium}>
        {blocked.action}
      </Button>
    );
  } else if (isAdded && !isMultiple) {
    action = (
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Medium}
        icon={<VIcon />}
        disabled
      >
        Added
      </Button>
    );
  } else {
    action = (
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        disabled={isRailFull}
        onClick={() => onAdd(kind, size)}
      >
        {isAdded ? 'Add another' : 'Add widget'}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-4 border-t border-border-subtlest-tertiary px-6 py-4">
      <span
        className={classNames(
          'min-w-0 flex-1 typo-footnote',
          blocked || isRailFull ? 'text-text-secondary' : 'text-text-tertiary',
        )}
      >
        {message}
      </span>
      {action}
    </div>
  );
};

/**
 * Desktop: the gallery as a two-pane modal. Find on the left, see and add
 * on the right; the size picker swaps the live preview in place.
 */
export const WidgetGallery = ({
  initial = 'featured',
  onRail = ['featured', 'happening', 'agents', 'notifications'],
  unavailable = {},
  isRailFull = false,
  hasTipsRemoved = false,
  initialQuery = '',
}: {
  initial?: Selection;
  onRail?: WidgetKind[];
  unavailable?: Unavailable;
  isRailFull?: boolean;
  hasTipsRemoved?: boolean;
  initialQuery?: string;
}): ReactElement => {
  const [selected, setSelected] = useState<Selection>(initial);
  const [sizes, setSizes] = useState<Partial<Record<WidgetKind, WidgetSize>>>(
    {},
  );
  const [query, setQuery] = useState(initialQuery);
  const [added, setAdded] = useState<WidgetKind[]>([]);
  const rail = [...onRail, ...added];
  const matches = (kind: WidgetKind) => {
    const def = widgetCatalog[kind];
    const text = `${def.name} ${def.description}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  };
  const visible = order.filter(matches);
  const sizeFor = (kind: WidgetKind) => sizes[kind] ?? sizesOf(kind)[0];

  const rowFor = (kind: WidgetKind) => (
    <Row
      key={kind}
      icon={<KindIcon kind={kind} />}
      name={widgetCatalog[kind].name}
      isSelected={selected === kind}
      isOnRail={rail.includes(kind)}
      isLocked={!!unavailable[kind]}
      onClick={() => setSelected(kind)}
    />
  );

  const kind = selected === 'tips' ? null : selected;
  const def = kind ? widgetCatalog[kind] : null;

  return (
    <div
      role="dialog"
      aria-label="Add a widget"
      className="flex h-[40rem] w-[62rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default shadow-2"
    >
      <aside className="flex w-[17rem] shrink-0 flex-col border-r border-border-subtlest-tertiary">
        <div className="flex flex-col gap-3 p-4">
          <span className="font-bold text-text-primary typo-title3">
            Add a widget
          </span>
          <label className="flex h-9 items-center gap-2 rounded-10 bg-surface-float px-2.5 focus-within:ring-2 focus-within:ring-accent-cabbage-default">
            <SearchIcon size={IconSize.Size16} className="text-text-tertiary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search widgets"
              className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-footnote placeholder:text-text-tertiary"
            />
          </label>
        </div>
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
          {!query && (
            <section className="flex flex-col">
              <span className="px-2 pb-1 font-bold text-text-tertiary typo-caption1">
                Suggested for you
              </span>
              {suggested.map(rowFor)}
            </section>
          )}
          {categoryOrder.map((category) => {
            const kinds = visible.filter(
              (item) =>
                widgetCatalog[item].category === category &&
                (query || !suggested.includes(item)),
            );
            const hasTips = category === 'daily.dev' && hasTipsRemoved;
            if (!kinds.length && !hasTips) {
              return null;
            }
            return (
              <section key={category} className="flex flex-col">
                <span className="px-2 pb-1 font-bold text-text-tertiary typo-caption1">
                  {category}
                </span>
                {kinds.map(rowFor)}
                {hasTips && (
                  <Row
                    icon={<TipsIcon />}
                    name="daily.dev tips"
                    isSelected={selected === 'tips'}
                    onClick={() => setSelected('tips')}
                  />
                )}
              </section>
            );
          })}
          {!visible.length && (
            <span className="px-2 py-6 text-center text-text-tertiary typo-footnote">
              No widget matches “{query}”.
            </span>
          )}
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <CloseButton
          size={ButtonSize.Small}
          className="!absolute right-3 top-3 z-1"
        />
        {kind && def ? (
          <>
            <div className="flex items-start gap-3 px-6 pb-4 pt-6">
              <KindIcon kind={kind} isLarge />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 pr-10">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-text-primary typo-title3">
                    {def.name}
                  </span>
                  <span className="rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption1">
                    {def.category}
                  </span>
                </span>
                <span className="text-text-secondary typo-callout">
                  {def.description}
                </span>
              </span>
            </div>
            <div className="flex justify-center pb-4">
              <SizePicker
                kind={kind}
                size={sizeFor(kind)}
                onChange={(size) =>
                  setSizes((current) => ({ ...current, [kind]: size }))
                }
              />
            </div>
            <div className="mx-6 flex min-h-0 flex-1 items-center justify-center rounded-20 bg-background-subtle p-6">
              <LivePreview
                key={`${kind}-${sizeFor(kind)}`}
                kind={kind}
                size={sizeFor(kind)}
                maxWidth={38}
                maxHeight={22}
              />
            </div>
            <Footer
              kind={kind}
              size={sizeFor(kind)}
              onRail={rail}
              unavailable={unavailable}
              isRailFull={isRailFull}
              onAdd={(value) => setAdded((current) => [...current, value])}
            />
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 px-6 pb-4 pt-6">
              <TipsIcon />
              <span className="flex flex-col gap-0.5 pr-10">
                <span className="font-bold text-text-primary typo-title3">
                  daily.dev tips
                </span>
                <span className="text-text-secondary typo-callout">
                  One tip over the ad, to get more out of daily.dev. You removed
                  them; they can come back.
                </span>
              </span>
            </div>
            <div className="mx-6 flex min-h-0 flex-1 items-center justify-center rounded-20 bg-background-subtle p-6">
              <div className="w-[17.25rem]">
                <TipStrip tip={tips[0]} />
              </div>
            </div>
            <div className="flex items-center gap-4 border-t border-border-subtlest-tertiary px-6 py-4">
              <span className="flex-1 text-text-tertiary typo-footnote">
                Shows over the ad slot again. Not a widget, so it takes no room.
              </span>
              <Button variant={ButtonVariant.Primary} size={ButtonSize.Medium}>
                Show tips again
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Phone: the sheet                                                    */
/* ------------------------------------------------------------------ */

const Sheet = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative flex h-[44rem] w-[23.4375rem] shrink-0 flex-col overflow-hidden rounded-32 border-4 border-border-subtlest-tertiary bg-overlay-quaternary-onion">
    <div className="mt-10 flex min-h-0 flex-1 flex-col rounded-t-24 bg-background-default">
      <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-max bg-surface-float" />
      {children}
    </div>
  </div>
);

/**
 * Phone, list: suggestions as big live cards that swipe sideways (iOS's
 * gallery opens on its popular widgets), then every widget as a row.
 */
export const WidgetGalleryPhone = ({
  onRail = ['featured', 'happening', 'agents', 'notifications'],
}: {
  onRail?: WidgetKind[];
}): ReactElement => (
  <Sheet>
    <div className="flex items-center justify-between px-4 pb-3 pt-3">
      <span className="font-bold text-text-primary typo-title3">
        Add a widget
      </span>
      <CloseButton size={ButtonSize.Small} />
    </div>
    <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-6">
      <label className="mx-4 flex h-10 shrink-0 items-center gap-2 rounded-12 bg-surface-float px-3">
        <SearchIcon size={IconSize.Size16} className="text-text-tertiary" />
        <span className="text-text-tertiary typo-callout">Search widgets</span>
      </label>
      <section className="flex flex-col gap-2">
        <span className="px-4 font-bold text-text-tertiary typo-caption1">
          Suggested for you
        </span>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4">
          {suggested.map((kind) => (
            <div key={kind} className="flex shrink-0 snap-start flex-col gap-2">
              <LivePreview
                kind={kind}
                size={sizesOf(kind).includes('m') ? 'm' : sizesOf(kind)[0]}
                maxWidth={13}
                maxHeight={21}
              />
              <span className="font-bold text-text-primary typo-footnote">
                {widgetCatalog[kind].name}
              </span>
            </div>
          ))}
        </div>
      </section>
      {categoryOrder.map((category) => {
        const kinds = order.filter(
          (kind) =>
            widgetCatalog[kind].category === category &&
            !suggested.includes(kind),
        );
        if (!kinds.length) {
          return null;
        }
        return (
          <section key={category} className="flex flex-col px-2">
            <span className="px-2 pb-1 font-bold text-text-tertiary typo-caption1">
              {category}
            </span>
            {kinds.map((kind) => (
              <span
                key={kind}
                className="flex h-14 items-center gap-3 rounded-12 px-2"
              >
                <KindIcon kind={kind} isLarge />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-bold text-text-primary typo-callout">
                    {widgetCatalog[kind].name}
                  </span>
                  <span className="truncate text-text-tertiary typo-caption1">
                    {widgetCatalog[kind].description}
                  </span>
                </span>
                {onRail.includes(kind) ? (
                  <VIcon
                    size={IconSize.Size16}
                    className="shrink-0 text-text-tertiary"
                  />
                ) : (
                  <ArrowIcon
                    size={IconSize.Size16}
                    className="shrink-0 rotate-90 text-text-quaternary"
                  />
                )}
              </span>
            ))}
          </section>
        );
      })}
    </div>
  </Sheet>
);

/**
 * Phone, detail: the sizes as pages you swipe, with dots under them, and
 * one Add widget button at the bottom, as iOS does.
 */
export const WidgetGalleryPhoneDetail = ({
  kind = 'weather',
}: {
  kind?: WidgetKind;
}): ReactElement => {
  const def = widgetCatalog[kind];
  const kindSizes = sizesOf(kind);
  const [page, setPage] = useState(0);
  return (
    <Sheet>
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          aria-label="Back"
        />
        <CloseButton size={ButtonSize.Small} />
      </div>
      <div className="flex flex-col items-center gap-1 px-6 text-center">
        <KindIcon kind={kind} isLarge />
        <span className="mt-1 font-bold text-text-primary typo-title3">
          {def.name}
        </span>
        <span className="text-text-secondary typo-footnote">
          {def.description}
        </span>
      </div>
      <div
        className="no-scrollbar mt-4 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
        onScroll={(event) => {
          const el = event.currentTarget;
          setPage(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {kindSizes.map((size) => (
          <div
            key={size}
            className="flex w-full shrink-0 snap-center flex-col items-center justify-center gap-3"
          >
            <LivePreview kind={kind} size={size} maxWidth={19} maxHeight={18} />
            <span className="font-bold text-text-tertiary typo-caption1">
              {sizeLabel[size]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 py-3">
        {kindSizes.map((size, index) => (
          <span
            key={size}
            className={classNames(
              'size-1.5 rounded-max',
              index === page ? 'bg-text-primary' : 'bg-surface-float',
            )}
          />
        ))}
      </div>
      <div className="px-4 pb-6">
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          className="w-full"
        >
          Add widget
        </Button>
      </div>
    </Sheet>
  );
};
