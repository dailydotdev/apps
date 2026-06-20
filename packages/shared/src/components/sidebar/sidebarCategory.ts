// V2 sidebar category identifiers. Derived from the URL for navigation and
// stored in local state for click-driven overrides — intentionally NOT
// persisted to SettingsContext / localStorage / IndexedDB.
export const SidebarCategory = {
  // The primary feed/discovery category. Surfaced on the rail as "Explore"
  // (its panel lists the /posts sub-tabs); the id stays `main` so it remains
  // the default/fallback category.
  Main: 'main',
  // The avatar tab. Opens the profile panel (your feeds, activity, bookmarks,
  // pins, custom feeds, account shortcuts) instead of a dropdown menu.
  Profile: 'profile',
  Squads: 'squads',
  Notifications: 'notifications',
  GameCenter: 'gameCenter',
  Settings: 'settings',
} as const;

export type SidebarCategoryId =
  (typeof SidebarCategory)[keyof typeof SidebarCategory];

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
  if (activePage.includes('/squads')) {
    return SidebarCategory.Squads;
  }
  if (activePage.includes('/settings')) {
    return SidebarCategory.Settings;
  }
  // Profile-panel destinations: your feed (Following), activity (History,
  // Analytics, Jobs) and saved content (Bookmarks, briefings). Visiting any of
  // them keeps the Profile panel selected so the panel matches the page.
  // (Happening Now lives under Explore.)
  if (
    activePage.includes('/analytics') ||
    activePage.includes('/jobs') ||
    activePage.includes('/history') ||
    activePage.includes('/following') ||
    activePage.includes('/bookmarks') ||
    activePage.includes('/briefing')
  ) {
    return SidebarCategory.Profile;
  }
  // Explore and its sub-pages (/posts, /tags, /sources, /users, /discussed)
  // fall through to the Main ("Explore") category.
  return SidebarCategory.Main;
};

// A settings page renders its navigation only inside the v2 context panel, so
// the panel must stay expanded there — collapsing it leaves no way to move
// between settings sections. Both the sidebar (to force the panel open and
// hide the collapse toggle) and MainLayout (to keep the content padding in
// sync) rely on this single check.
export const isSidebarSettingsPath = (activePage: string): boolean =>
  getSidebarCategoryForPath(activePage) === SidebarCategory.Settings;
