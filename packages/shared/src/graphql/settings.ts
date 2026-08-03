import { gql } from 'graphql-request';
import type { SortCommentsBy } from './comments';
import type { WriteFormTab } from '../components/fields/form/common';
import type {
  ShortcutMeta,
  ShortcutsAppearance,
  ShortcutsMode,
  SidebarShortcut,
} from '../features/shortcuts/types';

export type Spaciness = 'eco' | 'roomy' | 'cozy';
export type RemoteTheme = 'darcula' | 'bright' | 'auto';

export enum CampaignCtaPlacement {
  Header = 'header',
  ProfileMenu = 'profileMenu',
}

export enum HighlightsPlacement {
  Default = 'default',
  Pinned = 'pinned',
  Disabled = 'disabled',
}

export type SettingsFlags = {
  sidebarSquadExpanded: boolean;
  sidebarCustomFeedsExpanded: boolean;
  sidebarOtherExpanded: boolean;
  sidebarResourcesExpanded: boolean;
  sidebarBookmarksExpanded: boolean;
  clickbaitShieldEnabled: boolean;
  highlightsPlacement?: HighlightsPlacement;
  timezoneMismatchIgnore?: string;
  prompt?: Record<string, boolean>;
  defaultWriteTab?: WriteFormTab;
  legacyPostLayoutOptOut?: boolean;
  highlightCardsOptOut?: boolean;
  // Persists that the user chose to enable reader permissions from an install
  // prompt. Future read clicks skip the prompt and open the reader modal
  // directly unless the user later opts out.
  readerInstallPromptAcknowledged?: boolean;
  // Persists that the intermediate install prompt has been surfaced to this
  // user. Once set, the prompt never auto-opens again regardless of whether the
  // user accepted or dismissed it.
  readerInstallPromptSeen?: boolean;
  shortcutMeta?: Record<string, ShortcutMeta>;
  shortcutsMode?: ShortcutsMode;
  shortcutsAppearance?: ShortcutsAppearance;
  showShortcutsOnWebapp?: boolean;
  sidebarCompact?: boolean;
  // In dock order.
  sidebarShortcuts?: SidebarShortcut[];
  sidebarPinnedExpanded?: boolean;
  sidebarRecentExpanded?: boolean;
};

export type SettingsFlagValue = SettingsFlags[keyof SettingsFlags];

// The API declares its accepted flags one by one in `SettingsFlagsPublicInput`.
// Sending one it doesn't know fails GraphQL validation, and since every write
// ships the whole `flags` object, that breaks the persistence of ALL settings.
// These have no API field yet, so they're kept in local storage and stripped
// from the remote payload.
//
// Deleting an entry here is the only change needed once the API stores it —
// see docs/settings-flags-backend.md.
export const clientOnlySettingsFlags = [
  'sidebarCompact',
  'sidebarShortcuts',
  'sidebarPinnedExpanded',
  'sidebarRecentExpanded',
] as const satisfies ReadonlyArray<keyof SettingsFlags>;

export type ClientOnlyFlagKey = (typeof clientOnlySettingsFlags)[number];

export type ClientOnlySettingsFlags = Pick<SettingsFlags, ClientOnlyFlagKey>;

export enum SidebarSettingsFlags {
  SquadExpanded = 'sidebarSquadExpanded',
  PinnedExpanded = 'sidebarPinnedExpanded',
  RecentExpanded = 'sidebarRecentExpanded',
  CustomFeedsExpanded = 'sidebarCustomFeedsExpanded',
  OtherExpanded = 'sidebarOtherExpanded',
  ResourcesExpanded = 'sidebarResourcesExpanded',
  BookmarksExpanded = 'sidebarBookmarksExpanded',
  ClickbaitShieldEnabled = 'clickbaitShieldEnabled',
  // Renamed to avoid shadowing the HighlightsPlacement enum above.
  Highlights = 'highlightsPlacement',
}

export type RemoteSettings = {
  openNewTab: boolean;
  theme: RemoteTheme;
  spaciness: Spaciness;
  insaneMode: boolean;
  showTopSites: boolean;
  sidebarExpanded: boolean;
  companionExpanded: boolean;
  sortingEnabled: boolean;
  optOutReadingStreak: boolean;
  optOutStreakFreeze: boolean;
  optOutLevelSystem: boolean;
  optOutQuestSystem: boolean;
  optOutAchievements: boolean;
  optOutCompanion: boolean;
  autoDismissNotifications: boolean;
  sortCommentsBy: SortCommentsBy;
  showFeedbackButton: boolean;
  customLinks?: string[];
  campaignCtaPlacement?: CampaignCtaPlacement;
  flags?: SettingsFlags;
};

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($data: UpdateSettingsInput!) {
    updateUserSettings(data: $data) {
      updatedAt
    }
  }
`;
