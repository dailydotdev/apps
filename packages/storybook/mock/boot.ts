import * as actual from '@dailydotdev/shared/src/lib/boot';
import { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import { RemoteSettings } from '@dailydotdev/shared/src/graphql/settings';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';

export const getBootData = async () => {
  const defaultAlerts: Alerts = {
    filter: true,
    rankLastSeen: new Date(),
  };

  const defaultSettings: RemoteSettings = {
    theme: 'bright',
    openNewTab: false,
    spaciness: 'roomy',
    insaneMode: false,
    showTopSites: true,
    sidebarExpanded: true,
    companionExpanded: false,
    sortingEnabled: false,
    optOutReadingStreak: true,
    optOutCompanion: true,
    autoDismissNotifications: true,
    customLinks: [
      'http://custom1.com',
      'http://custom2.com',
      'http://custom3.com',
      'http://custom4.com',
      'http://custom5.com',
    ],
    onboardingChecklistView: ChecklistViewState.Hidden,
  };

  const defaultBootData: actual.BootCacheData = {
    alerts: defaultAlerts,
    user: defaultUser,
    settings: defaultSettings,
    squads: [],
    notifications: { unreadNotificationsCount: 0 },
    feeds: [],
  };

  const getBootMock = (bootMock: actual.BootCacheData): actual.Boot => ({
    ...bootMock,
    accessToken: { token: '1', expiresIn: '1' },
    visit: { sessionId: '1', visitId: '1' },
    feeds: [],
  });
  return getBootMock(defaultBootData);
};

export * from '@dailydotdev/shared/src/lib/boot';
