import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { ChecklistAIcon } from '@dailydotdev/shared/src/components/icons/ChecklistA';
import { EarthIcon } from '@dailydotdev/shared/src/components/icons/Earth';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { HashtagIcon } from '@dailydotdev/shared/src/components/icons/Hashtag';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { ShortcutsIcon } from '@dailydotdev/shared/src/components/icons/Shortcuts';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import { cloudinaryPatchyWaiting } from '@dailydotdev/shared/src/lib/image';
import type { Tone } from '../data';
import { toneClass } from '../data';

/*
 * The dashed "Add a widget" tile at the end of a rail nobody has customized
 * yet, redrawn ten ways. Each one says which widgets are behind it, and in
 * the extension, where the new tab's shortcuts used to be a row of their
 * own, each one leads with Shortcuts so the widget becomes the one place
 * for them.
 */

export type Surface = 'webapp' | 'extension';
/** The empty slot's edge: production's dashes, or dots. */
export type Edge = 'dashed' | 'dotted';

export const addTileCss = `
@keyframes atEnter {
  from { opacity: 0; transform: translateY(8px); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: none; }
}
.at-enter { animation: atEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes atFlap {
  from { opacity: 0; transform: translateY(55%); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: none; }
}
.at-flap { animation: atFlap 380ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes atOrbit {
  to { transform: rotate(360deg); }
}
.at-orbit { animation: atOrbit 56s linear infinite; }
.at-orbit-item { animation: atOrbit 56s linear infinite reverse; }
.add-tile:hover .at-orbit, .add-tile:hover .at-orbit-item { animation-play-state: paused; }
@keyframes atGlow {
  from { transform: scale(1); opacity: 0.55; }
  to { transform: scale(1.12); opacity: 0.85; }
}
.at-glow { animation: atGlow 5s ease-in-out infinite alternate; }
@keyframes atBob {
  to { transform: translateY(-4px); }
}
.at-bob { animation: atBob 2.6s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .at-enter, .at-flap, .at-orbit, .at-orbit-item, .at-glow, .at-bob { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/* The widgets the tile talks about                                     */
/* ------------------------------------------------------------------ */

const favicon = (domain: string): string =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

/** The extension's most visited sites; on the webapp, sites a reader pins. */
const sites: Record<Surface, { domain: string; name: string }[]> = {
  extension: [
    { domain: 'github.com', name: 'GitHub' },
    { domain: 'stackoverflow.com', name: 'Stack Overflow' },
    { domain: 'mail.google.com', name: 'Gmail' },
    { domain: 'claude.ai', name: 'Claude' },
    { domain: 'youtube.com', name: 'YouTube' },
    { domain: 'figma.com', name: 'Figma' },
    { domain: 'linear.app', name: 'Linear' },
    { domain: 'vercel.com', name: 'Vercel' },
    { domain: 'news.ycombinator.com', name: 'Hacker News' },
  ],
  webapp: [
    { domain: 'github.com', name: 'GitHub' },
    { domain: 'linear.app', name: 'Linear' },
    { domain: 'vercel.com', name: 'Vercel' },
    { domain: 'figma.com', name: 'Figma' },
    { domain: 'claude.ai', name: 'Claude' },
    { domain: 'developer.mozilla.org', name: 'MDN' },
    { domain: 'notion.so', name: 'Notion' },
    { domain: 'slack.com', name: 'Slack' },
    { domain: 'npmjs.com', name: 'npm' },
  ],
};

const Favicon = ({
  domain,
  className,
}: {
  domain: string;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center rounded-10 bg-surface-float',
      className ?? 'size-9',
    )}
  >
    <img
      src={favicon(domain)}
      alt=""
      loading="lazy"
      className="size-1/2 rounded-4 object-contain"
    />
  </span>
);

export type Pick = {
  id: 'shortcuts' | 'streak' | 'bookmarks' | 'todo' | 'happening';
  name: string;
  tone: Tone;
  icon: (size: IconSize) => ReactElement;
  blurb: Record<Surface, string>;
};

export const picks: Record<Pick['id'], Pick> = {
  shortcuts: {
    id: 'shortcuts',
    name: 'Shortcuts',
    tone: 'onion',
    icon: (size) => <ShortcutsIcon secondary size={size} />,
    blurb: {
      webapp: 'The sites you pinned, one tap from the feed.',
      extension: 'Your most visited sites, here instead of the browser bar.',
    },
  },
  streak: {
    id: 'streak',
    name: 'Streak',
    tone: 'bacon',
    icon: (size) => <ReadingStreakIcon secondary size={size} />,
    blurb: {
      webapp: 'Your reading streak and today’s goal.',
      extension: 'Your reading streak and today’s goal.',
    },
  },
  bookmarks: {
    id: 'bookmarks',
    name: 'Bookmarks',
    tone: 'bun',
    icon: (size) => <BookmarkIcon secondary size={size} />,
    blurb: {
      webapp: 'The posts you saved, newest first.',
      extension: 'The posts you saved, newest first.',
    },
  },
  todo: {
    id: 'todo',
    name: 'To-do list',
    tone: 'cabbage',
    icon: (size) => <ChecklistAIcon secondary size={size} />,
    blurb: {
      webapp: 'A short list of things to get to today.',
      extension: 'A short list of things to get to today.',
    },
  },
  happening: {
    id: 'happening',
    name: 'Happening Now',
    tone: 'avocado',
    icon: (size) => <EarthIcon secondary size={size} />,
    blurb: {
      webapp: 'The major headlines, as they break.',
      extension: 'The major headlines, as they break.',
    },
  },
};

/** The order the tile shows them in: the extension leads with Shortcuts. */
export const picksFor = (surface: Surface): Pick[] => {
  const rest = [picks.happening, picks.todo, picks.streak, picks.bookmarks];
  return surface === 'extension'
    ? [picks.shortcuts, ...rest]
    : [...rest.slice(0, 2), picks.shortcuts, ...rest.slice(2)];
};

const WIDGET_COUNT = 12;

/** More kinds than the tile previews, for rows of icons. */
const moreIcons: { tone: Tone; icon: (size: IconSize) => ReactElement }[] = [
  { tone: 'water', icon: (size) => <HashtagIcon secondary size={size} /> },
  { tone: 'cheese', icon: (size) => <FlagIcon secondary size={size} /> },
];

const KindTile = ({
  pick,
  className,
  iconSize = IconSize.Size16,
}: {
  pick: Pick;
  className?: string;
  iconSize?: IconSize;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center justify-center',
      toneClass[pick.tone].subtle,
      toneClass[pick.tone].text,
      className ?? 'size-9 rounded-10',
    )}
  >
    {pick.icon(iconSize)}
  </span>
);

/** A row of the kinds behind the tile, icons only. */
const IconStrip = ({
  surface,
  className,
}: {
  surface: Surface;
  className?: string;
}): ReactElement => (
  <span className={classNames('flex items-center -space-x-1', className)}>
    {picksFor(surface)
      .slice(0, 5)
      .map((pick) => (
        <KindTile
          key={pick.id}
          pick={pick}
          className="size-7 rounded-8 ring-2 ring-background-default"
        />
      ))}
  </span>
);

const FaviconStrip = ({
  surface,
  count = 5,
  className,
}: {
  surface: Surface;
  count?: number;
  className?: string;
}): ReactElement => (
  <span className={classNames('flex items-center -space-x-1', className)}>
    {sites[surface].slice(0, count).map(({ domain }) => (
      <Favicon
        key={domain}
        domain={domain}
        className="size-7 rounded-8 ring-2 ring-background-default"
      />
    ))}
  </span>
);

/* ------------------------------------------------------------------ */
/* Miniature widgets                                                    */
/* ------------------------------------------------------------------ */

const Bar = ({ className }: { className?: string }): ReactElement => (
  <span className={classNames('h-2 rounded-max bg-surface-float', className)} />
);

const MiniCard = ({
  pick,
  children,
  className,
}: {
  pick: Pick;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2',
      className,
    )}
  >
    <div className="flex items-center gap-1.5">
      <span className={toneClass[pick.tone].text}>
        {pick.icon(IconSize.Size16)}
      </span>
      <span className="font-bold text-text-primary typo-caption1">
        {pick.name}
      </span>
    </div>
    {children}
  </div>
);

/** A small, honest picture of the widget: real numbers, no lorem. */
export const Mini = ({
  pick,
  surface,
  className: outerClassName,
  isTinted,
}: {
  pick: Pick;
  surface: Surface;
  className?: string;
  /** A wash of the widget's color from the top, for stacks that show only headers. */
  isTinted?: boolean;
}): ReactElement => {
  const className = classNames(
    outerClassName,
    isTinted &&
      classNames(
        'bg-gradient-to-b to-background-default',
        toneClass[pick.tone].wash,
      ),
  );
  switch (pick.id) {
    case 'streak':
      return (
        <MiniCard pick={pick} className={className}>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold tabular-nums text-text-primary typo-title2">
              12
            </span>
            <span className="text-text-tertiary typo-caption1">day streak</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }, (_, day) => (
              <span
                // The week's days, in order.
                // eslint-disable-next-line react/no-array-index-key
                key={day}
                className={classNames(
                  'size-2.5 rounded-max',
                  day < 5 ? toneClass.bacon.fill : 'bg-surface-float',
                )}
              />
            ))}
          </div>
        </MiniCard>
      );
    case 'bookmarks':
      return (
        <MiniCard pick={pick} className={className}>
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="size-6 shrink-0 rounded-6 bg-surface-float" />
              <span className="flex flex-1 flex-col gap-1">
                <Bar className={row === 1 ? 'w-3/4' : 'w-full'} />
                <Bar className="w-1/3" />
              </span>
            </div>
          ))}
        </MiniCard>
      );
    case 'todo':
      return (
        <MiniCard pick={pick} className={className}>
          {['Review the PR', 'Reply to Ido', 'Ship the widget'].map(
            (task, row) => (
              <div key={task} className="flex items-center gap-2">
                <span
                  className={classNames(
                    'flex size-4 shrink-0 items-center justify-center rounded-4 border',
                    row === 0
                      ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white'
                      : 'border-border-subtlest-primary',
                  )}
                >
                  {row === 0 && <VIcon size={IconSize.XXSmall} />}
                </span>
                <span
                  className={classNames(
                    'truncate typo-caption1',
                    row === 0
                      ? 'text-text-quaternary line-through'
                      : 'text-text-secondary',
                  )}
                >
                  {task}
                </span>
              </div>
            ),
          )}
        </MiniCard>
      );
    case 'happening':
      return (
        <MiniCard pick={pick} className={className}>
          {[
            'OpenAI ships GPT‑6 to the API',
            'Bun 2.0 lands with Node parity',
          ].map((title) => (
            <div key={title} className="flex items-start gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-max bg-accent-avocado-default" />
              <span className="line-clamp-2 min-w-0 flex-1 text-text-secondary typo-caption1">
                {title}
              </span>
            </div>
          ))}
        </MiniCard>
      );
    case 'shortcuts':
    default:
      return (
        <MiniCard pick={pick} className={className}>
          <div className="grid grid-cols-3 gap-1.5">
            {sites[surface].slice(0, 6).map(({ domain }) => (
              <Favicon key={domain} domain={domain} className="h-8 w-full" />
            ))}
          </div>
        </MiniCard>
      );
  }
};

/* ------------------------------------------------------------------ */
/* Shared frame                                                         */
/* ------------------------------------------------------------------ */

const useCycle = (
  length: number,
  dwell: (index: number) => number,
  isPaused: boolean,
): number => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (isPaused) {
      return undefined;
    }
    const id = window.setTimeout(
      () => setIndex((current) => (current + 1) % length),
      dwell(index),
    );
    return () => window.clearTimeout(id);
  }, [index, length, dwell, isPaused]);
  return index;
};

const frameClassName =
  'add-tile group relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-16 border-2 border-border-subtlest-secondary text-left transition-colors duration-200 hover:border-border-subtlest-primary hover:bg-surface-hover motion-reduce:transition-none';

const edgeClassName: Record<Edge, string> = {
  dashed: 'border-dashed',
  dotted: 'border-dotted',
};

/**
 * The empty slot, as production draws it: a dashed edge and no fill, so it
 * reads as a space and not a widget. The primary button inside is the one
 * thing to click; the rest of the tile shows what the click gives.
 */
const TileGroup = ({
  label = 'Add a widget',
  edge,
  className,
  onHover,
  children,
}: {
  label?: string;
  edge: Edge;
  className?: string;
  onHover?: (isHovered: boolean) => void;
  children: ReactNode;
}): ReactElement => (
  <div
    role="group"
    aria-label={label}
    onMouseEnter={() => onHover?.(true)}
    onMouseLeave={() => onHover?.(false)}
    className={classNames(frameClassName, edgeClassName[edge], className)}
  >
    {children}
  </div>
);

/** The one explicit action, full width at the foot of every tile. */
const PrimaryCta = ({
  children,
  secondary,
  className,
}: {
  children: ReactNode;
  /** A quieter second way, as a line under the button. */
  secondary?: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col items-center gap-2 px-4 pb-4',
      className,
    )}
  >
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Medium}
      className="w-full"
      icon={<PlusIcon />}
    >
      {children}
    </Button>
    {secondary && (
      <button
        type="button"
        className="text-text-tertiary typo-caption1 transition-colors hover:text-text-primary"
      >
        {secondary}
      </button>
    )}
  </div>
);

const TileHeader = ({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}): ReactElement => (
  <div className="flex items-center justify-between gap-2 px-4 pt-4">
    <span className="font-bold text-text-primary typo-callout">{title}</span>
    {trailing ?? (
      <span className="text-text-quaternary typo-caption1">
        {WIDGET_COUNT} widgets
      </span>
    )}
  </div>
);

const Dots = ({
  count,
  index,
}: {
  count: number;
  index: number;
}): ReactElement => (
  <span className="flex items-center gap-1">
    {Array.from({ length: count }, (_, dot) => (
      <span
        // Position in the cycle, nothing else.
        // eslint-disable-next-line react/no-array-index-key
        key={dot}
        className={classNames(
          'h-1 rounded-max transition-all duration-300',
          dot === index
            ? 'w-3 bg-text-primary'
            : 'w-1 bg-border-subtlest-primary',
        )}
      />
    ))}
  </span>
);

export type TileProps = { surface: Surface; edge: Edge };

/* ------------------------------------------------------------------ */
/* 1. Rotating stage                                                    */
/* ------------------------------------------------------------------ */

/**
 * A miniature of one widget at a time on a small stage, swapped every few
 * seconds with a soft blur, named underneath. The tile answers "what can go
 * here?" by showing it; hovering holds the one you are looking at.
 */
export const RotatingStageTile = ({
  surface,
  edge,
}: TileProps): ReactElement => {
  const list = picksFor(surface);
  const [isHovered, setIsHovered] = useState(false);
  const index = useCycle(list.length, () => 3200, isHovered);
  const pick = list[index];
  const isSites = pick.id === 'shortcuts' && surface === 'extension';

  return (
    <TileGroup edge={edge} onHover={setIsHovered}>
      <TileHeader title="Add a widget" />
      <div className="flex flex-1 flex-col items-center justify-center px-5">
        <div key={pick.id} className="at-enter w-full">
          <Mini pick={pick} surface={surface} />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 pb-3">
        <span className="flex items-center justify-between">
          <span
            key={`${pick.id}-name`}
            className="at-enter font-bold text-text-primary typo-callout"
          >
            {pick.name}
          </span>
          <Dots count={list.length} index={index} />
        </span>
        <span className="line-clamp-2 min-h-8 text-text-tertiary typo-footnote">
          {pick.blurb[surface]}
        </span>
      </div>
      <PrimaryCta secondary={`or browse all ${WIDGET_COUNT}`}>
        Add {isSites ? 'your shortcuts' : pick.name}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 2. Hand of cards                                                     */
/* ------------------------------------------------------------------ */

/**
 * Three miniatures fanned like a hand of cards, the one on top being the
 * first we suggest. Hover spreads the hand. The deck says "there is a set
 * to choose from" at a glance, before a single word.
 */
export const HandOfCardsTile = ({ surface, edge }: TileProps): ReactElement => {
  const [front, left, right] = picksFor(surface);
  const isExtension = surface === 'extension';
  const card =
    'absolute left-1/2 top-1/2 w-40 transition-transform duration-500 ease-out motion-reduce:transition-none';

  return (
    <TileGroup edge={edge}>
      <div className="relative flex-1">
        <div
          className={classNames(
            card,
            '-translate-x-1/2 -translate-y-1/2 -rotate-12 group-hover:-translate-x-[72%] group-hover:-rotate-[18deg]',
          )}
          style={{ marginLeft: '-3.5rem', marginTop: '1.25rem' }}
        >
          <Mini pick={left} surface={surface} />
        </div>
        <div
          className={classNames(
            card,
            '-translate-x-1/2 -translate-y-1/2 rotate-12 group-hover:-translate-x-[28%] group-hover:rotate-[18deg]',
          )}
          style={{ marginLeft: '3.5rem', marginTop: '1.25rem' }}
        >
          <Mini pick={right} surface={surface} />
        </div>
        <div
          className={classNames(
            card,
            '-translate-x-1/2 -translate-y-1/2 group-hover:-translate-y-[56%]',
          )}
        >
          <Mini pick={front} surface={surface} />
        </div>
      </div>
      <div className="flex flex-col gap-1 px-4 pb-3">
        <span className="font-bold text-text-primary typo-callout">
          {isExtension ? 'Start with your shortcuts' : 'Pick your first widget'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {isExtension
            ? `Then ${left.name}, ${right.name} and ${WIDGET_COUNT - 3} more.`
            : `${front.name}, ${left.name}, ${right.name} and ${
                WIDGET_COUNT - 3
              } more.`}
        </span>
      </div>
      <PrimaryCta>
        {isExtension ? 'Add your shortcuts' : 'Add a widget'}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 3. Orbit                                                             */
/* ------------------------------------------------------------------ */

/**
 * The widgets' icons on a slow ring around a plus, each in its own tint,
 * the way a launcher shows what it holds. The ring turns once a minute
 * and stops under the pointer. In the extension the Shortcuts chip is a
 * cluster of the reader's own favicons, twice the size of the rest.
 */
export const OrbitTile = ({ surface, edge }: TileProps): ReactElement => {
  const list = picksFor(surface);
  const isExtension = surface === 'extension';
  const radius = 5;

  return (
    <TileGroup edge={edge}>
      <div className="relative flex-1">
        <div className="absolute inset-0 at-orbit">
          {list.map((pick, index) => {
            const angle = (index / list.length) * Math.PI * 2 - Math.PI / 2;
            const style: CSSProperties = {
              left: `calc(50% + ${Math.cos(angle) * radius}rem)`,
              top: `calc(50% + ${Math.sin(angle) * radius}rem)`,
            };
            const isSites = surface === 'extension' && pick.id === 'shortcuts';
            return (
              <span
                key={pick.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={style}
              >
                {isSites ? (
                  <span className="at-orbit-item grid size-14 grid-cols-2 gap-1 rounded-14 bg-background-default p-1.5 shadow-2">
                    {sites.extension.slice(0, 4).map(({ domain }) => (
                      <Favicon
                        key={domain}
                        domain={domain}
                        className="size-full rounded-6"
                      />
                    ))}
                  </span>
                ) : (
                  <KindTile
                    pick={pick}
                    className="at-orbit-item size-10 rounded-12 shadow-2"
                    iconSize={IconSize.Small}
                  />
                )}
              </span>
            );
          })}
        </div>
        <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-max bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
          <PlusIcon size={IconSize.Large} />
        </span>
      </div>
      <div className="flex flex-col gap-1 px-4 pb-3 text-center">
        <span className="font-bold text-text-primary typo-callout">
          {isExtension ? 'Your shortcuts and 11 more' : 'Pick a widget'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {isExtension
            ? 'Your most visited sites, your streak, your bookmarks.'
            : `${WIDGET_COUNT} to choose from, each in three sizes.`}
        </span>
      </div>
      <PrimaryCta secondary={isExtension ? 'or any other widget' : undefined}>
        {isExtension ? 'Add your shortcuts' : 'Add a widget'}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 4. Your sites, here                                                  */
/* ------------------------------------------------------------------ */

/**
 * A faint grid of what the slot would hold, and a panel that names it.
 * In the extension the grid is the reader's most visited sites, so the
 * tile is the shortcuts row's new home, with the other widgets a line
 * below. On the webapp the grid is the widgets' icons.
 */
export const YourSitesTile = ({ surface, edge }: TileProps): ReactElement => {
  const isExtension = surface === 'extension';
  const list = picksFor(surface);

  return (
    <TileGroup edge={edge}>
      <div className="relative flex-1 overflow-hidden px-4 pt-4">
        <div className="grid grid-cols-3 gap-2 opacity-64 transition-opacity duration-300 group-hover:opacity-100">
          {isExtension
            ? sites.extension.map(({ domain, name }) => (
                <span key={domain} className="flex flex-col items-center gap-1">
                  <Favicon domain={domain} className="size-11 rounded-12" />
                  <span className="max-w-full truncate text-text-tertiary typo-caption2">
                    {name}
                  </span>
                </span>
              ))
            : [...list, ...moreIcons, ...list.slice(0, 4)].map(
                (item, index) => (
                  <span
                    // A mosaic: the kinds repeat to fill it.
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={classNames(
                      'flex h-14 items-center justify-center rounded-12',
                      toneClass[item.tone].subtle,
                      toneClass[item.tone].text,
                    )}
                  >
                    {item.icon(IconSize.Small)}
                  </span>
                ),
              )}
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background-default to-transparent" />
      </div>
      <div className="flex flex-col gap-1 px-4 pb-3">
        <span className="font-bold text-text-primary typo-callout">
          {isExtension ? 'Your shortcuts belong here' : 'Add a widget'}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {isExtension
            ? 'The sites you open most, where your new tab starts.'
            : 'Streak, bookmarks, shortcuts, to-do and more.'}
        </span>
      </div>
      <PrimaryCta secondary={isExtension ? 'or any other widget' : undefined}>
        {isExtension ? 'Add your shortcuts' : 'Add a widget'}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 5. Quick picks                                                       */
/* ------------------------------------------------------------------ */

/**
 * The tile is the gallery's first page: four rows, each adds that widget
 * in one tap, and a last row opens the rest. One step less than the dashed
 * tile, and the names are right there. The extension's first row is
 * Shortcuts, tagged for the new tab.
 */
export const QuickPicksTile = ({ surface, edge }: TileProps): ReactElement => {
  const list = picksFor(surface).slice(0, 4);

  return (
    <TileGroup edge={edge}>
      <TileHeader title="Add a widget" />
      <div className="flex flex-1 flex-col justify-center gap-0.5 px-2 pt-2">
        {list.map((pick) => (
          <button
            key={pick.id}
            type="button"
            className="group/row flex items-center gap-2.5 rounded-12 px-2 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <KindTile pick={pick} iconSize={IconSize.Small} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-1.5">
                <span className="truncate font-bold text-text-primary typo-footnote">
                  {pick.name}
                </span>
                {surface === 'extension' && pick.id === 'shortcuts' && (
                  <span className="rounded-6 bg-accent-onion-flat px-1.5 text-accent-onion-default typo-caption2">
                    New tab
                  </span>
                )}
              </span>
              <span className="truncate text-text-tertiary typo-caption2">
                {pick.blurb[surface]}
              </span>
            </span>
            <span className="text-text-quaternary transition-colors group-hover/row:text-text-primary">
              <PlusIcon size={IconSize.Size16} />
            </span>
          </button>
        ))}
      </div>
      <PrimaryCta className="pt-2">Browse all widgets</PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 6. Try one                                                           */
/* ------------------------------------------------------------------ */

/**
 * The slot shows what it will become: one widget drawn faintly at full
 * size, with a card over it that names it and adds it. Like a template
 * preview, the tile is the before picture of the after. The extension's
 * ghost is the shortcuts grid.
 */
export const TryOneTile = ({ surface, edge }: TileProps): ReactElement => {
  const [pick] = picksFor(surface);
  const isSites = pick.id === 'shortcuts';

  return (
    <TileGroup edge={edge}>
      <div className="relative flex-1 overflow-hidden p-4">
        <div className="flex flex-col gap-3 opacity-40 transition-opacity duration-300 group-hover:opacity-64">
          <div className="flex items-center gap-1.5">
            <span className={toneClass[pick.tone].text}>
              {pick.icon(IconSize.Small)}
            </span>
            <span className="font-bold text-text-primary typo-callout">
              {pick.name}
            </span>
          </div>
          {isSites ? (
            <div className="grid grid-cols-3 gap-2">
              {sites[surface].map(({ domain, name }) => (
                <span key={domain} className="flex flex-col items-center gap-1">
                  <Favicon domain={domain} className="size-11 rounded-12" />
                  <span className="max-w-full truncate text-text-tertiary typo-caption2">
                    {name}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-bold tabular-nums text-text-primary typo-mega3">
                  12
                </span>
                <span className="text-text-tertiary typo-footnote">
                  day streak
                </span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 28 }, (_, day) => (
                  <span
                    // A month of days, in order.
                    // eslint-disable-next-line react/no-array-index-key
                    key={day}
                    className={classNames(
                      'aspect-square rounded-4',
                      day >= 14 && day < 26
                        ? toneClass.bacon.fill
                        : 'bg-surface-float',
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-default to-transparent" />
      </div>
      <div className="flex items-center gap-2 px-4 pb-3">
        <KindTile pick={pick} className="size-8 rounded-10" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold text-text-primary typo-footnote">
            {isSites ? 'Your shortcuts' : pick.name}
          </span>
          <span className="truncate text-text-tertiary typo-caption2">
            {isSites ? 'Could live right here' : 'What most readers add first'}
          </span>
        </span>
      </div>
      <PrimaryCta secondary="or choose another widget">
        Add {isSites ? 'your shortcuts' : pick.name}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 7. Beacon                                                            */
/* ------------------------------------------------------------------ */

/**
 * The one tile on the rail that glows: two soft orbs of our accent behind
 * frosted glass, a sparkle, and an invitation rather than an instruction.
 * The widgets show as a strip of chips along the bottom; in the extension
 * the strip is the reader's favicons and the line names the shortcuts.
 */
export const BeaconTile = ({ surface, edge }: TileProps): ReactElement => {
  const isExtension = surface === 'extension';

  return (
    <TileGroup edge={edge}>
      <span className="at-glow pointer-events-none absolute -left-12 -top-16 size-48 rounded-max bg-accent-cabbage-default opacity-64 blur-3xl transition-transform duration-700 group-hover:scale-125 motion-reduce:transition-none" />
      <span className="pointer-events-none absolute -bottom-20 -right-16 size-48 rounded-max bg-accent-onion-default opacity-40 blur-3xl transition-transform duration-700 group-hover:scale-125 motion-reduce:transition-none" />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-16 bg-background-default text-accent-cabbage-default shadow-3 transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
          <SparkleIcon secondary size={IconSize.XLarge} />
        </span>
        <span className="text-balance font-bold text-text-primary typo-title3">
          {isExtension ? 'Bring your shortcuts here' : 'Make this space yours'}
        </span>
        <span className="text-pretty text-text-secondary typo-footnote">
          {isExtension
            ? 'Your most visited sites, your streak, your bookmarks, whatever your new tab should open with.'
            : 'Your streak, your bookmarks, your shortcuts, a to-do list. Pick what your day starts with.'}
        </span>
      </div>
      <div className="relative flex justify-center pb-3">
        {isExtension ? (
          <FaviconStrip surface={surface} />
        ) : (
          <IconStrip surface={surface} />
        )}
      </div>
      <PrimaryCta className="relative">
        {isExtension ? 'Add your shortcuts' : 'Add a widget'}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 8. Patchy asks                                                       */
/* ------------------------------------------------------------------ */

/**
 * Patchy waits in the empty slot and asks what should go there; the
 * answers are pills that add a widget in one tap. The empty state gets a
 * character instead of a dashed box, and the pills keep it concrete. In
 * the extension the first pill is the reader's own sites.
 */
export const PatchyTile = ({ surface, edge }: TileProps): ReactElement => {
  const [first, ...others] = picksFor(surface).slice(0, 3);
  const isSites = first.id === 'shortcuts' && surface === 'extension';

  return (
    <TileGroup edge={edge}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pt-4">
        <img
          src={cloudinaryPatchyWaiting}
          alt=""
          className="at-bob h-24 object-contain"
        />
        <span className="relative rounded-14 bg-surface-float px-3 py-2 text-center text-text-primary typo-footnote">
          <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-surface-float" />
          {surface === 'extension'
            ? 'Your new tab. What goes here?'
            : 'What should go here?'}
        </span>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5 px-3 pb-3 pt-3">
        {others.map((pick) => (
          <button
            key={pick.id}
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-max border border-border-subtlest-tertiary bg-background-default px-2.5 font-bold text-text-primary typo-caption1 transition-colors hover:bg-surface-hover"
          >
            <span className={toneClass[pick.tone].text}>
              {pick.icon(IconSize.Size16)}
            </span>
            {pick.name}
          </button>
        ))}
        <button
          type="button"
          className="flex h-8 items-center gap-1 rounded-max border border-dashed border-border-subtlest-secondary px-2.5 text-text-secondary typo-caption1 transition-colors hover:border-border-subtlest-primary hover:text-text-primary"
        >
          <PlusIcon size={IconSize.Size16} />
          {WIDGET_COUNT - 3} more
        </button>
      </div>
      <PrimaryCta>
        {isSites ? 'Add your shortcuts' : `Add ${first.name}`}
      </PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 9. Split flap                                                        */
/* ------------------------------------------------------------------ */

/**
 * Type does the work: "Add" and a word that flips through the widgets'
 * names like a departures board, its icon flipping with it. The dashed
 * frame stays, so it still reads as an empty slot. In the extension the
 * board lingers on Shortcuts and says why.
 */
export const SplitFlapTile = ({ surface, edge }: TileProps): ReactElement => {
  const list = picksFor(surface);
  const [isHovered, setIsHovered] = useState(false);
  const index = useCycle(
    list.length,
    (current) =>
      surface === 'extension' && list[current].id === 'shortcuts' ? 4200 : 2100,
    isHovered,
  );
  const pick = list[index];
  const isSites = pick.id === 'shortcuts' && surface === 'extension';

  return (
    <TileGroup edge={edge} onHover={setIsHovered}>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <span key={pick.id} className="at-flap">
          <KindTile
            pick={pick}
            className="size-16 rounded-20 shadow-2"
            iconSize={IconSize.XLarge}
          />
        </span>
        <span className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-text-secondary typo-title3">Add</span>
          <span className="flex h-8 items-center overflow-hidden">
            <span
              key={pick.id}
              className={classNames(
                'at-flap font-bold typo-title2',
                toneClass[pick.tone].text,
              )}
            >
              {isSites ? 'your shortcuts' : pick.name}
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-col items-center gap-2 px-4 pb-3 text-center">
        <span className="line-clamp-2 text-text-tertiary typo-footnote">
          {isSites
            ? 'Your new tab’s sites live here now.'
            : `or any of ${WIDGET_COUNT} widgets`}
        </span>
        <Dots count={list.length} index={index} />
      </div>
      <PrimaryCta>Add {isSites ? 'your shortcuts' : pick.name}</PrimaryCta>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */
/* 10. Two doors                                                        */
/* ------------------------------------------------------------------ */

/**
 * The Tall slot split into its two Smalls, each a door: the gallery above,
 * the one widget we most want added below. In the extension the lower door
 * is the shortcuts row, favicons and all, so the reader sees the two things
 * this slot can do without opening anything.
 */
export const TwoDoorsTile = ({ surface, edge }: TileProps): ReactElement => {
  const isExtension = surface === 'extension';
  const [featured] = picksFor(surface);
  const door =
    'flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center';

  return (
    <TileGroup edge={edge}>
      <div className={door}>
        <IconStrip surface={surface} />
        <span className="flex flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-callout">
            Any widget
          </span>
          <span className="text-text-tertiary typo-footnote">
            {WIDGET_COUNT} to choose from
          </span>
        </span>
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Browse widgets
        </Button>
      </div>
      <span className="mx-4 border-t border-dashed border-border-subtlest-secondary" />
      <div
        className={classNames(
          door,
          'bg-gradient-to-t to-transparent',
          toneClass[featured.tone].wash,
        )}
      >
        {isExtension ? (
          <FaviconStrip surface={surface} />
        ) : (
          <KindTile
            pick={featured}
            className="size-10 rounded-12"
            iconSize={IconSize.Small}
          />
        )}
        <span className="flex flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-callout">
            {isExtension ? 'Your shortcuts' : `Start with ${featured.name}`}
          </span>
          <span className="text-text-tertiary typo-footnote">
            {isExtension
              ? 'GitHub, Gmail, Claude and the rest of your new tab'
              : 'What most readers add first'}
          </span>
        </span>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          className="w-full"
          icon={<PlusIcon />}
        >
          {isExtension ? 'Add your shortcuts' : `Add ${featured.name}`}
        </Button>
      </div>
    </TileGroup>
  );
};

/* ------------------------------------------------------------------ */

export type Variation = {
  id: string;
  name: string;
  note: string;
  Tile: (props: TileProps) => ReactElement;
};

export const variations: Variation[] = [
  {
    id: 'stage',
    name: '1. Rotating stage',
    note: 'One miniature at a time, swapped every three seconds with a soft blur and named underneath, so the tile shows what can go here instead of saying it. Hover holds the current one. The extension starts on Shortcuts and its line says where the new tab’s sites now live.',
    Tile: RotatingStageTile,
  },
  {
    id: 'hand',
    name: '2. Hand of cards',
    note: 'Three miniatures fanned like a hand, the one we suggest first on top. Hover spreads the hand. It says “there is a set to pick from” before a word is read. The extension’s top card is Shortcuts, the line says “Start with your shortcuts”.',
    Tile: HandOfCardsTile,
  },
  {
    id: 'orbit',
    name: '3. Orbit',
    note: 'The widgets’ icons on a slow ring around a plus, each in its own tint, like a launcher showing what it holds. One turn a minute, paused under the pointer. In the extension the Shortcuts chip is a cluster of the reader’s favicons at twice the size.',
    Tile: OrbitTile,
  },
  {
    id: 'sites',
    name: '4. Your sites, here',
    note: 'A faint grid of what the slot would hold with a panel that names it and a primary button. In the extension the grid is the reader’s most visited sites, so the tile is the shortcuts row’s new home and “any other widget” is the second line. On the webapp the grid is the widgets’ icons.',
    Tile: YourSitesTile,
  },
  {
    id: 'picks',
    name: '5. Quick picks',
    note: 'The tile is the gallery’s first page: four rows add that widget in one tap, the last row opens the rest. One step fewer than today and the names are right there. The extension’s first row is Shortcuts, tagged “New tab”.',
    Tile: QuickPicksTile,
  },
  {
    id: 'try',
    name: '6. Try one',
    note: 'The slot shows what it will become: one widget drawn faintly at full size, with a card over it that names it and adds it. The before picture of the after. The extension’s ghost is the shortcuts grid with the reader’s sites.',
    Tile: TryOneTile,
  },
  {
    id: 'beacon',
    name: '7. Beacon',
    note: 'The one tile on the rail that glows: two soft orbs of our accent behind the surface, a sparkle, and an invitation (“Make this space yours”) over an instruction. The chips along the bottom are the widgets; in the extension they are the reader’s favicons and the title says “Bring your shortcuts here”.',
    Tile: BeaconTile,
  },
  {
    id: 'patchy',
    name: '8. Patchy asks',
    note: 'Patchy waits in the empty slot and asks what should go there; the pills answer, each adding a widget in one tap, the first one highlighted. A character instead of a dashed box, kept concrete by the pills. In the extension the first pill is “Your shortcuts” with three of the reader’s favicons in it.',
    Tile: PatchyTile,
  },
  {
    id: 'flap',
    name: '9. Split flap',
    note: 'Type does the work: “Add” and a word that flips through the widgets’ names like a departures board, its icon flipping with it, inside the dashed frame so it still reads as an empty slot. In the extension the board lingers twice as long on “your shortcuts” and says why.',
    Tile: SplitFlapTile,
  },
  {
    id: 'doors',
    name: '10. Two doors',
    note: 'The Tall slot split into its two Smalls, each a door: the gallery above, the one widget we most want added below, on a wash of its color. In the extension the lower door is the shortcuts row, favicons and all, so both things the slot can do are visible without opening anything.',
    Tile: TwoDoorsTile,
  },
];

/* ------------------------------------------------------------------ */
/* Round two: today's center, the cards around it                       */
/* ------------------------------------------------------------------ */

/*
 * Tsahi's read of round one: the simplest tile (today's dashed slot with a
 * plus in the middle) is the right bones, it just shows nothing. So this
 * round keeps the plus, the label and the primary button in the center and
 * lays the miniatures from the hand of cards around it as the background:
 * fanned, spread to the corners, on a ring, stacked, or peeking in from
 * the edges.
 */

/** Today's center, with the one button under it. */
const CenterAction = ({ surface }: { surface: Surface }): ReactElement => {
  const isExtension = surface === 'extension';
  const [first, second, third] = picksFor(surface);

  return (
    <div className="relative z-1 flex w-full flex-col items-center gap-3 px-4 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(closest-side, var(--theme-background-default) 45%, transparent 100%)',
        }}
      />
      <span className="relative flex size-14 items-center justify-center rounded-max bg-surface-float text-text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
        <PlusIcon size={IconSize.Large} />
      </span>
      <span className="relative flex flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          Add a widget
        </span>
        <span className="text-text-tertiary typo-footnote">
          {isExtension
            ? `Your shortcuts, ${second.name}, ${third.name} and ${
                WIDGET_COUNT - 3
              } more`
            : `${first.name}, ${second.name}, ${third.name} and ${
                WIDGET_COUNT - 3
              } more`}
        </span>
      </span>
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className="relative w-full"
      >
        {isExtension ? 'Add your shortcuts' : 'Add a widget'}
      </Button>
      {isExtension && (
        <button
          type="button"
          className="relative text-text-tertiary typo-caption1 transition-colors hover:text-text-primary"
        >
          or any other widget
        </button>
      )}
    </div>
  );
};

/**
 * The cards behind the center, dimmed as one layer so overlaps stay opaque,
 * and brought up while the tile is hovered.
 */
const BackLayer = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <div
    aria-hidden
    className={classNames(
      'pointer-events-none absolute inset-0 opacity-64 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none',
      className,
    )}
  >
    {children}
  </div>
);

const BackCard = ({
  pick,
  surface,
  className,
}: {
  pick: Pick;
  surface: Surface;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'absolute w-36 transition-transform duration-500 ease-out motion-reduce:transition-none',
      className,
    )}
  >
    <Mini pick={pick} surface={surface} />
  </div>
);

/** 11. The hand of cards fanned behind the center. */
export const FanBehindTile = ({ surface, edge }: TileProps): ReactElement => {
  const [front, left, right] = picksFor(surface);

  return (
    <TileGroup edge={edge}>
      <div className="relative flex flex-1 flex-col justify-end pb-6">
        <BackLayer>
          <BackCard
            pick={left}
            surface={surface}
            className="left-1/2 top-[30%] -translate-x-[92%] -translate-y-[40%] -rotate-12 group-hover:-translate-x-[104%] group-hover:-rotate-[16deg]"
          />
          <BackCard
            pick={right}
            surface={surface}
            className="left-1/2 top-[30%] -translate-x-[8%] -translate-y-[40%] rotate-12 group-hover:translate-x-[4%] group-hover:rotate-[16deg]"
          />
          <BackCard
            pick={front}
            surface={surface}
            className="left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 group-hover:-translate-y-[58%]"
          />
        </BackLayer>
        <CenterAction surface={surface} />
      </div>
    </TileGroup>
  );
};

/** 12. Cards spread to the four corners, half past the frame. */
export const SpreadTile = ({ surface, edge }: TileProps): ReactElement => {
  const [a, b, c, d] = picksFor(surface);

  return (
    <TileGroup edge={edge}>
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <BackLayer>
          <BackCard
            pick={a}
            surface={surface}
            className="-left-10 top-4 w-32 -rotate-6 group-hover:-translate-x-1 group-hover:-translate-y-1"
          />
          <BackCard
            pick={b}
            surface={surface}
            className="-right-12 top-14 w-32 rotate-6 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
          <BackCard
            pick={c}
            surface={surface}
            className="-left-12 bottom-12 w-32 rotate-6 group-hover:-translate-x-1 group-hover:translate-y-1"
          />
          <BackCard
            pick={d}
            surface={surface}
            className="-bottom-2 -right-10 w-32 -rotate-6 group-hover:translate-x-1 group-hover:translate-y-1"
          />
        </BackLayer>
        <CenterAction surface={surface} />
      </div>
    </TileGroup>
  );
};

/** 13. The orbit, with cards on the ring instead of icons. */
export const CardOrbitTile = ({ surface, edge }: TileProps): ReactElement => {
  const list = picksFor(surface).slice(0, 4);
  const radius = 7;

  return (
    <TileGroup edge={edge}>
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <BackLayer className="at-orbit">
          {list.map((pick, index) => {
            const angle = (index / list.length) * Math.PI * 2 - Math.PI / 2;
            return (
              <span
                key={pick.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}rem)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}rem)`,
                }}
              >
                <span className="at-orbit-item block w-28 scale-75">
                  <Mini pick={pick} surface={surface} />
                </span>
              </span>
            );
          })}
        </BackLayer>
        <CenterAction surface={surface} />
      </div>
    </TileGroup>
  );
};

