// V2 sidebar category identifiers. Derived from the URL for navigation and
// stored in local state for click-driven overrides — intentionally NOT
// persisted to SettingsContext / localStorage / IndexedDB.
export const SidebarCategory = {
  Main: 'main',
  Squads: 'squads',
  Notifications: 'notifications',
  Saved: 'saved',
  GameCenter: 'gameCenter',
  Profile: 'profile',
  Settings: 'settings',
} as const;

export type SidebarCategoryId =
  (typeof SidebarCategory)[keyof typeof SidebarCategory];

const profilePathFragments = [
  '/analytics',
  '/jobs',
  '/settings/customization/devcard',
  '/wallet',
];

export const getSidebarCategoryForPath = (
  activePage: string,
): SidebarCategoryId => {
  // Notification/gamification *settings* live under /settings and keep the
  // Settings panel. Each category exposes its own settings shortcut under its
  // own path instead (e.g. /notifications/settings, /game-center/settings),
  // which keeps that category's panel. The general /settings fallback below
  // catches the settings pages.
  if (
    activePage.includes('/notifications') &&
    !activePage.includes('/settings/notifications')
  ) {
    return SidebarCategory.Notifications;
  }
  if (
    activePage.includes('/game-center') ||
    activePage.includes('/daily-quests')
  ) {
    return SidebarCategory.GameCenter;
  }
  if (activePage.includes('/bookmarks') || activePage.includes('/briefing')) {
    return SidebarCategory.Saved;
  }
  if (activePage.includes('/squads')) {
    return SidebarCategory.Squads;
  }
  if (profilePathFragments.some((path) => activePage.includes(path))) {
    return SidebarCategory.Profile;
  }
  if (activePage.includes('/settings')) {
    return SidebarCategory.Settings;
  }
  // Explore and its sub-pages (/posts, /tags, /sources, /users, /discussed)
  // now live under Home, so they fall through to the Main category.
  return SidebarCategory.Main;
};

// A settings page renders its navigation only inside the v2 context panel, so
// the panel must stay expanded there — collapsing it leaves no way to move
// between settings sections. Both the sidebar (to force the panel open and
// hide the collapse toggle) and MainLayout (to keep the content padding in
// sync) rely on this single check.
export const isSidebarSettingsPath = (activePage: string): boolean =>
  getSidebarCategoryForPath(activePage) === SidebarCategory.Settings;
