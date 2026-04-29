export type ShortcutMeta = {
  name?: string;
  iconUrl?: string;
};

export type Shortcut = {
  url: string;
  name?: string;
  iconUrl?: string;
};

export type ImportSource = 'topSites' | 'bookmarks';

// 'auto' mirrors Chrome's default new tab: live top-sites from the browser,
// read-only. 'manual' is the curated list the user pins and edits.
export type ShortcutsMode = 'auto' | 'manual';

// Appearance presets informed by patterns users already know:
// - 'tile'  → Chrome new-tab / iOS Home (favicon square, label under).
// - 'icon'  → iOS Dock, macOS Finder sidebar (icon only, labels via title).
// - 'chip'  → Chrome bookmarks bar, Toby, Raindrop headlines (horizontal
//             pill with favicon left, title right; info-dense, more fit).
export type ShortcutsAppearance = 'tile' | 'icon' | 'chip';

export const DEFAULT_SHORTCUTS_APPEARANCE: ShortcutsAppearance = 'tile';

export const MAX_SHORTCUTS = 12;
export const UNDO_TIMEOUT_MS = 6000;
