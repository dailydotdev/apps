import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import defaultUser from '../../__tests__/fixture/loggedUser';
import { BOOT_QUERY_KEY } from '../contexts/common';
import type { MarketingCta } from '../components/marketing/cta/common';
import { MarketingCtaVariant } from '../components/marketing/cta/common';
import { useBoot } from './useBoot';

const androidCta: MarketingCta = {
  campaignId: 'android-campaign',
  createdAt: new Date(),
  variant: MarketingCtaVariant.Card,
  flags: { title: 'Android only', ctaUrl: '/', ctaText: 'Open' },
  targets: { webapp: false, extension: false, ios: false, android: true },
};

const renderUseBoot = (isAndroidApp: boolean) => {
  const client = new QueryClient();
  // The /boot response never carries isAndroidApp, only the client knows it
  client.setQueryData(BOOT_QUERY_KEY, { marketingCta: androidCta });

  return renderHook(() => useBoot(), {
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

describe('useBoot getMarketingCta', () => {
  it('resolves an Android-targeted CTA when running as the Android app', () => {
    const { result } = renderUseBoot(true);

    expect(result.current.getMarketingCta(MarketingCtaVariant.Card)).toEqual(
      androidCta,
    );
  });

  it('hides an Android-targeted CTA on the webapp', () => {
    const { result } = renderUseBoot(false);

    expect(result.current.getMarketingCta(MarketingCtaVariant.Card)).toBeNull();
  });
});