/** 14. A straight deck stacked behind the center. */
export const DeckBehindTile = ({ surface, edge }: TileProps): ReactElement => {
  const [front, second, third] = picksFor(surface);

  return (
    <TileGroup edge={edge}>
      <div className="relative flex flex-1 flex-col justify-end pb-6">
        <BackLayer>
          <BackCard
            pick={third}
            surface={surface}
            className="left-1/2 top-[31%] w-32 -translate-x-1/2 -translate-y-[calc(50%+2.75rem)] group-hover:-translate-y-[calc(50%+3.5rem)]"
          />
          <BackCard
            pick={second}
            surface={surface}
            className="left-1/2 top-[31%] w-[8.75rem] -translate-x-1/2 -translate-y-[calc(50%+1.375rem)] group-hover:-translate-y-[calc(50%+1.75rem)]"
          />
          <BackCard
            pick={front}
            surface={surface}
            className="left-1/2 top-[31%] w-40 -translate-x-1/2 -translate-y-1/2"
          />
        </BackLayer>
        <CenterAction surface={surface} />
      </div>
    </TileGroup>
  );
};

/** 15. Cards peeking in from the edges, cropped by the frame. */
export const PeekTile = ({ surface, edge }: TileProps): ReactElement => {
  const [a, b, c, d] = picksFor(surface);

  return (
    <TileGroup edge={edge}>
      <div className="relative flex flex-1 flex-col items-center justify-center">
        <BackLayer>
          <BackCard
            pick={a}
            surface={surface}
            className="-top-3 left-1/2 -translate-x-1/2 rotate-3 group-hover:translate-y-1"
          />
          <BackCard
            pick={b}
            surface={surface}
            className="-left-16 top-1/2 -translate-y-[60%] rotate-6 group-hover:translate-x-1"
          />
          <BackCard
            pick={c}
            surface={surface}
            className="-right-16 top-1/2 -translate-y-[40%] -rotate-6 group-hover:-translate-x-1"
          />
          <BackCard
            pick={d}
            surface={surface}
            className="-bottom-6 left-1/2 -translate-x-1/2 -rotate-3 group-hover:-translate-y-1"
          />
        </BackLayer>
        <CenterAction surface={surface} />
      </div>
    </TileGroup>
  );
};

