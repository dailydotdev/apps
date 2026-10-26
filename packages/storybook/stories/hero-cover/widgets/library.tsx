import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type {
  WidgetCategory,
  WidgetDef,
  WidgetKind,
  WidgetSize,
} from './catalog';
import { sizeLabel, sizeSpan, widgetCatalog } from './catalog';
import { shelfCss, WidgetCell } from './shelf';
import { toneClass } from '../data';
import { hasProductionUI, isNewFeature } from './production';

/** Agreed in review, in the order a reader would meet them. */
export const agreedWidgets: WidgetKind[] = [
  'featured',
  'weather',
  'shortcuts',
  'introquests',
  'todo',
  'happening',
  'notifications',
  'dms',
  'squads',
  'bookmarks',
  'digest',
  'streak',
  'briefing',
  'brieftext',
  'ad',
];

/** Built and reviewed, but not in the launch: Your briefing, Agent updates,
 * Podcast and From daily.dev, then the early ideas. */
export const ideaWidgets: WidgetKind[] = [
  'mybrief',
  'agents',
  'podcast',
  'promo',
  'whatsnew',
  'trending',
  'continue',
  'codingagents',
];

const sizeOrder: WidgetSize[] = ['s', 'm', 'l'];

const UNIT_WIDTH = 17.25;
const UNIT_HEIGHT = 13.25;
const GAP = 2;

const cellDimensions = (size: WidgetSize) => {
  const { cols, rows } = sizeSpan[size];
  return {
    width: `${cols * UNIT_WIDTH + (cols - 1) * GAP}rem`,
    height: `${rows * UNIT_HEIGHT + (rows - 1) * 1}rem`,
  };
};

/** The widget's footprint on the hero's grid: which cells of a 2×2 it takes. */
const Footprint = ({ size }: { size: WidgetSize }): ReactElement => {
  const { cols, rows } = sizeSpan[size];
  return (
    <span className="grid grid-cols-2 grid-rows-2 gap-0.5">
      {[0, 1, 2, 3].map((cell) => {
        const col = cell % 2;
        const row = Math.floor(cell / 2);
        return (
          <span
            key={cell}
            className={classNames(
              'size-2 rounded-2',
              col < cols && row < rows
                ? 'bg-current'
                : 'bg-current opacity-[0.24]',
            )}
          />
        );
      })}
    </span>
  );
};

const Chip = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'flex h-8 items-center gap-1.5 rounded-10 px-3 typo-footnote',
      isActive
        ? 'bg-text-primary font-bold text-surface-invert'
        : 'bg-surface-float text-text-secondary hover:text-text-primary',
    )}
  >
    {children}
  </button>
);

const Toggle = ({
  isOn,
  onChange,
  label,
}: {
  isOn: boolean;
  onChange: (value: boolean) => void;
  label: string;
}): ReactElement => (
  <button
    type="button"
    role="switch"
    aria-checked={isOn}
    onClick={() => onChange(!isOn)}
    className="flex h-8 items-center gap-2 text-text-secondary typo-footnote"
  >
    <span
      className={classNames(
        'flex h-5 w-8 items-center rounded-max p-0.5 transition-colors',
        isOn ? 'bg-accent-avocado-default' : 'bg-surface-float',
      )}
    >
      <span
        className={classNames(
          'size-4 rounded-max bg-text-primary transition-transform',
          isOn && 'translate-x-3',
        )}
      />
    </span>
    {label}
  </button>
);

/** Two neighbours from the catalog to stack under a widget, never itself. */
const stackFor = (kind: WidgetKind): WidgetKind[] =>
  agreedWidgets.filter((other) => other !== kind && other !== 'ad').slice(0, 2);

type Verdict = 'launch' | 'later' | 'cut';
type Decision = { verdict?: Verdict; sizes: WidgetSize[] };

const DECISIONS_KEY = 'hero-cover-widget-decisions';

const readDecisions = (): Record<string, Decision> => {
  try {
    return JSON.parse(window.localStorage.getItem(DECISIONS_KEY) ?? '{}');
  } catch {
    return {};
  }
};

