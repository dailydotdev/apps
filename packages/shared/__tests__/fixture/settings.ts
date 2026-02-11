import type { SettingsContextData } from '../../src/contexts/SettingsContext';
import { ThemeMode } from '../../src/contexts/SettingsContext';
import { SortCommentsBy } from '../../src/graphql/comments';

export const createTestSettings = (
  props: Partial<SettingsContextData> = {},
): SettingsContextData => ({
  spaciness: 'eco',
  openNewTab: true,
  setTheme: jest.fn(),
  themeMode: ThemeMode.Dark,
  setSpaciness: jest.fn(),
  toggleOpenNewTab: jest.fn(),
  insaneMode: false,
  loadedSettings: true,
  toggleInsaneMode: jest.fn(),
  showTopSites: true,
  toggleShowTopSites: jest.fn(),
  autoDismissNotifications: true,
  optOutCompanion: true,
  optOutReadingStreak: true,
  sidebarExpanded: true,
  companionExpanded: true,
  sortingEnabled: true,
  sortCommentsBy: SortCommentsBy.OldestFirst,
  showFeedbackButton: true,
  toggleShowFeedbackButton: jest.fn(),
  toggleAutoDismissNotifications: jest.fn(),
  toggleOptOutCompanion: jest.fn(),
  toggleOptOutReadingStreak: jest.fn(),
  toggleSidebarExpanded: jest.fn(),
  toggleSortingEnabled: jest.fn(),
  syncSettings: jest.fn(),
  updateCustomLinks: jest.fn(),
  updateSortCommentsBy: jest.fn(),
  updateFlag: jest.fn(),
  updateFlagRemote: jest.fn(),
  updatePromptFlag: jest.fn(),
  onToggleHeaderPlacement: jest.fn(),
  setSettings: jest.fn(),
  applyThemeMode: jest.fn(),
  ...props,
});

export const defaultTestSettings: SettingsContextData = createTestSettings();

export default defaultTestSettings;
