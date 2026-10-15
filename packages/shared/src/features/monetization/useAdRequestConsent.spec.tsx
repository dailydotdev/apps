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
import { useAdMacroContext } from './useAdMacroContext';
import { PREBID_CMP_TIMEOUT_MS } from './kueez';

jest.mock('./useTcfConsent');
jest.mock('../../lib/func', () => ({
  __esModule: true,
  ...jest.requireActual('../../lib/func'),
  isExtension: false,
}));

let client: QueryClient;
let region: string | undefined;
let isAuthReady: boolean;
let isFunnel: boolean;
const wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider
    client={client}
    auth={{ geo: { region }, isGdprCovered: true, isAuthReady, isFunnel }}
  >
    {children}
  </TestBootProvider>
);

const clearCookies = () => {
  document.cookie.split(';').forEach((cookie) => {
    document.cookie = `${cookie.split('=')[0].trim()}=;max-age=0;path=/`;
  });
};

const configureCmp = () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    NEXT_PUBLIC_IUBENDA_SITE_ID: '123',
    NEXT_PUBLIC_IUBENDA_POLICY_ID: '456',
  });
};

beforeEach(() => {
  client = new QueryClient(defaultQueryClientTestingConfig);
  region = 'PL';
  isAuthReady = true;
  isFunnel = false;
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
  'uses CMP scope for ad requests in %s while pixels keep the broad auth flag',
  (country) => {
    region = country;
    const { result } = renderHook(
      () => ({
        request: useAdRequestConsent(true),
        pixel: useAdMacroContext(true),
      }),
      { wrapper },
    );
    expect(result.current.request).toEqual({
      gdprApplies: false,
      consentString: undefined,
      addtlConsent: undefined,
      consentExists: undefined,
    });
    expect(result.current.pixel?.gdprApplies).toBe(true);
  },
);

it.each(['PL', 'GB', 'CH', undefined])(
  'keeps %s in certified-CMP scope when no TCF snapshot exists',
  (country) => {
    region = country;
    const { result } = renderHook(
      () => ({
        request: useAdRequestConsent(true),
        pixel: useAdMacroContext(true),
      }),
      { wrapper },
    );
    expect(result.current.request?.gdprApplies).toBe(true);
    expect(result.current.request?.consentExists).toBe(AdConsentExists.None);
    expect(result.current.pixel?.gdprApplies).toBe(true);
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

it('holds the first request before the TCF script loads, then sends only TCF consent', async () => {
  jest.useFakeTimers();
  configureCmp();
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
  configureCmp();
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

it('does not wait outside certified-CMP scope', async () => {
  configureCmp();
  region = 'IN';
  renderHook(() => useTestAdQuery(), { wrapper });
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
});

it('does not wait when the CMP is not configured', async () => {
  jest.replaceProperty(process, 'env', {
    ...process.env,
    NEXT_PUBLIC_IUBENDA_SITE_ID: '',
    NEXT_PUBLIC_IUBENDA_POLICY_ID: '',
  });
  renderHook(() => useTestAdQuery(), { wrapper });
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
  expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
});

it.each(['onboarding', 'ios'])(
  'does not wait on %s where the web CMP does not load',
  async (surface) => {
    configureCmp();
    isFunnel = surface === 'onboarding';
    jest.spyOn(func, 'isIOSNative').mockReturnValue(surface === 'ios');
    renderHook(() => useTestAdQuery(), { wrapper });
    await waitFor(() =>
      expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1),
    );
    expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
  },
);

it('starts the wait budget only when auth is ready to load the CMP', async () => {
  jest.useFakeTimers();
  configureCmp();
  isAuthReady = false;
  const { rerender } = renderHook(() => useTestAdQuery(), { wrapper });
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS));
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  expect(tcf.startTcfSubscription).not.toHaveBeenCalled();
  isAuthReady = true;
  rerender();
  act(() => jest.advanceTimersByTime(PREBID_CMP_TIMEOUT_MS - 1));
  expect(ads.fetchAdByPlacement).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1));
  await waitFor(() => expect(ads.fetchAdByPlacement).toHaveBeenCalledTimes(1));
});

it('starts the CMP wait when the placement becomes enabled', async () => {
  jest.useFakeTimers();
  configureCmp();
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
  configureCmp();
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
  configureCmp();
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
