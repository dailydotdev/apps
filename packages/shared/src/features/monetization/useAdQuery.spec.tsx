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

it('does not refetch the ad when the page view changes', async () => {
  jest.mocked(useAdPageViewId).mockReturnValue('page-view-1');
  const { rerender } = renderHook(
    () =>
      useAdQuery({
        queryKey: ['test-ad'],
        placement: ads.AdPlacement.Feed,
        staleTime: 60 * 60 * 1000,
      }),
    { wrapper },
  );
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledWith(
    expect.objectContaining({ pageViewId: 'page-view-1' }),
  );

  // e.g. clicking a post pushes /posts/... and starts a new page view
  jest.mocked(useAdPageViewId).mockReturnValue('page-view-2');
  rerender();

  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  });
  expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1);
});