export const roundTwo: Variation[] = [
  {
    id: 'fan-behind',
    name: '11. Fan behind',
    note: 'Today’s center (plus, “Add a widget”, the button) with the hand of cards fanned above it, the suggested widget on top. Hover spreads the fan and lifts the plus. The closest to 2 with today’s bones.',
    Tile: FanBehindTile,
  },
  {
    id: 'spread',
    name: '12. Spread to the corners',
    note: 'The center stays clean and four cards sit in the corners, each half past the frame, so they read as what is lying around waiting to be picked up. Hover nudges them outward.',
    Tile: SpreadTile,
  },
  {
    id: 'card-orbit',
    name: '13. Orbit of cards',
    note: 'The orbit from 3 with the cards from 2: four miniatures on a ring around the center, turning once a minute, paused under the pointer. The center block sits on a soft fade so the words stay readable as cards pass behind.',
    Tile: CardOrbitTile,
  },
  {
    id: 'deck',
    name: '14. Deck behind',
    note: 'A straight pile: the suggested widget in front, two behind it stepping back and shrinking, the center under the pile. The quietest of the five; hover lifts the back cards.',
    Tile: DeckBehindTile,
  },
  {
    id: 'peek',
    name: '15. Peeking in',
    note: 'Four cards tucked into the frame’s four sides, cropped by it, as if more were just outside the slot. Hover slides each a little further in.',
    Tile: PeekTile,
  },
];

