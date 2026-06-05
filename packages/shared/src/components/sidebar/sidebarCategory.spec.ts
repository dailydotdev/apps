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

  it('keeps the devcard customization page on the Profile category', () => {
    expect(
      getSidebarCategoryForPath('/settings/customization/devcard'),
    ).toBe(SidebarCategory.Profile);
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

  it('is false for the devcard page and non-settings pages', () => {
    expect(isSidebarSettingsPath('/settings/customization/devcard')).toBe(
      false,
    );
    expect(isSidebarSettingsPath('/notifications')).toBe(false);
    expect(isSidebarSettingsPath('/posts')).toBe(false);
    expect(isSidebarSettingsPath('/')).toBe(false);
  });
});
