import { gql } from 'graphql-request';
import type { SortCommentsBy } from './comments';
import type { WriteFormTab } from '../components/fields/form/common';
import type {
  ShortcutMeta,
  ShortcutsAppearance,
  ShortcutsMode,
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
  // Persists that the user already chose to engage with the reader install
  // prompt (clicked "Enable permissions & read inside"). Future read clicks
  // skip the prompt and open the reader modal directly. Dismissing the prompt
  // without choosing an option leaves this unset so the prompt reappears.
  readerInstallPromptAcknowledged?: boolean;
  shortcutMeta?: Record<string, ShortcutMeta>;
  shortcutsMode?: ShortcutsMode;
  shortcutsAppearance?: ShortcutsAppearance;
  showShortcutsOnWebapp?: boolean;
  // v2 desktop rail: hide the text labels under each icon and narrow the
  // rail back to its icon-only width.
  sidebarCompact?: boolean;
  sidebarPinnedExpanded?: boolean;
  sidebarRecentExpanded?: boolean;
};

export type SettingsFlagValue = SettingsFlags[keyof SettingsFlags];

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
