import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { BOOT_QUERY_KEY } from '../contexts/common';
import type { MarketingCta } from '../components/marketing/cta/common';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useMarketingCtas } from './useMarketingCtas';

const variant = MarketingCtaVariant.FeedBanner;

const androidCta: MarketingCta = {
  campaignId: 'android-campaign',
  createdAt: new Date(),
  variant,
  flags: { title: 'Android only', ctaUrl: '/', ctaText: 'Open' },
  targets: { webapp: false, extension: false, ios: false, android: true },
};

const renderUseMarketingCtas = (isAndroidApp: boolean) => {
  const client = new QueryClient();
  client.setQueryData(BOOT_QUERY_KEY, { marketingCtaVariants: [variant] });
  client.setQueryData(
    generateQueryKey(RequestKey.MarketingCtas, defaultUser, variant),
    [androidCta],
  );

  return renderHook(() => useMarketingCtas(variant), {
    wrapper: ({ children }) => (
      <TestBootProvider
        client={client}
        auth={{ user: defaultUser, isAndroidApp }}
      >
        {children}
      </TestBootProvider>
    ),
  });
};

describe('useMarketingCtas', () => {
  it('keeps an Android-targeted CTA when running as the Android app', () => {
    const { result } = renderUseMarketingCtas(true);

    expect(result.current.marketingCtas).toEqual([androidCta]);
  });

  it('drops an Android-targeted CTA on the webapp', () => {
    const { result } = renderUseMarketingCtas(false);

    expect(result.current.marketingCtas).toEqual([]);
  });
});