/* ------------------------------------------------------------------ */
/* Round three: the square is the button, the cards sit below           */
/* ------------------------------------------------------------------ */

/*
 * Round two read as two buttons: the plus and the white bar under it. Here
 * the plus is the one control, drawn as a rounded square in a primary
 * style, the whole slot clicks through to it, and the names under it say
 * what is behind it. The widgets lie below the words, the way round two's
 * fan did above them, in five different stacks.
 */

/** How the square is painted: today's quiet float, our primary, or brand. */
export type SquareLook = 'float' | 'primary' | 'brand';

const squareClassName: Record<SquareLook, string> = {
  float:
    'bg-surface-float text-text-primary group-hover:bg-text-primary group-hover:text-surface-invert',
  primary: 'bg-text-primary text-surface-invert',
  brand: 'bg-accent-cabbage-default text-white',
};

export type RoundThreeProps = TileProps & {
  square: SquareLook;
  /** The finalists' layout: the square near the middle, the cards close under it. */
  isCentered?: boolean;
};

/** No hover fill: the cards fade into the slot, and a fill would band. */
const slotClassName =
  'add-tile group relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-16 border-2 border-border-subtlest-secondary text-left transition-colors duration-200 hover:border-border-subtlest-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default motion-reduce:transition-none';

/** The whole slot is the one button; the square is where the eye lands. */
const AddSlot = ({
  edge,
  surface,
  onHover,
  children,
}: {
  edge: Edge;
  surface: Surface;
  onHover?: (isHovered: boolean) => void;
  children: ReactNode;
}): ReactElement => (
  <button
    type="button"
    aria-label={
      surface === 'extension'
        ? 'Add a widget, like your shortcuts'
        : 'Add a widget'
    }
    onMouseEnter={() => onHover?.(true)}
    onMouseLeave={() => onHover?.(false)}
    onFocus={() => onHover?.(true)}
    onBlur={() => onHover?.(false)}
    className={classNames(slotClassName, edgeClassName[edge])}
  >
    {children}
  </button>
);

