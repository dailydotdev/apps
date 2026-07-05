import type { ComponentType, ReactElement } from 'react';
import type { IconProps } from '../Icon';
import { SearchProviderEnum } from '../../graphql/search';

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
  SpotlightGroup.Recent,
  SpotlightGroup.Suggested,
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

/**
 * Discriminated metadata that lets the UI render typed result rows
 * (post / source / user / tag / see-all) instead of a single generic
 * row layout. Pure data — never read by `perform`.
 */
export type SpotlightCommandMeta =
  | { kind: 'post'; sourceImage?: string; sourceName?: string }
  | { kind: 'source'; image?: string; handle?: string }
  | { kind: 'user'; image?: string; handle?: string }
  | { kind: 'tag'; tagName: string }
  | {
      kind: 'see-all';
      scope: Exclude<
        SpotlightScope,
        SpotlightScope.All | SpotlightScope.Actions
      >;
    };

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
  /**
   * Apple-Tahoe-style 2-letter mnemonic. Typing the key + space at the
   * start of an empty input fires the command immediately. Must be exactly
   * two lowercase ASCII chars to keep dispatch unambiguous.
   */
  quickKey?: string;
  /** Predicate to hide the command when env doesn't match. */
  when?: (env: SpotlightContextEnv) => boolean;
  /** Mark commands that require an inline confirm before `perform` runs. */
  destructive?: boolean;
  /** Mark commands that require login; we still render but route via auth. */
  requiresAuth?: boolean;
  /** Show a "Plus" badge instead of hiding the row when not Plus. */
  plusBadge?: boolean;
  /**
   * Optional typed metadata. When present the modal renders a custom row
   * for that entity kind (avatar, handle, hashtag glyph, see-all CTA).
   */
  meta?: SpotlightCommandMeta;
  /** Action to execute. May be async. */
  perform: () =>
    | SpotlightCommandResult
    | void
    | Promise<SpotlightCommandResult | void>;
}

export interface SpotlightCommandResult {
  keepOpen?: boolean;
}

/**
 * Apple-Tahoe browse-mode equivalent. When the modal is in a non-`All` scope,
 * only the matching entity-search results are visible and the placeholder
 * adapts. Backspace on an empty input pops back to `All`.
 */
export enum SpotlightScope {
  All = 'all',
  Actions = 'actions',
  Posts = 'posts',
  Squads = 'squads',
  People = 'people',
  Tags = 'tags',
}

export interface ScopeMetaEntry {
  label: string;
  /** Used for tooltips and ARIA labels on the trigger icon buttons. */
  triggerLabel: string;
  /** Used as Command.Input placeholder while the scope is active. */
  placeholder: string;
  /** Single-letter index for Alt+1..N dispatch (1-based). */
  shortcutIndex: number;
  /** Optional — only entity scopes hit a backend search provider. */
  searchProvider?: SearchProviderEnum;
}

export const scopeOrder: Array<Exclude<SpotlightScope, SpotlightScope.All>> = [
  SpotlightScope.Actions,
  SpotlightScope.Posts,
  SpotlightScope.Squads,
  SpotlightScope.People,
  SpotlightScope.Tags,
];

export const scopeMeta: Record<
  Exclude<SpotlightScope, SpotlightScope.All>,
  ScopeMetaEntry
> = {
  [SpotlightScope.Actions]: {
    label: 'Actions',
    triggerLabel: 'Browse all actions',
    placeholder: 'Browse actions and settings...',
    shortcutIndex: 1,
  },
  [SpotlightScope.Posts]: {
    label: 'Posts',
    triggerLabel: 'Search posts',
    placeholder: 'Search posts...',
    shortcutIndex: 2,
    searchProvider: SearchProviderEnum.Posts,
  },
  [SpotlightScope.Squads]: {
    label: 'Squads',
    triggerLabel: 'Search squads',
    placeholder: 'Search squads...',
    shortcutIndex: 3,
    searchProvider: SearchProviderEnum.Sources,
  },
  [SpotlightScope.People]: {
    label: 'People',
    triggerLabel: 'Search people',
    placeholder: 'Search people...',
    shortcutIndex: 4,
    searchProvider: SearchProviderEnum.Users,
  },
  [SpotlightScope.Tags]: {
    label: 'Tags',
    triggerLabel: 'Search tags',
    placeholder: 'Search tags...',
    shortcutIndex: 5,
    searchProvider: SearchProviderEnum.Tags,
  },
};

export interface RecentCommandEntry {
  commandId: string;
  lastUsedAt: number;
}

export const RECENT_STORAGE_KEY = 'daily:spotlight:recent';
export const RECENT_MAX_ENTRIES = 8;
