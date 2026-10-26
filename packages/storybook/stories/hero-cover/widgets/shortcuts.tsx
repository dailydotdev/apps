import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/ShortcutTile';
import { AddShortcutTile } from '@dailydotdev/shared/src/features/shortcuts/components/AddShortcutTile';
import type {
  Shortcut,
  ShortcutsAppearance,
} from '@dailydotdev/shared/src/features/shortcuts/types';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { WidgetSize } from './catalog';
import { Stack, WidgetLabel } from './production';
import { Scroll } from './scroll';

/*
 * Shortcuts, moved from the row above the feed into a widget. The tiles are
 * production's ShortcutTile and AddShortcutTile; the two sources are the
 * ones the shortcuts hub already has: the reader's own list (synced in
 * settings) and the browser's most visited sites (extension only, behind
 * the topSites permission).
 */

const site = (url: string, name: string): Shortcut => ({
  url,
  name,
  iconUrl: `https://www.google.com/s2/favicons?domain=${
    new URL(url).hostname
  }&sz=64`,
});

export const myShortcuts: Shortcut[] = [
  site('https://github.com', 'GitHub'),
  site('https://linear.app', 'Linear'),
  site('https://vercel.com', 'Vercel'),
  site('https://figma.com', 'Figma'),
  site('https://claude.ai', 'Claude'),
  site('https://mail.google.com', 'Gmail'),
  site('https://stackoverflow.com', 'Stack Overflow'),
  site('https://developer.mozilla.org', 'MDN'),
  site('https://news.ycombinator.com', 'Hacker News'),
  site('https://notion.so', 'Notion'),
  site('https://slack.com', 'Slack'),
  site('https://chatgpt.com', 'ChatGPT'),
];

export const mostVisited: Shortcut[] = [
  site('https://github.com', 'GitHub'),
  site('https://localhost.run', 'localhost'),
  site('https://stackoverflow.com', 'Stack Overflow'),
  site('https://www.youtube.com', 'YouTube'),
  site('https://claude.ai', 'Claude'),
  site('https://docs.google.com', 'Docs'),
  site('https://reddit.com', 'Reddit'),
  site('https://x.com', 'X'),
  site('https://npmjs.com', 'npm'),
  site('https://aws.amazon.com', 'AWS'),
  site('https://jira.atlassian.com', 'Jira'),
  site('https://medium.com', 'Medium'),
];

const capacity: Record<WidgetSize, number> = { s: 8, m: 12, l: 12, w: 8 };
const columns: Record<WidgetSize, string> = {
  s: 'grid-cols-4',
  m: 'grid-cols-3',
  l: 'grid-cols-4',
  w: 'grid-cols-4',
};

type Source = 'mine' | 'visited';

/** The two sources as the header's title: the one you are on reads bold. */
const SourceTabs = ({
  source,
  onChange,
}: {
  source: Source;
  onChange: (source: Source) => void;
}): ReactElement => (
  <span role="tablist" className="flex items-center gap-3">
    {(
      [
        ['mine', 'Shortcuts'],
        ['visited', 'Most visited'],
      ] as [Source, string][]
    ).map(([value, label]) => (
      <button
        key={value}
        type="button"
        role="tab"
        aria-selected={value === source}
        onClick={() => onChange(value)}
        className={classNames(
          'typo-caption1 transition-colors',
          value === source
            ? 'font-bold text-text-primary'
            : 'font-normal text-text-tertiary hover:text-text-secondary',
        )}
      >
        {label}
      </button>
    ))}
  </span>
);

const domain = (url: string): string =>
  new URL(url).hostname.replace(/^www\./, '');

