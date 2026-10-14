import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../../__tests__/helpers/tanstack-query';
import { GdprConsentKey, otherGdprConsents } from '../../hooks/useCookieBanner';
import { useConsentCookie } from '../../hooks/useCookieConsent';
import * as ads from '../../lib/ads';
import * as func from '../../lib/func';
import * as tcf from '../../lib/tcf';
import { AdConsentExists } from './adConsent';
import { useAdRequestConsent } from './useAdRequestConsent';
import { useAdQuery } from './useAdQuery';
import { useFetchAd } from './useFetchAd';
import { useTcfConsent } from './useTcfConsent';
import { PREBID_CMP_TIMEOUT_MS } from './kueez';

jest.mock('./useTcfConsent');
jest.mock('../../lib/func', () => ({
  __esModule: true,
  ...jest.requireActual('../../lib/func'),
  isExtension: false,
}));

let client: QueryClient;
let region: string | undefined;
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider
    client={client}
    auth={{ geo: { region }, isGdprCovered: true }}
  >
    {children}
  </TestBootProvider>
);

const clearCookies = () => {
  document.cookie.split(';').forEach((cookie) => {
    document.cookie = `${cookie.split('=')[0].trim()}=;max-age=0;path=/`;
  });
};

beforeEach(() => {
  client = new QueryClient(defaultQueryClientTestingConfig);
  region = 'PL';
  jest.mocked(useTcfConsent).mockReturnValue(undefined);
  jest.spyOn(tcf, 'hasTcfApi').mockReturnValue(false);
  jest.spyOn(tcf, 'startTcfSubscription').mockImplementation(() => undefined);
  jest.spyOn(ads, 'fetchAdByPlacement').mockResolvedValue(null);
  clearCookies();
});

afterEach(() => {
  client.clear();
  clearCookies();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it.each(['IN', 'BR', 'US', 'IL'])(
  'uses CMP scope for a visitor in %s rather than the broader auth flag',
  (country) => {
    region = country;
    const { result } = renderHook(() => useAdRequestConsent(true), { wrapper });
    expect(result.current).toEqual({
      gdprApplies: false,
      consentString: undefined,
      addtlConsent: undefined,
      consentExists: undefined,
    });
  },
);

it.each(['PL', 'GB', 'CH', undefined])(
  'keeps %s in certified-CMP scope when no TCF snapshot exists',
  (country) => {
    region = country;
    const { result } = renderHook(() => useAdRequestConsent(true), { wrapper });
    expect(result.current?.gdprApplies).toBe(true);
    expect(result.current?.consentExists).toBe(AdConsentExists.None);
  },
);

it('uses the consent pair written by the actual first-party consent flow', async () => {
  const { result } = renderHook(
    () => ({
      ...useConsentCookie(GdprConsentKey.Necessary),
      consent: useAdRequestConsent(true),
    }),
    { wrapper },
  );
  expect(result.current.consent?.consentExists).toBe(AdConsentExists.None);

  act(() => result.current.saveCookies(otherGdprConsents));
  await waitFor(() =>
    expect(result.current.consent?.consentExists).toBe(AdConsentExists.True),
  );

  act(() => result.current.saveCookies([], otherGdprConsents));
  expect(document.cookie).toContain('ilikecookies=true');
  expect(document.cookie).not.toContain('ilikecookies_marketing');
  await waitFor(() =>
    expect(result.current.consent?.consentExists).toBe(AdConsentExists.False),
  );
});

it('uses the TCF snapshot even when it disagrees with geo', () => {
  region = 'IN';
  jest.mocked(useTcfConsent).mockReturnValue({
    gdprApplies: true,
    tcString: 'tc-string',
  });
  const { result } = renderHook(() => useAdRequestConsent(true), { wrapper });
  expect(result.current?.gdprApplies).toBe(true);
  expect(result.current?.consentString).toBe('tc-string');
  expect(result.current?.consentExists).toBeUndefined();
});

const useTestAdQuery = (enabled = true) =>
  useAdQuery({
    queryKey: ['test-ad'],
    placement: ads.AdPlacement.PostSidebar,
    enabled,
  });

it('holds the first request until the CMP answers, then sends only TCF consent', async () => {
  jest.useFakeTimers();
  jest.mocked(tcf.hasTcfApi).mockReturnValue(true);
  const { result, rerender } = renderHook(() => useTestAdQuery(), { wrapper });
  expect(tcf.startTcfSubscription).toHaveBeenCalled();
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.refetch();
  });
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS - 1));
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();

  jest.mocked(useTcfConsent).mockReturnValue({
    gdprApplies: true,
    tcString: 'tc-string',
  });
  rerender();
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledWith(
    expect.objectContaining({
      consent: expect.objectContaining({
        gdprApplies: true,
        consentString: 'tc-string',
        consentExists: undefined,
      }),
    }),
  );
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1);
});

it('falls back to the recorded refusal after the CMP timeout', async () => {
  jest.useFakeTimers();
  jest.mocked(tcf.hasTcfApi).mockReturnValue(true);
  document.cookie = 'ilikecookies=true;path=/';
  renderHook(() => useTestAdQuery(), { wrapper });
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS - 1));
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1));
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledWith(
    expect.objectContaining({
      consent: expect.objectContaining({
        consentExists: AdConsentExists.False,
      }),
    }),
  );
});

it.each([
  { country: 'IN', apiPresent: true },
  { country: 'PL', apiPresent: false },
])(
  'does not wait in $country with CMP API present=$apiPresent',
  async ({ country, apiPresent }) => {
    region = country;
    jest.mocked(tcf.hasTcfApi).mockReturnValue(apiPresent);
    renderHook(() => useTestAdQuery(), { wrapper });
    await waitFor(() =>
      expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1),
    );
    expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
  },
);

it('starts the CMP wait when the placement becomes enabled', async () => {
  jest.useFakeTimers();
  jest.mocked(tcf.hasTcfApi).mockReturnValue(true);
  const { rerender } = renderHook(({ enabled }) => useTestAdQuery(enabled), {
    wrapper,
    initialProps: { enabled: false },
  });
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS));
  expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
  rerender({ enabled: true });
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS));
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
});

it('blocks imperative feed fetches while consent is pending', async () => {
  jest.useFakeTimers();
  jest.mocked(tcf.hasTcfApi).mockReturnValue(true);
  const { result } = renderHook(() => useFetchAd(), { wrapper });
  expect(result.current.isAdConsentReady).toBe(false);
  await act(async () => {
    await result.current.fetchAd({});
  });
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS));
  expect(result.current.isAdConsentReady).toBe(true);
  await act(async () => {
    await result.current.fetchAd({});
  });
  expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1);
});

it('preserves the extension install-consent rule without waiting for a web CMP', async () => {
  jest.replaceProperty(func, 'isExtension', true);
  jest.mocked(tcf.hasTcfApi).mockReturnValue(true);
  renderHook(() => useTestAdQuery(), { wrapper });
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(ads.fetchAdByPlacement).toHaveBeenCalledWith(
    expect.objectContaining({
      consent: expect.objectContaining({
        consentExists: AdConsentExists.True,
      }),
    }),
  );
  expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
});
