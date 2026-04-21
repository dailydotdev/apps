export type ShortcutColor =
  | 'burger'
  | 'cheese'
  | 'avocado'
  | 'bacon'
  | 'blueCheese'
  | 'cabbage';

export const shortcutColorPalette: readonly ShortcutColor[] = [
  'burger',
  'cheese',
  'avocado',
  'bacon',
  'blueCheese',
  'cabbage',
] as const;

export type ShortcutMeta = {
  name?: string;
  iconUrl?: string;
  color?: ShortcutColor;
};

export type Shortcut = {
  url: string;
  name?: string;
  iconUrl?: string;
  color?: ShortcutColor;
};

export type ImportSource = 'topSites' | 'bookmarks';

// 'auto' mirrors Chrome's default new tab: live top-sites from the browser,
// read-only. 'manual' is the curated list the user pins and edits.
export type ShortcutsMode = 'auto' | 'manual';

export const MAX_SHORTCUTS = 12;
export const UNDO_TIMEOUT_MS = 6000;