const AddHead = ({
  surface,
  square,
  isCentered,
}: {
  surface: Surface;
  square: SquareLook;
  isCentered?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'relative z-1 flex flex-col items-center gap-3 px-4 text-center',
      isCentered ? 'pt-28' : 'pt-10',
    )}
  >
    <span
      className={classNames(
        'flex size-14 items-center justify-center rounded-16 shadow-2 transition-[transform,background-color,color] duration-200 group-hover:scale-105 group-active:scale-95 motion-reduce:transition-none',
        squareClassName[square],
      )}
    >
      <PlusIcon size={IconSize.Large} />
    </span>
    <span className="flex flex-col gap-0.5">
      <span className="font-bold text-text-primary typo-callout">
        Add a widget
      </span>
      <span className="text-text-tertiary typo-footnote">
        {surface === 'extension'
          ? 'Shortcuts, Happening Now, To-do list, Streak and more'
          : 'Happening Now, To-do list, Shortcuts, Streak and more'}
      </span>
    </span>
  </span>
);

/** Where the cards lie: under the words, fading into the slot's floor. */
const CardFloor = ({
  isCentered,
  className,
  children,
}: {
  isCentered?: boolean;
  className?: string;
  children: ReactNode;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'relative block flex-1',
      isCentered ? 'mt-3' : 'mt-6',
      className,
    )}
  >
    {children}
    <span className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-14 bg-gradient-to-t from-background-default to-transparent" />
  </span>
);

