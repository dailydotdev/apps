import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import nock from 'nock';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import { ReferralCampaignKey } from '../../lib/referral';
import { gqlClient } from '../../graphql/common';
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

describe('useGetShortUrl when the shortener is unreachable', () => {
  it('falls back to the tracked url rather than rejecting', async () => {
    const { result } = renderShortUrl();

    await waitFor(() => expect(result.current.getShortUrl).toBeDefined());

    const link = await result.current.getShortUrl(
      'https://app.daily.dev/agent?q=Rust',
      ReferralCampaignKey.ShareAgent,
    );

    const { searchParams } = new URL(link);

    expect(searchParams.get('cid')).toBe(ReferralCampaignKey.ShareAgent);
    expect(searchParams.get('userid')).toBe(defaultUser.id);
  });

  it('gives up waiting on a shortener that never answers', async () => {
    jest
      .spyOn(gqlClient, 'request')
      .mockImplementation(() => new Promise(() => undefined));

    const { result } = renderShortUrl();

    await waitFor(() => expect(result.current.getShortUrl).toBeDefined());

    const link = await result.current.getShortUrl(
      'https://app.daily.dev/agent?q=Rust',
      ReferralCampaignKey.ShareAgent,
    );

    expect(new URL(link).searchParams.get('cid')).toBe(
      ReferralCampaignKey.ShareAgent,
    );
  }, 10000);
});
