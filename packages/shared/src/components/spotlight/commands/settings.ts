import {
  CardLayout as CardLayoutIcon,
  HamburgerIcon,
  LayoutIcon,
  MoonIcon,
  NewTabIcon,
  ReadingStreakIcon,
  ShieldCheckIcon,
  SortIcon,
  SunIcon,
  ThemeAutoIcon,
} from '../../icons';
import {
  ThemeMode,
  type SettingsContextData,
} from '../../../contexts/SettingsContext';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface SettingsContext {
  settings: Pick<
    SettingsContextData,
    | 'themeMode'
    | 'setTheme'
    | 'insaneMode'
    | 'toggleInsaneMode'
    | 'sidebarExpanded'
    | 'toggleSidebarExpanded'
    | 'optOutCompanion'
    | 'toggleOptOutCompanion'
    | 'sortingEnabled'
    | 'toggleSortingEnabled'
    | 'autoDismissNotifications'
    | 'toggleAutoDismissNotifications'
    | 'optOutReadingStreak'
    | 'toggleOptOutReadingStreak'
    | 'optOutLevelSystem'
    | 'toggleOptOutLevelSystem'
    | 'optOutQuestSystem'
    | 'toggleOptOutQuestSystem'
    | 'openNewTab'
    | 'toggleOpenNewTab'
    | 'flags'
    | 'updateFlag'
  >;
}

/**
 * Settings commands execute in-place. Verb prefixes:
 *  - "Switch to …" cycles between named modes
 *  - "Toggle …"    flips a boolean
 */
export const getSettingsCommands = ({
  settings,
}: SettingsContext): SpotlightCommand[] => {
  const themeOrder: ThemeMode[] = [
    ThemeMode.Dark,
    ThemeMode.Light,
    ThemeMode.Auto,
  ];
  const nextTheme = (): ThemeMode => {
    const idx = themeOrder.indexOf(settings.themeMode);
    return themeOrder[(idx + 1) % themeOrder.length];
  };
  const themeIconMap = {
    [ThemeMode.Light]: SunIcon,
    [ThemeMode.Auto]: ThemeAutoIcon,
    [ThemeMode.Dark]: MoonIcon,
  };
  const themeIcon = themeIconMap[settings.themeMode] ?? MoonIcon;

  const commands: SpotlightCommand[] = [
    {
      id: 'settings.theme',
      title: `Switch theme (now: ${settings.themeMode})`,
      subtitle: 'Cycles between Dark, Light, and Auto',
      icon: themeIcon,
      keywords: ['dark mode', 'light mode', 'theme', 'appearance'],
      group: SpotlightGroup.Settings,
      quickKey: 'tt',
      perform: () => {
        settings.setTheme(nextTheme());
      },
    },
    {
      id: 'settings.layout',
      title: settings.insaneMode
        ? 'Switch to cards layout'
        : 'Switch to list layout',
      subtitle: 'Change how feed posts are displayed',
      icon: settings.insaneMode ? CardLayoutIcon : LayoutIcon,
      keywords: ['cards', 'list', 'layout', 'view', 'density'],
      group: SpotlightGroup.Settings,
      quickKey: 'dd',
      perform: () => {
        settings.toggleInsaneMode(!settings.insaneMode);
      },
    },
    {
      id: 'settings.sidebar',
      title: settings.sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar',
      icon: HamburgerIcon,
      keywords: ['sidebar', 'collapse', 'expand'],
      group: SpotlightGroup.Settings,
      quickKey: 'sb',
      perform: settings.toggleSidebarExpanded,
    },
    {
      id: 'settings.companion',
      title: settings.optOutCompanion
        ? 'Show companion widget'
        : 'Hide companion widget',
      subtitle: 'Side panel on external article pages',
      icon: NewTabIcon,
      keywords: ['companion', 'widget'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleOptOutCompanion,
    },
    {
      id: 'settings.sorting',
      title: settings.sortingEnabled
        ? 'Hide feed sorting menu'
        : 'Show feed sorting menu',
      icon: SortIcon,
      keywords: ['sort', 'feed sorting'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleSortingEnabled,
    },
    {
      id: 'settings.auto-dismiss',
      title: settings.autoDismissNotifications
        ? 'Disable auto-dismiss notifications'
        : 'Enable auto-dismiss notifications',
      icon: NewTabIcon,
      keywords: ['notifications', 'auto-dismiss'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleAutoDismissNotifications,
    },
    {
      id: 'settings.streaks',
      title: settings.optOutReadingStreak
        ? 'Show reading streaks'
        : 'Hide reading streaks',
      icon: ReadingStreakIcon,
      keywords: ['streak', 'reading streaks'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleOptOutReadingStreak,
    },
    {
      id: 'settings.levels',
      title: settings.optOutLevelSystem
        ? 'Show level system'
        : 'Hide level system',
      icon: ReadingStreakIcon,
      keywords: ['levels', 'xp', 'reputation'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleOptOutLevelSystem,
    },
    {
      id: 'settings.quests',
      title: settings.optOutQuestSystem ? 'Show quests' : 'Hide quests',
      icon: ReadingStreakIcon,
      keywords: ['quests', 'gamification'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleOptOutQuestSystem,
    },
    {
      id: 'settings.open-new-tab',
      title: settings.openNewTab
        ? 'Open links in same tab'
        : 'Open links in new tab',
      icon: NewTabIcon,
      keywords: ['new tab', 'links'],
      group: SpotlightGroup.Settings,
      perform: settings.toggleOpenNewTab,
    },
    {
      id: 'settings.clickbait-shield',
      title: settings.flags?.clickbaitShieldEnabled
        ? 'Disable clickbait shield'
        : 'Enable clickbait shield',
      subtitle: 'AI-rewritten post titles (Plus)',
      icon: ShieldCheckIcon,
      keywords: ['clickbait', 'titles', 'ai'],
      group: SpotlightGroup.Settings,
      plusBadge: true,
      perform: () => {
        settings.updateFlag(
          'clickbaitShieldEnabled',
          !settings.flags?.clickbaitShieldEnabled,
        );
      },
    },
  ];

  return commands;
};
