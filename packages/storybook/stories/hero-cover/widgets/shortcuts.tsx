import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { DownloadIcon } from '@dailydotdev/shared/src/components/icons/Download';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { TrendingIcon } from '@dailydotdev/shared/src/components/icons/Trending';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
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

/** A column with nothing to show yet: one reason and one button, in place. */
const ColumnAsk = ({
  icons,
  title,
  note,
  action,
  isMuted,
}: {
  icons: Shortcut[];
  title: string;
  note?: string;
  action: string;
  isMuted?: boolean;
}): ReactElement => (
  <div className="mt-3 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-16 border border-dashed border-border-subtlest-secondary p-4 text-center">
    <span className="flex gap-1.5">
      {icons.map((icon) => (
        <span
          key={icon.url}
          className="flex size-9 items-center justify-center rounded-12 bg-surface-float"
        >
          <img
            src={icon.iconUrl}
            alt=""
            className={classNames(
              'size-4',
              isMuted ? 'opacity-40 grayscale' : 'opacity-60',
            )}
          />
        </span>
      ))}
    </span>
    <span className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-footnote">{title}</span>
      {note && <span className="text-text-tertiary typo-caption1">{note}</span>}
    </span>
    <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
      {action}
    </Button>
  </div>
);

type Layout = 'grid' | 'list';

/** The gear: every widget size opens the same settings, in place. */
const GearButton = ({ onClick }: { onClick?: () => void }): ReactElement => (
  <button
    type="button"
    aria-label="Shortcut settings"
    title="Shortcut settings"
    onClick={onClick}
    className="flex size-6 shrink-0 items-center justify-center rounded-8 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
  >
    <SettingsIcon size={IconSize.Size16} />
  </button>
);

const SettingRow = ({
  label,
  isCompact,
  children,
}: {
  label: string;
  isCompact?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-center justify-between gap-3 border-b border-border-subtlest-tertiary last:border-0',
      isCompact ? 'h-8' : 'h-10',
    )}
  >
    <span className="truncate text-text-primary typo-footnote">{label}</span>
    {children}
  </div>
);

const SettingAction = ({
  label,
  icon,
  isCompact,
}: {
  label: string;
  icon: ReactElement;
  isCompact?: boolean;
}): ReactElement => (
  <button
    type="button"
    className={classNames(
      'flex w-full items-center gap-2 border-b border-border-subtlest-tertiary text-left text-text-primary transition-colors last:border-0 hover:text-accent-water-default',
      isCompact ? 'h-8' : 'h-10',
    )}
  >
    <span className="flex-1 truncate typo-footnote">{label}</span>
    <span className="shrink-0 text-text-tertiary">{icon}</span>
  </button>
);

/**
 * The widget turned over, the way iOS edits a widget: layout, most visited
 * and imports, the same choices as the extension's shortcuts manager, sized
 * to fit even a Small widget so nothing is clipped by a menu.
 */
const ShortcutsSettings = ({
  size,
  isExtension,
  layout,
  onLayout,
  isMostVisitedOn,
  onMostVisited,
  onDone,
}: {
  size: WidgetSize;
  isExtension: boolean;
  layout: Layout;
  onLayout: (layout: Layout) => void;
  isMostVisitedOn: boolean;
  onMostVisited: () => void;
  onDone: () => void;
}): ReactElement => {
  const isCompact = size === 's';
  return (
    <Stack mood="launcher">
      <WidgetLabel
        kind="shortcuts"
        trailing={
          <button
            type="button"
            onClick={onDone}
            className="h-6 rounded-8 px-2 font-bold text-text-primary typo-caption1 transition-colors hover:bg-surface-hover"
          >
            Done
          </button>
        }
      />
      <div
        className={classNames(
          'flex flex-col',
          isCompact ? 'mt-1' : 'mt-3',
          size === 'l' && 'max-w-[20rem]',
        )}
      >
        <SettingRow label="Layout" isCompact={isCompact}>
          <span className="flex rounded-8 bg-surface-float p-0.5">
            {(['grid', 'list'] as Layout[]).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={layout === value}
                onClick={() => onLayout(value)}
                className={classNames(
                  'h-6 rounded-6 px-2 capitalize typo-caption1',
                  layout === value
                    ? 'bg-background-default font-bold text-text-primary shadow-2'
                    : 'text-text-tertiary hover:text-text-primary',
                )}
              >
                {value}
              </button>
            ))}
          </span>
        </SettingRow>
        {isExtension && (
          <SettingRow label="Most visited sites" isCompact={isCompact}>
            <Switch
              inputId={`most-visited-${size}`}
              name="most-visited"
              checked={isMostVisitedOn}
              onToggle={onMostVisited}
              aria-label="Most visited sites"
              compact
            />
          </SettingRow>
        )}
        {isExtension && (
          <SettingAction
            label="Import bookmarks"
            icon={<DownloadIcon size={IconSize.Size16} />}
            isCompact={isCompact}
          />
        )}
        <SettingAction
          label="Manage shortcuts"
          icon={<EditIcon size={IconSize.Size16} />}
          isCompact={isCompact}
        />
      </div>
    </Stack>
  );
};

