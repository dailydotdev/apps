import type { ReactElement } from 'react';
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get as getCache, set as setCache } from 'idb-keyval';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { PersistentContextKeys } from '../../../hooks/usePersistentContext';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative, isPWA } from '../../../lib/func';
import {
  featureMobileAppSheet,
  featureMobileAppSheetSnoozeHours,
} from '../../../lib/featureManagement';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import { MobileAppSheet, openAppFromSheetUrl } from './MobileAppSheet';
import {
  consentBannerGraceMs,
  consentScriptTimeoutMs,
} from '../hooks/useMobileAppSheet';

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
  isPWA: jest.fn(),
}));

const mockFeature = jest.mocked(useConditionalFeature);
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);
const mockIsPWA = jest.mocked(isPWA);
const logEvent = jest.fn();

const LogContext = getLogContextStatic();
const hour = 60 * 60 * 1000;
const registeredHoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * hour).toISOString();

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
          user: { createdAt: registeredHoursAgo(24 * 30) },
          ...auth,
        } as unknown as AuthContextData
      }
    >
      <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
        <MobileAppSheet />
      </LogContext.Provider>
    </AuthContext.Provider>
  </QueryClientProvider>
);

const dismissedHoursAgo = (hours: number) =>
  setCache(PersistentContextKeys.MobileAppSheet, {
    dismissedAt: Date.now() - hours * hour,
  });

const declined = (origin: string) => ({
  event_name: LogEvent.Dismiss,
  target_type: TargetType.GetAppButton,
  target_id: TargetId.MobileSheet,
  extra: JSON.stringify({ origin }),
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
  document.cookie = `${GdprConsentKey.Necessary}=true`;
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
  mockIsPWA.mockReturnValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  document.getElementById('iubenda-cs-banner')?.remove();
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

  it('should log Continue as a decline', async () => {
    render(sheet());

    await userEvent.click(await screen.findByText('Continue'));

    await waitFor(() =>
      expect(screen.queryByText(title)).not.toBeInTheDocument(),
    );
    expect(logEvent).toHaveBeenCalledWith(declined('continue'));
    expect(logEvent).not.toHaveBeenCalledWith(declined('close'));
  });

  it('should log closing the sheet apart from Continue', async () => {
    render(sheet());
    await screen.findByText(title);

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByText(title)).not.toBeInTheDocument(),
    );
    expect(logEvent).toHaveBeenCalledWith(declined('close'));
    expect(logEvent).not.toHaveBeenCalledWith(declined('continue'));
  });

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

  it('should never ask inside an installed PWA', async () => {
    mockIsPWA.mockReturnValue(true);
    render(sheet());

    await expectNoSheet();
  });

  it('should wait for the consent banner to be answered', async () => {
    document.cookie = `${GdprConsentKey.Necessary}=; max-age=0`;
    render(sheet());

    await expectNoSheet();

    act(() => {
      client.setQueryData(['cookie', GdprConsentKey.Necessary], true);
    });

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it('should ask after a grace period when no consent banner is up', async () => {
    jest.useFakeTimers({
      doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'],
    });
    document.cookie = `${GdprConsentKey.Necessary}=; max-age=0`;
    render(sheet());

    act(() => {
      jest.advanceTimersByTime(consentBannerGraceMs);
    });
    jest.useRealTimers();

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it('should keep waiting while the consent banner is up', async () => {
    jest.useFakeTimers({
      doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'],
    });
    document.cookie = `${GdprConsentKey.Necessary}=; max-age=0`;
    const banner = document.createElement('div');
    banner.id = 'iubenda-cs-banner';
    banner.className = 'iubenda-cs-visible';
    document.body.appendChild(banner);
    render(sheet());

    act(() => {
      jest.advanceTimersByTime(consentBannerGraceMs);
    });
    jest.useRealTimers();

    await expectNoSheet();
  });

  it('should hold the sheet when the consent banner comes up late', async () => {
    jest.useFakeTimers({
      doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'],
    });
    document.cookie = `${GdprConsentKey.Necessary}=; max-age=0`;
    render(sheet());

    act(() => {
      jest.advanceTimersByTime(consentBannerGraceMs);
    });
    const banner = document.createElement('div');
    banner.id = 'iubenda-cs-banner';
    banner.className = 'iubenda-cs-visible';
    document.body.appendChild(banner);
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    jest.useRealTimers();

    await expectNoSheet();
  });

  it('should stop polling for a banner once the consent script never loaded', () => {
    jest.useFakeTimers({
      doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask'],
    });
    document.cookie = `${GdprConsentKey.Necessary}=; max-age=0`;
    const querySelector = jest.spyOn(document, 'querySelector');
    render(sheet());

    act(() => {
      jest.advanceTimersByTime(consentScriptTimeoutMs);
    });
    const callsAtTimeout = querySelector.mock.calls.length;
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(querySelector.mock.calls.length).toBe(callsAtTimeout);
    querySelector.mockRestore();
    jest.useRealTimers();
  });

  it('should never ask logged-out readers', async () => {
    render(sheet({ isLoggedIn: false }));

    await expectNoSheet();
  });

  it('should not ask an account registered under 12 hours ago', async () => {
    render(sheet({ user: { createdAt: registeredHoursAgo(11) } as never }));

    await expect(
      screen.findByText(title, undefined, { timeout: 300 }),
    ).rejects.toThrow();
    expect(mockFeature).not.toHaveBeenCalledWith(
      expect.objectContaining({
        feature: featureMobileAppSheet,
        shouldEvaluate: true,
      }),
    );
  });

  it('should ask once the account is 12 hours old', async () => {
    render(sheet({ user: { createdAt: registeredHoursAgo(13) } as never }));

    expect(await screen.findByText(title)).toBeInTheDocument();
  });
});