/** 16. Round two's fan, laid under the words. */
export const FanBelowTile = ({
  surface,
  edge,
  square,
  isCentered,
}: RoundThreeProps): ReactElement => {
  const [front, left, right] = picksFor(surface);
  const card =
    'absolute w-40 transition-transform duration-500 ease-out motion-reduce:transition-none';

  return (
    <AddSlot edge={edge} surface={surface}>
      <AddHead surface={surface} square={square} isCentered={isCentered} />
      <CardFloor isCentered={isCentered}>
        <span
          className={classNames(
            card,
            'left-1/2 -translate-x-[92%] -rotate-12 group-hover:-translate-x-[104%] group-hover:-rotate-[16deg]',
            isCentered ? 'top-8' : 'top-14',
          )}
        >
          <Mini pick={left} surface={surface} />
        </span>
        <span
          className={classNames(
            card,
            'left-1/2 -translate-x-[8%] rotate-12 group-hover:translate-x-[4%] group-hover:rotate-[16deg]',
            isCentered ? 'top-8' : 'top-14',
          )}
        >
          <Mini pick={right} surface={surface} />
        </span>
        <span
          className={classNames(
            card,
            'left-1/2 -translate-x-1/2 group-hover:-translate-y-2',
            isCentered ? 'top-2' : 'top-8',
          )}
        >
          <Mini pick={front} surface={surface} />
        </span>
      </CardFloor>
    </AddSlot>
  );
};

