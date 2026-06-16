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
