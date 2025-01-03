import { gql } from 'graphql-request';
import type { ChecklistViewState } from '../lib/checklist';

export type Spaciness = 'eco' | 'roomy' | 'cozy';
export type RemoteTheme = 'darcula' | 'bright' | 'auto';

export enum CampaignCtaPlacement {
  Header = 'header',
  ProfileMenu = 'profileMenu',
}

export type SettingsFlags = {
  sidebarSquadExpanded: boolean;
  sidebarCustomFeedsExpanded: boolean;
  sidebarOtherExpanded: boolean;
  sidebarResourcesExpanded: boolean;
  sidebarBookmarksExpanded: boolean;
  clickbaitShieldEnabled: boolean;
};

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
  optOutCompanion: boolean;
  autoDismissNotifications: boolean;
  customLinks?: string[];
  campaignCtaPlacement?: CampaignCtaPlacement;
  onboardingChecklistView: ChecklistViewState;
  flags?: SettingsFlags;
};

export const UPDATE_USER_SETTINGS_MUTATION = gql`
  mutation UpdateUserSettings($data: UpdateSettingsInput!) {
    updateUserSettings(data: $data) {
      updatedAt
    }
  }
`;
