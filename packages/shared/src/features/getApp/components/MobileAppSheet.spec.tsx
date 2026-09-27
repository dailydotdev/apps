import type { ReactElement } from 'react';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { get as getCache, set as setCache } from 'idb-keyval';
import type { AuthContextData } from '../../../contexts/AuthContext';
import AuthContext from '../../../contexts/AuthContext';
import { getLogContextStatic } from '../../../contexts/LogContext';
import type { LogContextData } from '../../../hooks/log/useLogContextData';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { PersistentContextKeys } from '../../../hooks/usePersistentContext';
import { useViewSize } from '../../../hooks/useViewSize';
import { isIOSNative } from '../../../lib/func';
import { MobileAppSheet, openAppFromSheetUrl } from './MobileAppSheet';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

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

const mockRouter = jest.mocked(useRouter);
const mockFeature = jest.mocked(useConditionalFeature);
const mockIsTablet = jest.mocked(useViewSize);
const mockIsIOSNative = jest.mocked(isIOSNative);

const LogContext = getLogContextStatic();
const day = 24 * 60 * 60 * 1000;
const title = 'See daily.dev in…';

let client: QueryClient;

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

const visit = (asPath: string) =>
  mockRouter.mockReturnValue({ asPath } as NextRouter);

const renderSecondPageView = (auth?: Partial<AuthContextData>) => {
  visit('/posts');
  const view = render(sheet(auth));
  visit('/posts/abc');
  view.rerender(sheet(auth));
  return view;
};

beforeEach(async () => {
  jest.clearAllMocks();
  sessionStorage.clear();
  await setCache(PersistentContextKeys.MobileAppSheet, undefined);
  client = new QueryClient();
  mockFeature.mockReturnValue({ value: true, isLoading: false });
  mockIsTablet.mockReturnValue(false);
  mockIsIOSNative.mockReturnValue(false);
});

describe('MobileAppSheet', () => {
  it('should wait for the second page view of the session', async () => {
    visit('/posts');
    const { rerender } = render(sheet());

    await waitFor(() =>
      expect(mockFeature).toHaveBeenLastCalledWith(
        expect.objectContaining({ shouldEvaluate: false }),
      ),
    );
    expect(screen.queryByText(title)).not.toBeInTheDocument();

    visit('/posts/abc');
    rerender(sheet());

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      openAppFromSheetUrl,
    );
  });

  it('should remember Continue so the sheet stays away', async () => {
    renderSecondPageView();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Continue' }),
    );

    await waitFor(() =>
      expect(screen.queryByText(title)).not.toBeInTheDocument(),
    );
    expect(await getCache(PersistentContextKeys.MobileAppSheet)).toMatchObject({
      continues: 1,
    });
  });

  it.each([
    ['7 days after a Continue', 6, 1],
    ['90 days after the third Continue', 60, 3],
  ])('should stay hidden %s', async (_, daysAgo, continues) => {
    await setCache(PersistentContextKeys.MobileAppSheet, {
      dismissedAt: Date.now() - daysAgo * day,
      continues,
    });
    renderSecondPageView();

    await waitFor(() =>
      expect(mockFeature).toHaveBeenLastCalledWith(
        expect.objectContaining({ shouldEvaluate: false }),
      ),
    );
    expect(screen.queryByText(title)).not.toBeInTheDocument();
  });

  it('should come back once the 7 days are over', async () => {
    await setCache(PersistentContextKeys.MobileAppSheet, {
      dismissedAt: Date.now() - 8 * day,
      continues: 1,
    });
    renderSecondPageView();

    expect(await screen.findByText(title)).toBeInTheDocument();
  });

  it('should never ask logged-out readers', async () => {
    renderSecondPageView({ isLoggedIn: false });

    await waitFor(() =>
      expect(mockFeature).toHaveBeenLastCalledWith(
        expect.objectContaining({ shouldEvaluate: false }),
      ),
    );
    expect(screen.queryByText(title)).not.toBeInTheDocument();
  });
});