/** A review verdict per widget, remembered in this browser while we decide. */
const useDecision = (
  kind: WidgetKind,
): [Decision, (next: Decision) => void] => {
  const [decision, setDecision] = useState<Decision>(
    () => readDecisions()[kind] ?? { sizes: [] },
  );
  const save = (next: Decision) => {
    setDecision(next);
    try {
      window.localStorage.setItem(
        DECISIONS_KEY,
        JSON.stringify({ ...readDecisions(), [kind]: next }),
      );
    } catch {
      // Private windows can refuse storage; the choice still holds on screen.
    }
  };
  return [decision, save];
};

const verdicts: { value: Verdict; label: string; on: string }[] = [
  {
    value: 'launch',
    label: 'Launch',
    on: 'bg-accent-avocado-default text-white',
  },
  { value: 'later', label: 'Later', on: 'bg-accent-cheese-default text-black' },
  { value: 'cut', label: 'Cut', on: 'bg-accent-ketchup-default text-white' },
];

const DecisionBar = ({ def }: { def: WidgetDef }): ReactElement => {
  const [decision, save] = useDecision(def.kind);
  return (
    <div className="flex flex-wrap items-center gap-2 typo-footnote">
      <span className="text-text-tertiary">Decision</span>
      {verdicts.map((v) => (
        <button
          key={v.value}
          type="button"
          aria-pressed={decision.verdict === v.value}
          onClick={() =>
            save({
              ...decision,
              verdict: decision.verdict === v.value ? undefined : v.value,
            })
          }
          className={classNames(
            'h-7 rounded-8 px-2.5 font-bold',
            decision.verdict === v.value
              ? v.on
              : 'bg-surface-float text-text-secondary hover:text-text-primary',
          )}
        >
          {v.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-border-subtlest-tertiary" />
      <span className="text-text-tertiary">Ship in</span>
      {sizeOrder
        .filter((size) => def.sizes.includes(size))
        .map((size) => {
          const isOn = decision.sizes.includes(size);
          return (
            <button
              key={size}
              type="button"
              aria-pressed={isOn}
              onClick={() =>
                save({
                  ...decision,
                  sizes: isOn
                    ? decision.sizes.filter((s) => s !== size)
                    : [...decision.sizes, size],
                })
              }
              className={classNames(
                'flex h-7 items-center gap-1.5 rounded-8 px-2.5',
                isOn
                  ? 'bg-text-primary font-bold text-surface-invert'
                  : 'bg-surface-float text-text-secondary hover:text-text-primary',
              )}
            >
              <Footprint size={size} />
              {sizeLabel[size]}
            </button>
          );
        })}
    </div>
  );
};

const WidgetEntry = ({
  def,
  sizes,
  isEditing,
  isStacked,
}: {
  def: WidgetDef;
  sizes: WidgetSize[];
  isEditing: boolean;
  isStacked: boolean;
}): ReactElement => (
  <section
    id={`widget-${def.kind}`}
    className="flex scroll-mt-28 flex-col gap-4 border-t border-border-subtlest-tertiary pt-8"
  >
    <header className="flex flex-wrap items-start gap-4">
      <span
        className={classNames(
          'flex size-10 shrink-0 items-center justify-center rounded-12',
          toneClass[def.tone].subtle,
        )}
      >
        {def.icon(IconSize.Small)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold text-text-primary typo-title3">
            {def.name}
          </h2>
          <span className="rounded-6 bg-surface-float px-1.5 text-text-tertiary typo-caption1">
            {def.category}
          </span>
          {def.isProposed && (
            <span className="rounded-6 bg-accent-cabbage-flat px-1.5 text-accent-cabbage-default typo-caption1">
              Idea
            </span>
          )}
          {isNewFeature(def.kind) && (
            <span className="rounded-6 bg-accent-bacon-flat px-1.5 text-accent-bacon-default typo-caption1">
              New · no production UI yet
            </span>
          )}
          {hasProductionUI(def.kind) && (
            <span className="rounded-6 bg-accent-avocado-flat px-1.5 text-accent-avocado-default typo-caption1">
              Production UI
            </span>
          )}
          {def.kind === 'ad' && (
            <span className="rounded-6 bg-accent-water-flat px-1.5 text-accent-water-default typo-caption1">
              Pinned by daily.dev
            </span>
          )}
        </div>
        <p className="max-w-[48rem] text-text-secondary typo-callout">
          {def.description}
        </p>
        <div className="mt-2">
          <DecisionBar def={def} />
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-12 bg-surface-float px-3 py-2">
        {def.sizes.map((size) => (
          <span
            key={size}
            className="flex items-center gap-1.5 text-text-tertiary typo-caption1"
          >
            <Footprint size={size} />
            {sizeLabel[size]}
          </span>
        ))}
      </div>
    </header>
    <div className="flex flex-wrap items-end gap-8">
      {sizeOrder
        .filter((size) => def.sizes.includes(size) && sizes.includes(size))
        .map((size) => (
          <figure key={size} className="flex flex-col gap-2">
            <figcaption className="flex items-center gap-2 text-text-tertiary typo-footnote">
              <Footprint size={size} />
              {sizeLabel[size]} · {sizeSpan[size].cols}×
              {sizeSpan[size].rows === 1 ? '½' : '1'}
              {size === def.sizes[0] && (
                <span className="text-text-quaternary">· default</span>
              )}
            </figcaption>
            <div className="flex" style={cellDimensions(size)}>
              <WidgetCell
                key={`${def.kind}-${size}-${isStacked}`}
                style={{ flex: 1 }}
                isEditing={isEditing}
                widget={{
                  id: `${def.kind}-${size}`,
                  kind: def.kind,
                  size,
                  isLocked: def.kind === 'ad',
                  stack: isStacked ? stackFor(def.kind) : undefined,
                }}
              />
            </div>
          </figure>
        ))}
    </div>
  </section>
);

type Filter = 'All' | WidgetCategory | 'Not launching';

const filters: Filter[] = [
  'All',
  'News',
  'You',
  'Community',
  'daily.dev',
  'Tools',
  'Sponsored',
  'Not launching',
];

export const WidgetLibrary = (): ReactElement => {
  const [filter, setFilter] = useState<Filter>('All');
  const [sizes, setSizes] = useState<WidgetSize[]>(sizeOrder);
  const [isEditing, setIsEditing] = useState(false);
  const [isStacked, setIsStacked] = useState(false);

  const shown = useMemo(() => {
    const kinds =
      filter === 'Not launching'
        ? ideaWidgets
        : [...agreedWidgets, ...ideaWidgets];
    return kinds
      .map((kind) => widgetCatalog[kind])
      .filter((def) =>
        filter === 'All' || filter === 'Not launching'
          ? true
          : def.category === filter,
      )
      .filter((def) => def.sizes.some((size) => sizes.includes(size)));
  }, [filter, sizes]);

  const toggleSize = (size: WidgetSize) =>
    setSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : sizeOrder.filter((item) => current.includes(item) || item === size),
    );

  return (
    <div className="flex flex-col gap-8">
      <style>{shelfCss}</style>
      <div className="sticky top-0 z-3 -mx-4 flex flex-col gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4 py-3 tablet:-mx-6 tablet:px-6 laptop:-mx-10 laptop:px-10">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((item) => (
            <Chip
              key={item}
              isActive={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </Chip>
          ))}
          <span className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
          {sizeOrder.map((size) => (
            <Chip
              key={size}
              isActive={sizes.includes(size)}
              onClick={() => toggleSize(size)}
            >
              <Footprint size={size} />
              {sizeLabel[size]}
            </Chip>
          ))}
          <span className="mx-2 h-6 w-px bg-border-subtlest-tertiary" />
          <Toggle isOn={isEditing} onChange={setIsEditing} label="Edit mode" />
          <Toggle isOn={isStacked} onChange={setIsStacked} label="In a stack" />
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto">
          {shown.map((def) => (
            <a
              key={def.kind}
              href={`#widget-${def.kind}`}
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-8 px-2 text-text-tertiary typo-caption1 hover:bg-surface-hover hover:text-text-primary"
            >
              {def.icon(IconSize.Size16)}
              {def.name}
            </a>
          ))}
        </nav>
      </div>
      {shown.map((def) => (
        <WidgetEntry
          key={def.kind}
          def={def}
          sizes={sizes}
          isEditing={isEditing}
          isStacked={isStacked}
        />
      ))}
      {!shown.length && (
        <p className="text-text-tertiary typo-callout">
          No widget comes in the sizes you picked.
        </p>
      )}
    </div>
  );
};
