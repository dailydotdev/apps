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

export type NewTabMode = 'discover' | 'focus';

export type FocusScheduleWindow = {
  start: number;
  end: number;
  enabled: boolean;
};

export type FocusScheduleWeekday =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun';

export type FocusSchedule = {
  pauseUntil?: number | null;
  windows?: Partial<Record<FocusScheduleWeekday, FocusScheduleWindow | null>>;
};

export type SettingsFlags = {
  sidebarSquadExpanded: boolean;
  sidebarCustomFeedsExpanded: boolean;
  sidebarOtherExpanded: boolean;
  sidebarResourcesExpanded: boolean;
  sidebarBookmarksExpanded: boolean;
  clickbaitShieldEnabled: boolean;
  timezoneMismatchIgnore?: string;
  prompt?: Record<string, boolean>;
  defaultWriteTab?: WriteFormTab;
  shortcutMeta?: Record<string, ShortcutMeta>;
  shortcutsMode?: ShortcutsMode;
  shortcutsAppearance?: ShortcutsAppearance;
  showShortcutsOnWebapp?: boolean;
  newTabMode?: NewTabMode;
  focusSchedule?: FocusSchedule;
};

export type SettingsFlagValue = SettingsFlags[keyof SettingsFlags];

export enum SidebarSettingsFlags {
  SquadExpanded = 'sidebarSquadExpanded',
  CustomFeedsExpanded = 'sidebarCustomFeedsExpanded',
  OtherExpanded = 'sidebarOtherExpanded',
  ResourcesExpanded = 'sidebarResourcesExpanded',
  BookmarksExpanded = 'sidebarBookmarksExpanded',
  ClickbaitShieldEnabled = 'clickbaitShieldEnabled',
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