export const ShortcutsWidget = ({
  size,
  initialSource = 'mine',
  appearance = 'tile',
  isExtension = true,
  shortcuts = myShortcuts,
  visited = mostVisited,
  isMostVisitedAllowed = true,
  showMostVisited = true,
  isSettingsOpen: isSettingsOpenInitially = false,
  layout: initialLayout = 'grid',
}: {
  size: WidgetSize;
  /** The browser's top sites, when the reader has allowed them. */
  visited?: Shortcut[];
  /** The topSites permission: until it is granted, most visited asks for it. */
  isMostVisitedAllowed?: boolean;
  /** The reader's choice in settings; the extension shows it by default. */
  showMostVisited?: boolean;
  /** Open on the settings side, for review. */
  isSettingsOpen?: boolean;
  /** Grid of tiles, or a list of rows with the domain under each name. */
  layout?: Layout;
  initialSource?: Source;
  appearance?: ShortcutsAppearance;
  /** Most visited and bookmarks need browser APIs, so only the extension. */
  isExtension?: boolean;
  shortcuts?: Shortcut[];
}): ReactElement => {
  const [source, setSource] = useState<Source>(initialSource);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [isMostVisitedOn, setIsMostVisitedOn] = useState(showMostVisited);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsOpenInitially);
  const hasMostVisited = isExtension && isMostVisitedOn;
  const shownSource = hasMostVisited ? source : 'mine';
  const list = shownSource === 'mine' ? shortcuts : visited;
  const canAdd = shownSource === 'mine' && list.length < 12;
  const gear = <GearButton onClick={() => setIsSettingsOpen(true)} />;

  if (isSettingsOpen) {
    return (
      <ShortcutsSettings
        size={size}
        isExtension={isExtension}
        layout={layout}
        onLayout={setLayout}
        isMostVisitedOn={isMostVisitedOn}
        onMostVisited={() => setIsMostVisitedOn((value) => !value)}
        onDone={() => setIsSettingsOpen(false)}
      />
    );
  }

  // Large has room for both sources, so with most visited on it shows them
  // side by side and needs no tabs. Without it, Large is one list sized to
  // fill.
  if (size === 'l' && hasMostVisited) {
    const sites = (items: Shortcut[], canAddHere: boolean) =>
      layout === 'list' ? (
        <List
          shortcuts={items}
          size="m"
          canAdd={canAddHere}
          isUnderHeader={false}
        />
      ) : (
        <Grid
          shortcuts={items}
          size="m"
          appearance={appearance}
          canAdd={canAddHere}
        />
      );
    return (
      <Stack mood="launcher">
        {/* The two column names are the header, each over its own column. */}
        <div className="flex h-6 shrink-0 items-center gap-12">
          <div className="min-w-0 flex-1">
            <WidgetLabel kind="shortcuts" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <TrendingIcon
                secondary
                size={IconSize.Size16}
                className="shrink-0 text-accent-water-default"
              />
              <span className="truncate font-bold text-text-primary typo-caption1">
                Most visited
              </span>
            </span>
            {gear}
          </div>
        </div>
        <div className="flex min-h-0 flex-1 gap-12">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {shortcuts.length ? (
              sites(shortcuts, shortcuts.length < 12)
            ) : (
              <ColumnAsk
                icons={myShortcuts.slice(0, 4)}
                title="Pin the sites you open every day."
                action="Add shortcuts"
              />
            )}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {isMostVisitedAllowed && visited.length ? (
              sites(visited, false)
            ) : (
              <ColumnAsk
                icons={mostVisited.slice(0, 4)}
                isMuted
                title="Your most visited sites, one click away."
                note="Your browser asks once. The list never leaves this device."
                action="Show most visited"
              />
            )}
          </div>
        </div>
      </Stack>
    );
  }

  return (
    <Stack mood="launcher">
      <WidgetLabel kind="shortcuts" trailing={gear}>
        {hasMostVisited ? (
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
  <Stack mood="launcher">
    <WidgetLabel kind="shortcuts" trailing={<GearButton />}>
      Most visited
    </WidgetLabel>
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
  isExtension = true,
}: {
  size: WidgetSize;
  /** Importing bookmarks needs the browser's bookmarks API: extension only. */
  isExtension?: boolean;
}): ReactElement => (
  <Stack mood="launcher">
    <WidgetLabel kind="shortcuts" trailing={<GearButton />} />
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
    {size !== 's' && (
      <span className="mt-1 text-text-tertiary typo-footnote">
        {isExtension
          ? 'Add them one by one, or bring over your bookmarks bar.'
          : 'Add the sites you open most, one by one.'}
      </span>
    )}
    <div
      className={classNames(
        'mt-auto flex gap-2',
        size === 'm' ? 'flex-col' : 'items-center',
      )}
    >
      <Button
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        className={size === 'm' ? 'w-full' : undefined}
      >
        Add shortcuts
      </Button>
      {isExtension && size !== 's' && (
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<DownloadIcon />}
          className={size === 'm' ? 'w-full' : undefined}
        >
          Import bookmarks
        </Button>
      )}
    </div>
  </Stack>
);
