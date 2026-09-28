import type { ReactElement } from 'react';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get as getCache, set as setCache } from 'idb-keyval';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { PersistentContextKeys } from '../../../hooks/usePersistentContext';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative } from '../../../lib/func';
import {
  featureMobileAppSheet,
  featureMobileAppSheetSnoozeHours,
} from '../../../lib/featureManagement';
import { MobileAppSheet, openAppFromSheetUrl } from './MobileAppSheet';

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: jest.fn(),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);

const LogContext = getLogContextStatic();
const hour = 60 * 60 * 1000;
const title = 'See daily.dev in…';

let client: QueryClient;
let snoozeHours: number;

const sheet = (auth: Partial<AuthContextData> = {}): ReactElement => (
  <QueryClientProvider client={client}>
    <AuthContext.Provider
      value={
        {
          isAuthReady: true,
          isLoggedIn: true,
          isAndroidApp: false,
          ...auth,
        } as unknown as AuthContextData
      }
    >
      <LogContext.Provider
        value={{ logEvent: jest.fn() } as unknown as LogContextData}
      >
        <MobileAppSheet />
      </LogContext.Provider>
    </AuthContext.Provider>
  </QueryClientProvider>
);

const dismissedHoursAgo = (hours: number) =>
  setCache(PersistentContextKeys.MobileAppSheet, {
    dismissedAt: Date.now() - hours * hour,
  });

const expectNoSheet = async () => {
  await waitFor(() =>
    expect(mockFeature).toHaveBeenLastCalledWith(
      expect.objectContaining({
        feature: featureMobileAppSheet,
        shouldEvaluate: false,
      }),
    ),
  );
  expect(screen.queryByText(title)).not.toBeInTheDocument();
};

beforeEach(async () => {
  jest.clearAllMocks();
  await setCache(PersistentContextKeys.MobileAppSheet, undefined);
  client = new QueryClient();
  snoozeHours = 72;
  mockFeature.mockImplementation(({ feature }) => ({
    value: (feature === featureMobileAppSheetSnoozeHours
      ? snoozeHours
      : true) as never,
    isLoading: false,
  }));
  mockIsTablet.mockReturnValue(false);
  mockIsIOSNative.mockReturnValue(false);
});

describe('MobileAppSheet', () => {
  it('should ask on the first page view', async () => {
    render(sheet());

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      openAppFromSheetUrl,
    );
  });

  it.each(['Continue', 'Open'])(
    'should remember %s so the sheet stays away',
    async (choice) => {
      render(sheet());
      const button = await screen.findByText(choice);
      button.addEventListener('click', (event) => event.preventDefault());

      await userEvent.click(button);

      await waitFor(() =>
        expect(screen.queryByText(title)).not.toBeInTheDocument(),
      );
      expect(
        await getCache(PersistentContextKeys.MobileAppSheet),
      ).toMatchObject({ dismissedAt: expect.any(Number) });
    },
  );

  it('should stay away inside the snooze window', async () => {
    await dismissedHoursAgo(71);
    render(sheet());

    await expectNoSheet();
  });

  it('should ask again once the snooze window is over', async () => {
    await dismissedHoursAgo(73);
    render(sheet());

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it('should take the snooze window from GrowthBook', async () => {
    snoozeHours = 24;
    await dismissedHoursAgo(25);
    render(sheet());

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it('should never ask logged-out readers', async () => {
    render(sheet({ isLoggedIn: false }));

    await expectNoSheet();
  });
});