/**
 * 17. The iOS Smart Stack: one widget in front, the next two as card
 * edges under it, flipping every few seconds, dots on the side.
 */
export const SmartStackTile = ({
  surface,
  edge,
  square,
}: RoundThreeProps): ReactElement => {
  const list = picksFor(surface).slice(0, 4);
  const [isHovered, setIsHovered] = useState(false);
  const index = useCycle(list.length, () => 3200, isHovered);
  const pick = list[index];
  const edgeCard =
    'absolute inset-0 rounded-12 border border-border-subtlest-tertiary bg-background-default';

  return (
    <AddSlot edge={edge} surface={surface} onHover={setIsHovered}>
      <AddHead surface={surface} square={square} />
      <CardFloor className="flex justify-center">
        <span className="relative -mt-4 block w-48 self-center">
          <span
            className={classNames(edgeCard, 'opacity-40')}
            style={{
              transform: 'translateY(1.25rem) scale(0.84)',
              transformOrigin: 'bottom center',
            }}
          />
          <span
            className={classNames(edgeCard, 'opacity-64 shadow-2')}
            style={{
              transform: 'translateY(0.625rem) scale(0.92)',
              transformOrigin: 'bottom center',
            }}
          />
          <span key={pick.id} className="at-enter relative block">
            <Mini pick={pick} surface={surface} />
          </span>
          <span className="absolute -right-4 top-1/2 flex -translate-y-1/2 flex-col gap-1">
            {list.map((item, dot) => (
              <span
                key={item.id}
                className={classNames(
                  'w-1 rounded-max transition-all duration-300',
                  dot === index
                    ? 'h-3 bg-text-primary'
                    : 'h-1 bg-border-subtlest-primary',
                )}
              />
            ))}
          </span>
        </span>
      </CardFloor>
    </AddSlot>
  );
};

