import React from 'react';
import nock from 'nock';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import type { Boot, BootCacheData } from '@dailydotdev/shared/src/lib/boot';
import { BootApp, getBootData } from '@dailydotdev/shared/src/lib/boot';
import type { RemoteSettings } from '@dailydotdev/shared/src/graphql/settings';
import { UPDATE_USER_SETTINGS_MUTATION } from '@dailydotdev/shared/src/graphql/settings';
import type { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import type { TopSites } from 'webextension-polyfill';
import browser from 'webextension-polyfill';
import {
  LogEvent,
  ShortcutsSourceType,
  TargetType,
} from '@dailydotdev/shared/src/lib/log';
import * as actionHook from '@dailydotdev/shared/src/hooks/useActions';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import * as libFuncs from '@dailydotdev/shared/src/lib/func';
import { SortCommentsBy } from '@dailydotdev/shared/src/graphql/comments';
import { ShortcutsProvider } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import { LazyModalElement } from '@dailydotdev/shared/src/components/modals/LazyModalElement';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import ShortcutLinks from './ShortcutLinks';

const LogContext = getLogContextStatic();

jest.mock('@dailydotdev/shared/src/lib/boot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@dailydotdev/shared/src/lib/boot') as any),
  getBootData: jest.fn(),
}));

// Pin these tests to the legacy code path. The shortcuts hub redesign is
// default-on in production; the suite below exercises the legacy UI that the
// hub is replacing behind the feature flag.
jest.mock('@dailydotdev/shared/src/hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => ({ value: false, isLoading: false }),
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

const mockGetBootData = getBootData as jest.MockedFunction<typeof getBootData>;

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultAlerts: Alerts = { filter: true, rankLastSeen: undefined };

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
  optOutLevelSystem: false,
  optOutQuestSystem: false,
  optOutCompanion: true,
  autoDismissNotifications: true,
  sortCommentsBy: SortCommentsBy.NewestFirst,
  showFeedbackButton: true,
  customLinks: [
    'http://custom1.com',
    'http://custom2.com',
    'http://custom3.com',
    'http://custom4.com',
  ],
};

const defaultBootData: BootCacheData = {
  exp: undefined,
  postData: undefined,
  alerts: defaultAlerts,
  user: { ...loggedUser, createdAt: '2024-08-16T00:00:00.000Z' },
  settings: defaultSettings,
  squads: [],
  notifications: { unreadNotificationsCount: 0 },
  feeds: [],
  geo: { ip: '192.168.1.1', region: 'EU' },
};

const getBootMock = (bootMock: BootCacheData): Boot => ({
  ...bootMock,
  accessToken: { token: '1', expiresIn: '1' },
  visit: { sessionId: '1', visitId: '1' },
  feeds: [],
});

const logEvent = jest.fn();

const checkHasCompleted = jest.fn();
const completeAction = jest.fn();
jest.spyOn(actionHook, 'useActions').mockReturnValue({
  completeAction,
  checkHasCompleted,
  isActionsFetched: true,
  actions: [],
});
jest.spyOn(libFuncs, 'checkIsExtension').mockReturnValue(true);

const renderComponent = (bootData = defaultBootData): RenderResult => {
  const queryClient = new QueryClient();
  const app = BootApp.Extension;
  mockGetBootData.mockResolvedValue(getBootMock(bootData));
  return render(
    <div id="__next">
      <QueryClientProvider client={queryClient}>
        <BootDataProvider
          app={app}
          getRedirectUri={jest.fn()}
          version="pwa"
          deviceId="123"
          getPage={jest.fn()}
          localBootData={bootData}
        >
          <LogContext.Provider
            value={{
              logEvent,
              logEventStart: jest.fn(),
              logEventEnd: jest.fn(),
              sendBeacon: jest.fn(),
            }}
          >
            <ShortcutsProvider>
              <ShortcutLinks shouldUseListFeedLayout={false} />
              <LazyModalElement />
            </ShortcutsProvider>
          </LogContext.Provider>
        </BootDataProvider>
      </QueryClientProvider>
    </div>,
  );
};

describe('shortcut links component', () => {
  it('should not display add shortcuts if settings is disabled', async () => {
    renderComponent({
      ...defaultBootData,
      settings: { ...defaultSettings, showTopSites: false },
    });

    expect(screen.queryByText('Add shortcuts')).not.toBeInTheDocument();
  });

  // Note: the legacy "Add shortcuts" / "Choose your most visited sites"
  // onboarding card is no longer rendered inside ShortcutLinks — it now
  // lives in ExtensionTopBanners alongside the reading-reminder and
  // upload-CV cards. The previous tests asserting that copy from this
  // component have been removed; the onboarding card is covered by the
  // top-banners surface.

  it('should display top sites if permission is previously granted', async () => {
    await act(async () => {
      await browser.permissions.request({ permissions: ['topSites'] });
      renderComponent({
        ...defaultBootData,
        settings: {
          ...defaultBootData.settings,
          customLinks: undefined,
        },
      });
    });

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(3);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_type: TargetType.Shortcuts,
      extra: JSON.stringify({ source: ShortcutsSourceType.Browser }),
    });
  });

  // Note: the previous "manually granted" flow drove the permissions
  // modal via the inline "Add shortcuts" CTA. That CTA moved to
  // ExtensionTopBanners, so the integration test is covered there now.

  it('should display custom shortcut links', async () => {
    renderComponent();

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(4);
  });

  it('should allow user to customize shortcut links', async () => {
    const additional = 'http://custom6.com';
    const expected = [...(defaultSettings.customLinks ?? []), additional];

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

    const edit = await screen.findByLabelText('toggle shortcuts menu');
    fireEvent.keyDown(edit, {
      key: ' ',
    });

    const manage = await screen.findByText('Manage');
    fireEvent.click(manage);

    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));

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

    const saveChanges = await screen.findByText('Save');
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

  it('should allow to hide shortcuts', async () => {
    let mutationCalled = false;
    mockGraphQL({
      request: {
        query: UPDATE_USER_SETTINGS_MUTATION,
        variables: { data: { ...defaultSettings, showTopSites: false } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { updateUserSettings: { updatedAt: new Date(0) } } };
      },
    });

    renderComponent();

    const link = await screen.findByAltText('http://custom1.com');

    const toggleMenu = await screen.findByLabelText('toggle shortcuts menu');
    fireEvent.keyDown(toggleMenu, {
      key: ' ',
    });

    const hide = await screen.findByText('Hide');
    fireEvent.click(hide);
    await waitForNock();
    expect(mutationCalled).toBeTruthy();

    await waitFor(() => {
      expect(link).not.toBeInTheDocument();
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

  // Note: the "Choose your most visited sites" getting-started card for
  // new users moved out of ShortcutLinks into ExtensionTopBanners; the
  // visibility test is now owned by that surface.

  it('should hide getting started for old users with no [actions and links]', async () => {
    renderComponent({
      ...defaultBootData,
      user: {
        ...loggedUser,
        createdAt: '2024-06-16T00:00:00.000Z',
      },
      settings: {
        ...defaultSettings,
        customLinks: undefined,
        showTopSites: true,
      },
    });

    expect(
      screen.queryByText('Choose your most visited sites'),
    ).not.toBeInTheDocument();
  });
});
