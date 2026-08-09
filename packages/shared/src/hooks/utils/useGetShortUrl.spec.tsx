import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { ReferralCampaignKey } from '../../lib/referral';
import { useGetShortUrl } from './useGetShortUrl';

const renderShortUrl = () =>
  renderHook(() => useGetShortUrl(), {
    wrapper: ({ children }) => (
      <TestBootProvider client={new QueryClient()} auth={{ user: defaultUser }}>
        {children}
      </TestBootProvider>
    ),
  });

beforeEach(() => {
  nock.cleanAll();
});

/**
 * Every share in the app goes through here. The fallback below was written and
 * never ran: the query was returned from inside its own `try`, so the rejection
 * left before the `catch` could see it — a shortener that was down took the
 * whole share with it, as an unhandled rejection and a button that did nothing.
 */
describe('useGetShortUrl when the shortener is unreachable', () => {
  it('falls back to the tracked url rather than rejecting', async () => {
    const { result } = renderShortUrl();

    await waitFor(() => expect(result.current.getShortUrl).toBeDefined());

    const link = await result.current.getShortUrl(
      'https://app.daily.dev/agent?q=Rust',
      ReferralCampaignKey.ShareAgent,
    );

    // The referral params are still on it — the share is unshortened, not lost.
    const { searchParams } = new URL(link);

    expect(searchParams.get('cid')).toBe(ReferralCampaignKey.ShareAgent);
    expect(searchParams.get('userid')).toBe(defaultUser.id);
  });
});
