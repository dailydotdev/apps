import React from 'react';
import nock from 'nock';
import { BootDataProvider } from '@dailydotdev/shared/src/contexts/BootProvider';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/preact';
import { mocked } from 'ts-jest/utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { act } from 'preact/test-utils';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import {
  Boot,
  BootCacheData,
  getBootData,
} from '@dailydotdev/shared/src/lib/boot';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  RemoteSettings,
  UPDATE_USER_SETTINGS_MUTATION,
} from '@dailydotdev/shared/src/graphql/settings';
import { Alerts } from '@dailydotdev/shared/src/graphql/alerts';
import { FeaturesData } from '@dailydotdev/shared/src/contexts/FeaturesContext';
import { browser, TopSites } from 'webextension-polyfill-ts';
import ShortcutLinks from './ShortcutLinks';

jest.mock('@dailydotdev/shared/src/lib/boot', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...(jest.requireActual('@dailydotdev/shared/src/lib/boot') as any),
  getBootData: jest.fn(),
}));

jest.mock('webextension-polyfill-ts', () => {
  let providedPermission = false;

  return {
    browser: {
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
    },
  };
});

let features: FeaturesData;

beforeEach(() => {
  nock.cleanAll();
  features = { flags: {} };
});

const defaultAlerts: Alerts = { filter: true, rankLastSeen: null };

const defaultSettings: RemoteSettings = {
  theme: 'bright',
  openNewTab: false,
  showOnlyUnreadPosts: true,
  spaciness: 'roomy',
  insaneMode: false,
  showTopSites: true,
  sidebarExpanded: true,
  companionExpanded: false,
  sortingEnabled: false,
  optOutWeeklyGoal: true,
  optOutCompanion: true,
  autoDismissNotifications: true,
  customLinks: [
    'http://custom1.com',
    'http://custom2.com',
    'http://custom3.com',
    'http://custom4.com',
    'http://custom5.com',
  ],
};

const defaultBootData: BootCacheData = {
  alerts: defaultAlerts,
  user: defaultUser,
  settings: defaultSettings,
  flags: {},
};

const getBootMock = (bootMock: BootCacheData): Boot => ({
  ...bootMock,
  accessToken: { token: '1', expiresIn: '1' },
  visit: { sessionId: '1', visitId: '1' },
  flags: features.flags,
});

const renderComponent = (bootData = defaultBootData): RenderResult => {
  const queryClient = new QueryClient();
  const app = 'extension';
  mocked(getBootData).mockResolvedValue(getBootMock(bootData));
  return render(
    <QueryClientProvider client={queryClient}>
      <BootDataProvider app={app} getRedirectUri={jest.fn()}>
        <ShortcutLinks />
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

    act(async () => {
      const addShortcuts = await screen.findByText('Add shortcuts');
      expect(addShortcuts).toBeVisible();
    });
  });

  it('should display top sites if permission is previously granted', async () => {
    await browser.permissions.request({ permissions: ['topSites'] });
    renderComponent();

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(3);
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

    const next = await screen.findByText('Next');
    fireEvent.click(next);

    const saveChanges = await screen.findByText('Save changes');
    fireEvent.click(saveChanges);

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(3);
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
  });

  it('should display custom shortcut links', async () => {
    renderComponent();

    const shortcuts = await screen.findAllByRole('link');
    expect(shortcuts.length).toEqual(5);
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
    expect(shortcuts.length).toEqual(5);

    const edit = await screen.findByLabelText('Edit shortcuts');
    fireEvent.click(edit);

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
    expect(updated.length).toEqual(6);
  });
});
