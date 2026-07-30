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

// Profile-panel destinations keyed by their top-level route segment: your feed
// (Following), activity (History, Analytics, Jobs) and saved content (Bookmarks,
// briefings). (Happening Now lives under Explore, so /highlights is not here.)
const PROFILE_SEGMENTS = new Set([
  'analytics',
  'jobs',
  'history',
  'following',
  'bookmarks',
  'briefing',
]);

// The leading path segment (origin/query/hash stripped). Matching on the first
// segment — not a loose substring — so e.g. a tag named "jobs" (/tags/jobs) or a
// source slug containing "history" doesn't get misrouted to the Profile panel.
const firstPathSegment = (activePage: string): string =>
  activePage
    .replace(/^https?:\/\/[^/]+/, '')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)[0] ?? '';

export const getSidebarCategoryForPath = (
  activePage: string,
): SidebarCategoryId => {
  const segment = firstPathSegment(activePage);
  // Settings owns its sub-pages, checked first so notification/gamification
  // *settings* (/settings/notifications, etc.) keep the Settings panel. A
  // category's own settings shortcut lives under that category's segment
  // instead (e.g. /notifications/settings), so it keeps that category's panel.
  if (segment === 'settings') {
    return SidebarCategory.Settings;
  }
  if (segment === 'notifications') {
    return SidebarCategory.Notifications;
  }
  if (segment === 'game-center' || segment === 'daily-quests') {
    return SidebarCategory.GameCenter;
  }
  if (segment === 'squads') {
    return SidebarCategory.Squads;
  }
  if (PROFILE_SEGMENTS.has(segment)) {
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