/**
 * 18. Apple Wallet: the widgets filed one behind the other, each showing
 * its tinted header, the front one open at the bottom.
 */
export const WalletTile = ({
  surface,
  edge,
  square,
  isCentered,
}: RoundThreeProps): ReactElement => {
  // Filed back to front, so the lead widget is the open card.
  const list = picksFor(surface).slice(0, 4).reverse();
  const spread = [
    'group-hover:-translate-y-3',
    'group-hover:-translate-y-2',
    'group-hover:-translate-y-1',
    '',
  ].slice(-list.length);
  const step = isCentered ? 2 : 2.5;

  return (
    <AddSlot edge={edge} surface={surface}>
      <AddHead surface={surface} square={square} isCentered={isCentered} />
      <CardFloor isCentered={isCentered}>
        {list.map((pick, index) => (
          <span
            key={pick.id}
            className={classNames(
              'absolute inset-x-6 block transition-transform duration-500 ease-out motion-reduce:transition-none',
              spread[index],
            )}
            style={{ top: `${0.5 + index * step}rem` }}
          >
            <Mini
              pick={pick}
              surface={surface}
              isTinted
              className="rounded-14"
            />
          </span>
        ))}
      </CardFloor>
    </AddSlot>
  );
};

/**
 * 19. A cascade: three cards stepped down and to the right like windows,
 * each title still readable, the front one whole.
 */
export const CascadeTile = ({
  surface,
  edge,
  square,
}: RoundThreeProps): ReactElement => {
  const [front, second, third] = picksFor(surface);
  const steps = [
    {
      pick: third,
      at: '0',
      hover: 'group-hover:-translate-x-2 group-hover:-translate-y-2',
    },
    {
      pick: second,
      at: '1.75rem',
      hover: 'group-hover:-translate-x-1 group-hover:-translate-y-1',
    },
    { pick: front, at: '3.5rem', hover: '' },
  ];

  return (
    <AddSlot edge={edge} surface={surface}>
      <AddHead surface={surface} square={square} />
      <CardFloor className="flex justify-center">
        <span className="relative mt-6 block h-full w-[13.5rem]">
          {steps.map(({ pick, at, hover }) => (
            <span
              key={pick.id}
              className={classNames(
                'absolute w-40 transition-transform duration-500 ease-out motion-reduce:transition-none',
                hover,
              )}
              style={{ left: at, top: at }}
            >
              <Mini pick={pick} surface={surface} isTinted />
            </span>
          ))}
        </span>
      </CardFloor>
    </AddSlot>
  );
};

/** A widget as a playing card: its icon (or your sites) and its name. */
const CardFace = ({
  pick,
  surface,
}: {
  pick: Pick;
  surface: Surface;
}): ReactElement => {
  const isSites = pick.id === 'shortcuts' && surface === 'extension';
  return (
    <span
      className={classNames(
        'flex h-32 w-24 flex-col rounded-14 border border-border-subtlest-tertiary bg-background-default bg-gradient-to-b to-transparent p-2 shadow-2',
        toneClass[pick.tone].wash,
      )}
    >
      <span className={classNames('flex', toneClass[pick.tone].text)}>
        {isSites ? (
          <Favicon
            domain={sites.extension[0].domain}
            className="size-5 rounded-4"
          />
        ) : (
          pick.icon(IconSize.Size16)
        )}
      </span>
      <span className="flex flex-1 items-center justify-center">
        {isSites ? (
          <span className="grid size-10 grid-cols-2 gap-0.5">
            {sites.extension.slice(0, 4).map(({ domain }) => (
              <Favicon
                key={domain}
                domain={domain}
                className="size-full rounded-6"
              />
            ))}
          </span>
        ) : (
          <KindTile
            pick={pick}
            className="size-10 rounded-12"
            iconSize={IconSize.Small}
          />
        )}
      </span>
      <span className="w-full truncate text-center font-bold text-text-primary typo-caption2">
        {isSites ? 'Your sites' : pick.name}
      </span>
    </span>
  );
};

/**
 * 20. A hand held up from the slot's floor: five cards on an arc, each a
 * widget's face. Hover opens the hand.
 */
export const ArcTile = ({
  surface,
  edge,
  square,
}: RoundThreeProps): ReactElement => {
  const list = picksFor(surface).slice(0, 5);
  const [isHovered, setIsHovered] = useState(false);
  const step = isHovered ? 13 : 10;

  return (
    <AddSlot edge={edge} surface={surface} onHover={setIsHovered}>
      <AddHead surface={surface} square={square} />
      <CardFloor>
        {list.map((pick, index) => (
          <span
            key={pick.id}
            className="absolute left-1/2 top-16 block transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{
              transform: `translateX(-50%) rotate(${(index - 2) * step}deg)`,
              transformOrigin: '50% 220%',
            }}
          >
            <CardFace pick={pick} surface={surface} />
          </span>
        ))}
      </CardFloor>
    </AddSlot>
  );
};

export type RoundThreeVariation = {
  id: string;
  name: string;
  note: string;
  Tile: (props: RoundThreeProps) => ReactElement;
};

export const roundThree: RoundThreeVariation[] = [
  {
    id: 'fan-below',
    name: '16. Fan below',
    note: 'Round two’s fan (11), laid under the words instead of over them, fading into the slot’s floor. Hover spreads the hand and lifts the front card.',
    Tile: FanBelowTile,
  },
  {
    id: 'smart-stack',
    name: '17. Smart Stack',
    note: 'The iOS Smart Stack: one widget in front, the next two as card edges under it, flipping every three seconds with the dots on its side. Hover holds the one in front.',
    Tile: SmartStackTile,
  },
  {
    id: 'wallet',
    name: '18. Wallet',
    note: 'Apple Wallet: the widgets filed one behind the other, each showing its tinted header so every name reads, the front one open at the bottom. Hover fans the files apart a little.',
    Tile: WalletTile,
  },
  {
    id: 'cascade',
    name: '19. Cascade',
    note: 'Three cards stepped down and to the right like windows on a desktop, each title in its tint still readable, the front one whole. Hover pulls the back cards further out.',
    Tile: CascadeTile,
  },
  {
    id: 'arc',
    name: '20. Hand of five',
    note: 'A hand held up from the slot’s floor: five cards on an arc, each a widget’s face with its icon in the corner like a playing card’s index, so every card names itself even when covered (in the extension, your sites). Hover opens the hand wider.',
    Tile: ArcTile,
  },
];

export const finalists: RoundThreeVariation[] = [
  {
    id: 'final-fan',
    name: '16. Fan below',
    note: 'The square and its words sit near the middle of the slot, the fan of three close under them and running off the floor. Hover spreads the fan and lifts the front card.',
    Tile: (props) => <FanBelowTile {...props} isCentered />,
  },
  {
    id: 'final-wallet',
    name: '18. Wallet',
    note: 'The square and its words near the middle, four widgets filed close under them, each tinted header readable, the front one open and running off the floor. Hover fans the files apart a little.',
    Tile: (props) => <WalletTile {...props} isCentered />,
  },
];
