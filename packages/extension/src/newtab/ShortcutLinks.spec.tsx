import React, { act } from 'react';
import nock from 'nock';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import {
  Boot,
  BootApp,
  BootCacheData,
  getBootData,
} from '@dailydotdev/shared/src/lib/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
} from '@dailydotdev/shared/src/graphql/settings';
import { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import browser, { TopSites } from 'webextension-polyfill';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import { ChecklistViewState } from '@dailydotdev/shared/src/lib/checklist';
import ShortcutLinks from './ShortcutLinks';

jest.mock('@dailydotdev/shared/src/lib/boot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@dailydotdev/shared/src/lib/boot') as any),
  getBootData: jest.fn(),
}));

jest.mock('webextension-polyfill', () => {
  let providedPermission = false;

  return {
    permissions: {
      remove: jest.fn(),
      request: () =>
        new Promise((resolve) => {
          providedPermission = true;
          resolve(true);
        }),
    },
    topSites: {
      get: () =>
        new Promise((resolve, reject): TopSites.MostVisitedURL[] | void => {
          if (!providedPermission) {
            return reject();
          }

          providedPermission = false;
          return resolve([
            { url: 'http://abc1.com' },
            { url: 'http://abc2.com' },
            { url: 'http://abc3.com' },
          ]);
        }),
    },
  };
});

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultAlerts: Alerts = { filter: true, rankLastSeen: null };

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
  ],
  onboardingChecklistView: ChecklistViewState.Hidden,
};

const defaultBootData: BootCacheData = {
  alerts: defaultAlerts,
  user: { ...defaultUser, createdAt: '2024-02-16T00:00:00.000Z' },
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

const logEvent = jest.fn();

const renderComponent = (bootData = defaultBootData): RenderResult => {
  const queryClient = new QueryClient();
  const app = BootApp.Extension;
  mocked(getBootData).mockResolvedValue(getBootMock(bootData));
  return render(
    <QueryClientProvider client={queryClient}>
      <BootDataProvider
        app={app}
        getRedirectUri={jest.fn()}
        version="pwa"
        deviceId="123"
        getPage={jest.fn()}
      >
        <LogContext.Provider
          value={{
            logEvent,
            logEventStart: jest.fn(),
            logEventEnd: jest.fn(),
            sendBeacon: jest.fn(),
          }}
        >
          <ShortcutLinks shouldUseListFeedLayout={false} />
        </LogContext.Provider>
      </BootDataProvider>
    </QueryClientProvider>,
  );
};

describe('shortcut links component', () => {
  it('should not display add shortcuts if settings is disabled', async () => {
    renderComponent({
      ...defaultBootData,
      settings: { ...defaultSettings, showTopSites: false },
    });

    await waitForElementToBeRemoved(() => screen.queryByText('Add shortcuts'));
  });

  it('should display add shortcuts if settings is enabled', async () => {
    renderComponent();

    await act(async () => {
      const addShortcuts = await screen.findByText('Add shortcuts');
      expect(addShortcuts).toBeVisible();
    });

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });
  });

  it('should display top sites if permission is previously granted', async () => {
    await browser.permissions.request({ permissions: ['topSites'] });
    renderComponent({
      ...defaultBootData,
      settings: { ...defaultBootData.settings, customLinks: null },
    });

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(3);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Browser }),
    });
  });

  it('should display top sites if permission is manually granted', async () => {
    renderComponent({
      ...defaultBootData,
      user: {
        id: 'string',
        firstVisit: 'string',
        referrer: 'string',
      },
      settings: { ...defaultSettings, customLinks: [] },
    });

    const addShortcuts = await screen.findByText('Add shortcuts');
    fireEvent.click(addShortcuts);

    const mostVisitedSites = await screen.findByText('Most visited sites');
    expect(mostVisitedSites).toBeVisible();
    fireEvent.click(mostVisitedSites);

    const title = await screen.findByText('Show most visited sites');
    expect(title).toBeVisible();

    const inputs = await screen.findAllByRole('textbox');
    expect(inputs.length).toEqual(8);

    inputs.forEach((input) => {
      expect(input).toHaveAttribute('readonly');
    });

    const next = await screen.findByText('Add the shortcuts');
    fireEvent.click(next);

    const saveChanges = await screen.findByText('Save changes');
    fireEvent.click(saveChanges);

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(3);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SaveShortcutAccess,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Browser }),
    });
  });

  it('should be able to remove permission', async () => {
    await browser.permissions.request({ permissions: ['topSites'] });
    renderComponent({
      ...defaultBootData,
      settings: { ...defaultSettings, customLinks: [] },
      user: {
        id: 'string',
        firstVisit: 'string',
        referrer: 'string',
      },
    });

    const edit = await screen.findByLabelText('Edit shortcuts');
    fireEvent.click(edit);

    const remove = await screen.findByText('Revoke access');
    expect(remove).toBeVisible();
    fireEvent.click(remove);

    const addShortcuts = await screen.findByText('Add shortcuts');
    expect(addShortcuts).toBeVisible();

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.RevokeShortcutAccess,
      target_type: TargetType.Shortcuts,
    });
  });

  it('should display custom shortcut links', async () => {
    renderComponent();

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(4);
  });

  it('should allow user to customize shortcut links', async () => {
    const additional = 'http://custom6.com';
    const expected = [...defaultSettings.customLinks, additional];

    let mutationCalled = false;
    mockGraphQL({
      request: {
        query: UPDATE_USER_SETTINGS_MUTATION,
        variables: { data: { ...defaultSettings, customLinks: expected } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
      },
    });

    renderComponent();

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(4);

    const edit = await screen.findByLabelText('Edit shortcuts');
    fireEvent.click(edit);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.OpenShortcutConfig,
      target_type: TargetType.Shortcuts,
    });

    const instruction = screen.queryByText(
      'To edit links, please switch to "My shortcuts" mode',
    );
    expect(instruction).not.toBeInTheDocument();

    const inputs = await screen.findAllByRole('textbox');
    expect(inputs.length).toEqual(8);

    inputs.forEach((input) => {
      expect(input).toBeEnabled();
    });

    const sixthInput = inputs[5] as HTMLInputElement;
    fireEvent.input(sixthInput, {
      target: { value: additional },
    });

    const saveChanges = await screen.findByText('Save changes');
    expect(saveChanges).toBeVisible();

    fireEvent.click(saveChanges);
    await waitForNock();
    expect(mutationCalled).toBeTruthy();

    const updated = await screen.findAllByRole('link');
    expect(updated.length).toEqual(5);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SaveShortcutAccess,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });
  });

  it('should log click event for individual shortcuts', async () => {
    renderComponent();

    const shortcutLink = await screen.findByAltText('http://custom1.com');

    fireEvent.click(shortcutLink);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Custom }),
    });
  });
});
