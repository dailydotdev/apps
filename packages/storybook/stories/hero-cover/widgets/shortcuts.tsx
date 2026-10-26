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
const largeCapacity = 6;
const columns: Record<WidgetSize, string> = {
  s: 'grid-cols-4',
  m: 'grid-cols-3',
  l: 'grid-cols-6',
  w: 'grid-cols-4',
};

type Source = 'mine' | 'visited';

const SourceSwitch = ({
  source,
  onChange,
}: {
  source: Source;
  onChange: (source: Source) => void;
}): ReactElement => (
  <span className="flex rounded-8 bg-surface-float p-0.5">
    {(
      [
        ['mine', 'Mine'],
        ['visited', 'Most visited'],
      ] as [Source, string][]
    ).map(([value, label]) => (
      <button
        key={value}
        type="button"
        onClick={() => onChange(value)}
        className={classNames(
          'h-6 rounded-6 px-2 typo-caption1',
          value === source
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {label}
      </button>
    ))}
  </span>
);

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
      className={classNames(
        'grid content-start gap-x-1',
        size === 's' ? 'mt-1.5 gap-y-0' : 'mt-3 gap-y-2',
        appearance === 'chip' ? 'grid-cols-2' : columns[size],
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
        <AddShortcutTile onClick={() => undefined} appearance={appearance} />
      )}
    </div>
  );
};

export const ShortcutsWidget = ({
  size,
  initialSource = 'mine',
  appearance = 'tile',
  isExtension = true,
  shortcuts = myShortcuts,
}: {
  size: WidgetSize;
  initialSource?: Source;
  appearance?: ShortcutsAppearance;
  /** Most visited needs the browser's topSites, so only the extension has it. */
  isExtension?: boolean;
  shortcuts?: Shortcut[];
}): ReactElement => {
  const [source, setSource] = useState<Source>(initialSource);
  const list = source === 'mine' ? shortcuts : mostVisited;
  // Large has room for both lists at once, so it needs no switch.
  if (size === 'l' && isExtension && appearance !== 'chip') {
    return (
      <Stack>
        <WidgetLabel kind="shortcuts">Shortcuts</WidgetLabel>
        <Grid
          shortcuts={shortcuts.slice(0, largeCapacity)}
          size={size}
          appearance={appearance}
          canAdd={false}
        />
        <span className="mt-4 font-bold text-text-tertiary typo-caption1">
          Most visited
        </span>
        <Grid
          shortcuts={mostVisited.slice(0, largeCapacity)}
          size={size}
          appearance={appearance}
          canAdd={false}
        />
      </Stack>
    );
  }
  return (
    <Stack>
      <WidgetLabel
        kind="shortcuts"
        trailing={
          isExtension && size !== 's' ? (
            <SourceSwitch source={source} onChange={setSource} />
          ) : undefined
        }
      >
        {source === 'visited' ? 'Most visited' : 'Shortcuts'}
      </WidgetLabel>
      <Grid
        shortcuts={list}
        size={size}
        appearance={appearance}
        canAdd={source === 'mine' && list.length < 12}
      />
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