/** List mode: a row per site, name first, the domain under it. */
const List = ({
  shortcuts,
  size,
  canAdd,
  isUnderHeader = true,
}: {
  shortcuts: Shortcut[];
  size: WidgetSize;
  canAdd: boolean;
  /** False when the list sits under its own section label, not the header. */
  isUnderHeader?: boolean;
}): ReactElement => {
  // Large holds all 12 (MAX_SHORTCUTS) as two columns of six that share the
  // height, reading down then across; the others scroll.
  const isLarge = size === 'l';
  const iconBox = isLarge ? 'size-10 rounded-12' : 'size-8 rounded-10';
  const rowClassName = classNames(
    '-mx-2 flex items-center gap-3 rounded-12 px-2 transition-colors hover:bg-surface-hover',
    isLarge ? 'h-full' : 'py-1.5',
  );
  const items = (
    <>
      {shortcuts.map((shortcut) => (
        <li key={shortcut.url} className="min-h-0">
          <a
            href={shortcut.url}
            onClick={(event) => event.preventDefault()}
            className={rowClassName}
          >
            <span
              className={classNames(
                'flex shrink-0 items-center justify-center bg-surface-float',
                iconBox,
              )}
            >
              <img
                src={shortcut.iconUrl}
                alt=""
                className={isLarge ? 'size-5' : 'size-4'}
              />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={classNames(
                  'truncate font-bold text-text-primary',
                  isLarge ? 'typo-callout' : 'typo-footnote',
                )}
              >
                {shortcut.name}
              </span>
              <span className="truncate text-text-tertiary typo-caption1">
                {domain(shortcut.url)}
              </span>
            </span>
          </a>
        </li>
      ))}
      {canAdd && (
        <li className="min-h-0">
          <button
            type="button"
            className={classNames(
              rowClassName,
              'w-[calc(100%+1rem)] text-text-tertiary hover:text-text-primary',
            )}
          >
            <span
              className={classNames(
                'flex shrink-0 items-center justify-center border border-dashed border-border-subtlest-secondary',
                iconBox,
              )}
            >
              +
            </span>
            <span className="font-bold typo-footnote">Add shortcut</span>
          </button>
        </li>
      )}
    </>
  );
  if (isLarge) {
    return (
      <ul className="mt-2 grid min-h-0 flex-1 grid-flow-col grid-rows-6 gap-x-6">
        {items}
      </ul>
    );
  }
  return (
    <Scroll isUnderHeader={isUnderHeader}>
      <ul className="flex flex-col gap-0.5">{items}</ul>
    </Scroll>
  );
};

// Large is two columns wide, so its 4 by 3 grid takes launcher-size tiles
// (a 72px icon, footnote labels) and fills the widget instead of floating.
const largeTileClassName =
  '[&_.size-11]:!mb-2 [&_.size-11]:!size-[4.5rem] [&_.size-11]:!rounded-16 [&_.size-11_.size-6]:!size-9 [&_.size-11_.size-10]:!size-12 [&_.typo-caption2]:!text-[0.8125rem] [&_.typo-caption2]:!leading-[1.125rem]';

const Grid = ({
  shortcuts,
  size,
  appearance,
  canAdd,
}: {
  shortcuts: Shortcut[];
  size: WidgetSize;
  appearance: ShortcutsAppearance;
  canAdd: boolean;
}): ReactElement => {
  const shown = shortcuts.slice(0, capacity[size] - (canAdd ? 1 : 0));
  return (
    <div
      // Production's tile is a fixed 4.75rem, left in its cell, which left
      // the slack on the right. Each tile fills its cell and centers there,
      // so both sides of the grid get the same space at every size.
      className={classNames(
        'grid content-start justify-items-center gap-x-1 [&>*]:!w-full',
        size === 's' && 'mt-1.5 gap-y-0',
        size === 'm' && 'mt-3 gap-y-2',
        size === 'l' && 'mt-4 gap-y-4',
        size === 'l' && appearance === 'tile' && largeTileClassName,
        appearance === 'chip'
          ? 'grid-cols-2 gap-y-1.5 [&>*]:!max-w-none'
          : columns[size],
      )}
    >
      {shown.map((shortcut) => (
        <ShortcutTile
          key={shortcut.url}
          shortcut={shortcut}
          appearance={appearance}
          draggable={false}
        />
      ))}
      {canAdd && (
        <div className="flex justify-center [&>*]:!w-full">
          <AddShortcutTile onClick={() => undefined} appearance={appearance} />
        </div>
      )}
    </div>
  );
};

type Layout = 'grid' | 'list';

/** Shows the layout you would switch to, like the feed's own toggle. */
const LayoutToggle = ({
  layout,
  onChange,
}: {
  layout: Layout;
  onChange: (layout: Layout) => void;
}): ReactElement => (
  <button
    type="button"
    aria-label={layout === 'grid' ? 'Show as list' : 'Show as grid'}
    title={layout === 'grid' ? 'Show as list' : 'Show as grid'}
    onClick={() => onChange(layout === 'grid' ? 'list' : 'grid')}
    className="flex size-6 shrink-0 items-center justify-center rounded-8 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
  >
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden
    >
      {layout === 'grid' ? (
        <path d="M2.75 4h.01M6 4h7.25M2.75 8h.01M6 8h7.25M2.75 12h.01M6 12h7.25" />
      ) : (
        <>
          <rect x="2.25" y="2.25" width="4.5" height="4.5" rx="1.25" />
          <rect x="9.25" y="2.25" width="4.5" height="4.5" rx="1.25" />
          <rect x="2.25" y="9.25" width="4.5" height="4.5" rx="1.25" />
          <rect x="9.25" y="9.25" width="4.5" height="4.5" rx="1.25" />
        </>
      )}
    </svg>
  </button>
);

