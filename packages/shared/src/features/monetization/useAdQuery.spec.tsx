import type { ReactNode } from 'react';
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as ads from '../../lib/ads';
import { useAdQuery } from './useAdQuery';
import { useAdPageViewId } from './useAdPageViewId';
import { useAdRequestConsent } from './useAdRequestConsent';

jest.mock('./useAdPageViewId');
jest.mock('./useAdRequestConsent');
jest.mock('../../components/GrowthBookProvider', () => ({
  useFeature: () => false,
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({ isAuthReady: true, isLoggedIn: true }),
}));

let client: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  jest.clearAllMocks();
  jest.mocked(useAdRequestConsent).mockReturnValue({ gdprApplies: false });
  jest.spyOn(ads, 'fetchAdByPlacement').mockResolvedValue(null);
});

const renderAdQuery = (refreshOnPageView?: boolean) =>
  renderHook(
    () =>
      useAdQuery({
        queryKey: ['test-ad'],
        placement: ads.AdPlacement.Feed,
        staleTime: 60 * 60 * 1000,
        refreshOnPageView,
      }),
    { wrapper },
  );

const flush = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

it('keeps a persistent ad when the page view changes', async () => {
  jest.mocked(useAdPageViewId).mockReturnValue('page-view-1');
  const { rerender } = renderAdQuery();
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledWith(
    expect.objectContaining({ pageViewId: 'page-view-1' }),
  );

  // e.g. clicking a post pushes /posts/... and starts a new page view
  jest.mocked(useAdPageViewId).mockReturnValue('page-view-2');
  rerender();

  await flush();
  expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1);
});

it('fetches a fresh page-owned ad on every page view', async () => {
  jest.mocked(useAdPageViewId).mockReturnValue('page-view-1');
  const { rerender } = renderAdQuery(true);
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));

  jest.mocked(useAdPageViewId).mockReturnValue('page-view-2');
  rerender();

  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(2));
  expect(ads.fetchAdByPlacement).toHaveBeenLastCalledWith(
    expect.objectContaining({ pageViewId: 'page-view-2' }),
  );
});
