import {
  SettingsContextData,
  ThemeMode,
} from '../../src/contexts/SettingsContext';
import { ChecklistViewState } from '../../src/lib/checklist';

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
  sortingEnabled: true,
  companionExpanded: false,
  toggleAutoDismissNotifications: jest.fn(),
  toggleOptOutCompanion: jest.fn(),
  toggleOptOutReadingStreak: jest.fn(),
  toggleSidebarExpanded: jest.fn(),
  toggleSortingEnabled: jest.fn(),
  syncSettings: jest.fn(),
  updateCustomLinks: jest.fn(),
  onToggleHeaderPlacement: jest.fn(),
  setOnboardingChecklistView: jest.fn(),
  setSettings: jest.fn(),
  onboardingChecklistView: ChecklistViewState.Hidden,
  ...props,
});

export const defaultTestSettings: SettingsContextData = createTestSettings();

export default defaultTestSettings;
