import {
  SettingsContextData,
  ThemeMode,
} from '../../src/contexts/SettingsContext';

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
  optOutWeeklyGoal: true,
  sidebarExpanded: true,
  sortingEnabled: true,
  toggleAutoDismissNotifications: jest.fn(),
  toggleOptOutCompanion: jest.fn(),
  toggleOptOutWeeklyGoal: jest.fn(),
  toggleSidebarExpanded: jest.fn(),
  toggleSortingEnabled: jest.fn(),
  syncSettings: jest.fn(),
  updateCustomLinks: jest.fn(),
  ...props,
});

export const defaultTestSettings: SettingsContextData = createTestSettings();

export default defaultTestSettings;
