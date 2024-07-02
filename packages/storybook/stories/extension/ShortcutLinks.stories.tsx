import type { Meta, StoryObj } from '@storybook/react';
import ShortcutLinks from 'extension/src/newtab/ShortcutLinks';
import ExtensionProviders from './_providers';
import { Boot, BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import { RemoteSettings } from '@dailydotdev/shared/src/graphql/settings';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import { http, HttpResponse } from 'msw';

const meta: Meta<typeof ShortcutLinks> = {
  title: 'Extension/ShortcutLinks',
  component: ShortcutLinks,
  args: {
    shouldUseListFeedLayout: true,
  },
  render: (args) => {
    return (
      <ExtensionProviders><ShortcutLinks {...args} /></ExtensionProviders>
    );
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutLinks>;

export const ListFeedLayout: Story = {
  args: {
    shouldUseListFeedLayout: true,
  },
  parameters: {
    msw: {
      handlers: [
        http.get('http://localhost:6006/api/boot?v=undefined', async () => {
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

          const defaultBootData: BootCacheData = {
            alerts: defaultAlerts,
            user: defaultUser,
            settings: defaultSettings,
            squads: [],
            notifications: { unreadNotificationsCount: 0 },
            feeds: [],
          };

          const getBootMock = (bootMock: BootCacheData): Boot => ({
            ...bootMock,
            accessToken: { token: '1', expiresIn: '1' },
            visit: { sessionId: '1', visitId: '1' },
            feeds: [],
          });

          return HttpResponse.json(getBootMock(defaultBootData));
        }),
      ],
    },
  },
};


export const GridFeedLayout: Story = {
  ...ListFeedLayout,
  args: {
    shouldUseListFeedLayout: false,
  },
};
