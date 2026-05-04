import type { ComponentType, ReactElement } from 'react';
import type { IconProps } from '../Icon';

/**
 * Verb-prefix convention for command titles (Linear pattern):
 *  - `Go to …`     → navigation
 *  - `Open …`      → modal opener
 *  - `Switch to …` → mode swap (theme, layout)
 *  - `Toggle …`    → boolean preference
 *  - `Create …`    → new entity
 *  - `Copy …`      → clipboard
 *  - `Search …`    → entity-search providers
 *  - destructive verbs (`Log out`, `Delete …`) reserved for the
 *    inline destructive-confirm path.
 */
export enum SpotlightGroup {
  Suggested = 'suggested',
  Recent = 'recent',
  Navigate = 'navigate',
  Create = 'create',
  Settings = 'settings',
  Actions = 'actions',
  Search = 'search',
  Help = 'help',
}

export const groupLabels: Record<SpotlightGroup, string> = {
  [SpotlightGroup.Suggested]: 'Suggested',
  [SpotlightGroup.Recent]: 'Recently used',
  [SpotlightGroup.Navigate]: 'Go to',
  [SpotlightGroup.Create]: 'Create',
  [SpotlightGroup.Settings]: 'Settings',
  [SpotlightGroup.Actions]: 'Actions',
  [SpotlightGroup.Search]: 'Search',
  [SpotlightGroup.Help]: 'Help',
};

export const groupOrder: SpotlightGroup[] = [
  SpotlightGroup.Suggested,
  SpotlightGroup.Recent,
  SpotlightGroup.Navigate,
  SpotlightGroup.Create,
  SpotlightGroup.Settings,
  SpotlightGroup.Actions,
  SpotlightGroup.Search,
  SpotlightGroup.Help,
];

export interface SpotlightContextEnv {
  isLoggedIn: boolean;
  isAuthReady: boolean;
  isPlus: boolean;
  isExtension: boolean;
  isMobile: boolean;
}

export interface SpotlightCommand {
  id: string;
  title: string;
  subtitle?: string;
  icon: ComponentType<IconProps> | (() => ReactElement);
  /** Extra search terms beyond the title (synonyms, abbreviations). */
  keywords?: string[];
  group: SpotlightGroup;
  /** Optional global hotkey to display on the right of the row, e.g. `'c'`. */
  shortcut?: string;
  /** Predicate to hide the command when env doesn't match. */
  when?: (env: SpotlightContextEnv) => boolean;
  /** Mark commands that require an inline confirm before `perform` runs. */
  destructive?: boolean;
  /** Mark commands that require login; we still render but route via auth. */
  requiresAuth?: boolean;
  /** Show a "Plus" badge instead of hiding the row when not Plus. */
  plusBadge?: boolean;
  /** Action to execute. May be async. */
  perform: () => void | Promise<void>;
}

export interface RecentCommandEntry {
  commandId: string;
  lastUsedAt: number;
}

export const RECENT_STORAGE_KEY = 'daily:spotlight:recent';
export const RECENT_MAX_ENTRIES = 8;
