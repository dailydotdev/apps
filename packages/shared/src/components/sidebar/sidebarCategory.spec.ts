import {
  getSidebarCategoryForPath,
  isSidebarSettingsPath,
  SidebarCategory,
} from './sidebarCategory';

describe('getSidebarCategoryForPath', () => {
  it('maps settings pages to the Settings category', () => {
    expect(getSidebarCategoryForPath('/settings/profile')).toBe(
      SidebarCategory.Settings,
    );
    expect(getSidebarCategoryForPath('/settings/notifications')).toBe(
      SidebarCategory.Settings,
    );
  });

  it('maps the devcard customization page to the Settings category', () => {
    // Profile moved to the bottom-rail dropdown, so its old sub-pages
    // (devcard lives under /settings) now resolve to the Settings panel.
    expect(getSidebarCategoryForPath('/settings/customization/devcard')).toBe(
      SidebarCategory.Settings,
    );
  });

  it('keeps the notifications inbox on the Notifications category', () => {
    expect(getSidebarCategoryForPath('/notifications')).toBe(
      SidebarCategory.Notifications,
    );
  });

  it('maps profile-panel pages to the Profile category', () => {
    // The avatar panel hosts these feeds/activity, so the panel should stay
    // on Profile while the user browses them.
    expect(getSidebarCategoryForPath('/following')).toBe(
      SidebarCategory.Profile,
    );
    expect(getSidebarCategoryForPath('/history')).toBe(SidebarCategory.Profile);
    expect(getSidebarCategoryForPath('/analytics')).toBe(
      SidebarCategory.Profile,
    );
    // Bookmarks now live in the Profile panel rather than a Saved rail tab.
    expect(getSidebarCategoryForPath('/bookmarks')).toBe(
      SidebarCategory.Profile,
    );
    expect(getSidebarCategoryForPath('/bookmarks/later')).toBe(
      SidebarCategory.Profile,
    );
  });

  it('falls back to the Main (Explore) category for feed pages', () => {
    expect(getSidebarCategoryForPath('/posts')).toBe(SidebarCategory.Main);
    expect(getSidebarCategoryForPath('/')).toBe(SidebarCategory.Main);
    // Happening Now lives under Explore, not Profile.
    expect(getSidebarCategoryForPath('/highlights')).toBe(SidebarCategory.Main);
  });

  it('matches the leading segment, not a substring', () => {
    // A tag/source whose slug contains a profile keyword must stay on Explore,
    // not jump to the Profile panel.
    expect(getSidebarCategoryForPath('/tags/jobs')).toBe(SidebarCategory.Main);
    expect(getSidebarCategoryForPath('/sources/history-channel')).toBe(
      SidebarCategory.Main,
    );
    // A category's own settings shortcut keeps that category (not Settings).
    expect(getSidebarCategoryForPath('/notifications/settings')).toBe(
      SidebarCategory.Notifications,
    );
  });
});

describe('isSidebarSettingsPath', () => {
  it('is true only for settings panel pages', () => {
    expect(isSidebarSettingsPath('/settings/profile')).toBe(true);
    expect(isSidebarSettingsPath('/settings/notifications')).toBe(true);
  });

  it('is true for settings pages including devcard customization', () => {
    expect(isSidebarSettingsPath('/settings/customization/devcard')).toBe(true);
  });

  it('is false for non-settings pages', () => {
    expect(isSidebarSettingsPath('/notifications')).toBe(false);
    expect(isSidebarSettingsPath('/posts')).toBe(false);
    expect(isSidebarSettingsPath('/')).toBe(false);
  });
});