export const ShortcutsWidget = ({
  size,
  initialSource = 'mine',
  appearance = 'tile',
  isExtension = true,
  shortcuts = myShortcuts,
  layout: initialLayout = 'grid',
}: {
  size: WidgetSize;
  /** Grid of tiles, or a list of rows with the domain under each name. */
  layout?: Layout;
  initialSource?: Source;
  appearance?: ShortcutsAppearance;
  /** Most visited needs the browser's topSites, so only the extension has it. */
  isExtension?: boolean;
  shortcuts?: Shortcut[];
}): ReactElement => {
  const [source, setSource] = useState<Source>(initialSource);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const list = source === 'mine' ? shortcuts : mostVisited;
  const canAdd = source === 'mine' && list.length < 12;

  const toggle = <LayoutToggle layout={layout} onChange={setLayout} />;

  // Large has room for both sources, so the extension shows them side by
  // side under their own labels and needs no tabs. Without most visited
  // (the webapp), Large keeps the single list sized to fill.
  if (size === 'l' && isExtension) {
    const column = (title: string, sites: Shortcut[], canAddHere: boolean) => (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <span className="font-bold text-text-tertiary typo-caption1">
          {title}
        </span>
        {layout === 'list' ? (
          <List
            shortcuts={sites}
            size="m"
            canAdd={canAddHere}
            isUnderHeader={false}
          />
        ) : (
          <Grid
            shortcuts={sites}
            size="m"
            appearance={appearance}
            canAdd={canAddHere}
          />
        )}
      </div>
    );
    return (
      <Stack>
        <WidgetLabel kind="shortcuts" trailing={toggle} />
        <div className="mt-3 flex min-h-0 flex-1 gap-6">
          {column('Pinned', shortcuts, shortcuts.length < 12)}
          <span
            aria-hidden
            className="w-px shrink-0 bg-border-subtlest-tertiary"
          />
          {column('Most visited', mostVisited, false)}
        </div>
      </Stack>
    );
  }

  return (
    <Stack>
      <WidgetLabel kind="shortcuts" trailing={toggle}>
        {isExtension ? (
          <SourceTabs source={source} onChange={setSource} />
        ) : (
          'Shortcuts'
        )}
      </WidgetLabel>
      {layout === 'list' ? (
        <List shortcuts={list} size={size} canAdd={canAdd} />
      ) : (
        <Grid
          shortcuts={list}
          size={size}
          appearance={appearance}
          canAdd={canAdd}
        />
      )}
    </Stack>
  );
};

/** Most visited before the browser has said yes. */
export const ShortcutsPermission = ({
  size,
}: {
  size: WidgetSize;
}): ReactElement => (
  <Stack>
    <WidgetLabel kind="shortcuts">Most visited</WidgetLabel>
    <div className="mt-3 flex gap-1.5">
      {mostVisited.slice(0, size === 's' ? 5 : 6).map((s) => (
        <span
          key={s.url}
          className="flex size-9 items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary"
        >
          <img src={s.iconUrl} alt="" className="size-4 opacity-40 grayscale" />
        </span>
      ))}
    </div>
    <span className="mt-3 font-bold text-text-primary typo-callout">
      Your most visited sites, one click away.
    </span>
    {size !== 's' && (
      <span className="mt-1 text-text-tertiary typo-footnote">
        Your browser asks once. The list never leaves this device.
      </span>
    )}
    <div className="mt-auto">
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        Show most visited
      </Button>
    </div>
  </Stack>
);

/** First run, nothing pinned yet: the get-started state from the hub. */
export const ShortcutsGetStarted = ({
  size,
}: {
  size: WidgetSize;
}): ReactElement => (
  <Stack>
    <WidgetLabel kind="shortcuts" />
    <div className="mt-3 flex gap-2">
      {myShortcuts.slice(0, size === 's' ? 4 : 5).map((s) => (
        <span
          key={s.url}
          className="flex size-10 items-center justify-center rounded-12 border border-dashed border-border-subtlest-secondary"
        >
          <img src={s.iconUrl} alt="" className="size-5 opacity-50" />
        </span>
      ))}
    </div>
    <span className="mt-3 font-bold text-text-primary typo-callout">
      Pin the sites you open every day.
    </span>
    <div className="mt-auto flex gap-2">
      <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
        Add shortcuts
      </Button>
      {size !== 's' && (
        <Button variant={ButtonVariant.Float} size={ButtonSize.Small}>
          Import bookmarks
        </Button>
      )}
    </div>
  </Stack>
);
