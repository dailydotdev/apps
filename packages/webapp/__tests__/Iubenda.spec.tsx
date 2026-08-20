/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import { readFileSync } from 'fs';
import { join } from 'path';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { useConsentCookie } from '@dailydotdev/shared/src/hooks/useCookieConsent';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { iubendaLocalizedPolicyIds } from '@dailydotdev/shared/src/lib/iubenda';
import { startTcfSubscription } from '@dailydotdev/shared/src/lib/tcf';
import { Iubenda, openIubendaPreferences } from '../components/Iubenda';
import {
  enhanceIubendaBannerNow,
  watchIubendaBanner,
} from '../components/iubendaBanner';

jest.mock('@dailydotdev/shared/src/hooks/useCookieConsent', () => ({
  useConsentCookie: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/func', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/func'),
  isIOSNative: jest.fn(),
}));

jest.mock('@dailydotdev/shared/src/lib/tcf', () => ({
  startTcfSubscription: jest.fn(),
}));

jest.mock('../components/iubendaBanner', () => ({
  watchIubendaBanner: jest.fn(() => jest.fn()),
  enhanceIubendaBannerNow: jest.fn(),
}));

const mockUseConsentCookie = useConsentCookie as jest.MockedFunction<
  typeof useConsentCookie
>;
const mockIsIOSNative = isIOSNative as jest.MockedFunction<typeof isIOSNative>;
const mockWatchBanner = watchIubendaBanner as jest.MockedFunction<
  typeof watchIubendaBanner
>;

const SITE_ID = '1334205';
const POLICY_ID = '14695236';
const DOMAIN = 'daily.dev';

const saveCookies = jest.fn();

type IubendaWindow = typeof globalThis & {
  _iub?: {
    csConfiguration?: Record<string, unknown>;
    csLangConfiguration?: Record<string, { cookiePolicyId: number }>;
    cs?: {
      api?: { openPreferences?: () => void; isConsentGiven?: () => boolean };
    };
  };
};

const win = globalThis as IubendaWindow;

const config = (): Record<string, unknown> => win._iub?.csConfiguration ?? {};

const bannerConfig = (): Record<string, unknown> =>
  (config().banner as Record<string, unknown>) ?? {};

const callbacks = (): Record<string, (arg?: unknown) => void> =>
  (config().callback as Record<string, (arg?: unknown) => void>) ?? {};

const injectedScripts = (): HTMLScriptElement[] =>
  Array.from(document.querySelectorAll('script[src*="iubenda.com"]'));

const scriptFor = (fragment: string): HTMLScriptElement => {
  const script = injectedScripts().find((item) => item.src.includes(fragment));

  if (!script) {
    throw new Error(`no injected script matching: ${fragment}`);
  }

  return script;
};

const renderComponent = (auth: Partial<AuthContextData> = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ isAuthReady: true, isFunnel: false, ...auth }}
    >
      <Iubenda />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NEXT_PUBLIC_IUBENDA_SITE_ID = SITE_ID;
  process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID = POLICY_ID;
  process.env.NEXT_PUBLIC_DOMAIN = DOMAIN;
  mockUseConsentCookie.mockReturnValue({ saveCookies, cookieExists: false });
  mockIsIOSNative.mockReturnValue(false);
  mockWatchBanner.mockReturnValue(jest.fn());
  delete win._iub;
  injectedScripts().forEach((script) => script.remove());
  localStorage.clear();
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
  delete process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID;
  delete process.env.NEXT_PUBLIC_DOMAIN;
});

describe('Iubenda injection gating', () => {
  it('injects the CMP for a regular visitor in any region', async () => {
    renderComponent();

    await waitFor(() => expect(win._iub?.csConfiguration).toBeDefined());
    expect(injectedScripts().length).toBeGreaterThan(0);
  });

  it('waits until auth is ready so boot geo cannot be raced', () => {
    renderComponent({ isAuthReady: false });

    expect(win._iub?.csConfiguration).toBeUndefined();
    expect(injectedScripts()).toHaveLength(0);
  });

  it('stays out of the funnel, which has its own consent step', () => {
    renderComponent({ isFunnel: true });

    expect(win._iub?.csConfiguration).toBeUndefined();
    expect(injectedScripts()).toHaveLength(0);
  });

  it('never loads inside the iOS native wrapper', () => {
    mockIsIOSNative.mockReturnValue(true);

    renderComponent();

    expect(win._iub?.csConfiguration).toBeUndefined();
    expect(injectedScripts()).toHaveLength(0);
  });

  it('does not inject twice when the component remounts', async () => {
    const { unmount } = renderComponent();
    await waitFor(() => expect(win._iub?.csConfiguration).toBeDefined());
    const afterFirst = injectedScripts().length;
    unmount();

    renderComponent();

    await waitFor(() => expect(mockWatchBanner).toHaveBeenCalledTimes(2));
    expect(injectedScripts()).toHaveLength(afterFirst);
  });

  it('injects once when auth readiness flips mid-session', async () => {
    const { rerender } = render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isAuthReady: false, isFunnel: false }}
      >
        <Iubenda />
      </TestBootProvider>,
    );
    expect(injectedScripts()).toHaveLength(0);

    rerender(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ isAuthReady: true, isFunnel: false }}
      >
        <Iubenda />
      </TestBootProvider>,
    );

    await waitFor(() => expect(injectedScripts()).toHaveLength(5));
  });

  it('restarts the banner watcher on remount so a later banner is enhanced', async () => {
    const stop = jest.fn();
    mockWatchBanner.mockReturnValue(stop);

    const { unmount } = renderComponent();
    await waitFor(() => expect(mockWatchBanner).toHaveBeenCalledTimes(1));
    unmount();
    expect(stop).toHaveBeenCalled();

    renderComponent();

    await waitFor(() => expect(mockWatchBanner).toHaveBeenCalledTimes(2));
  });
});

describe('Iubenda script loading', () => {
  it('loads the dashboard script set in order, with the sync call first', async () => {
    renderComponent();

    await waitFor(() => expect(injectedScripts().length).toBe(5));
    expect(injectedScripts().map((script) => script.src)).toEqual([
      `https://cs.iubenda.com/sync/${SITE_ID}.js`,
      'https://cdn.iubenda.com/cs/tcf/stub-v2.js',
      'https://cdn.iubenda.com/cs/tcf/safe-tcf-v2.js',
      'https://cdn.iubenda.com/cs/gpp/stub.js',
      'https://cdn.iubenda.com/cs/iubenda_cs.js',
    ]);
  });

  it('forces in-order execution, since the TCF stub must precede the core', async () => {
    renderComponent();

    await waitFor(() => expect(injectedScripts().length).toBe(5));
    expect(injectedScripts().every((script) => script.async === false)).toBe(
      true,
    );
  });

  it('starts the TCF subscription once the stub defines __tcfapi', async () => {
    renderComponent();

    await waitFor(() => expect(injectedScripts().length).toBe(5));
    const stub = scriptFor('tcf/stub-v2');
    expect(startTcfSubscription).not.toHaveBeenCalled();

    stub.onload?.(new Event('load'));

    expect(startTcfSubscription).toHaveBeenCalled();
    // only the stub carries the hook; the core script must not re-subscribe
    expect(scriptFor('iubenda_cs.js').onload).toBeNull();
  });

  it('loads nothing when the policy id is not a number', async () => {
    process.env.NEXT_PUBLIC_IUBENDA_POLICY_ID = 'not-a-number';
    const error = jest.spyOn(console, 'error').mockImplementation();

    renderComponent();

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(injectedScripts()).toHaveLength(0);
    error.mockRestore();
  });

  it('logs and loads nothing when the env vars are missing', async () => {
    delete process.env.NEXT_PUBLIC_IUBENDA_SITE_ID;
    const error = jest.spyOn(console, 'error').mockImplementation();

    renderComponent();

    await waitFor(() => expect(error).toHaveBeenCalled());
    expect(error.mock.calls[0][0]).toContain('iubenda env vars missing');
    expect(injectedScripts()).toHaveLength(0);
    error.mockRestore();
  });
});

describe('Iubenda configuration', () => {
  const renderAndLoad = async () => {
    renderComponent();
    await waitFor(() => expect(win._iub?.csConfiguration).toBeDefined());
  };

  it('lets iubenda decide the regime per country, like the marketing sites', async () => {
    await renderAndLoad();
    // together these mean: banner only where a consent regime applies
    expect(config().countryDetection).toBe(true);
    expect(config().gdprAppliesGlobally).toBe(false);
    expect(config().enableLgpd).toBe(true);
    expect(config().enableUspr).toBe(true);
  });

  it('keeps the legal configuration the marketing embed ships', async () => {
    await renderAndLoad();
    expect(config().enableTcf).toBe(true);
    expect(config().perPurposeConsent).toBe(true);
    expect(config().siteId).toBe(Number(SITE_ID));
    expect(config().cookiePolicyId).toBe(Number(POLICY_ID));
  });

  it('owns the first layer and keeps Accept/Reject both present', async () => {
    await renderAndLoad();
    expect(bannerConfig().applyStyles).toBe(false);
    expect(bannerConfig().acceptButtonDisplay).toBe(true);
    expect(bannerConfig().rejectButtonDisplay).toBe(true);
    expect(bannerConfig().customizeButtonDisplay).toBe(true);
    expect(bannerConfig().closeButtonRejects).toBe(true);
  });

  it('shares consent across *.daily.dev and keeps the badge off', async () => {
    await renderAndLoad();
    expect(config().localConsentDomain).toBe(DOMAIN);
    // settings/privacy is the in-app withdrawal entry point instead
    expect(config().floatingPreferencesButtonDisplay).toBe(false);
  });

  it('derives the localized cookie policies from the shared table', async () => {
    await renderAndLoad();
    expect(win._iub?.csLangConfiguration).toEqual({
      en: { cookiePolicyId: Number(POLICY_ID) },
      es: { cookiePolicyId: iubendaLocalizedPolicyIds.es },
      de: { cookiePolicyId: iubendaLocalizedPolicyIds.de },
      it: { cookiePolicyId: iubendaLocalizedPolicyIds.it },
    });
  });
});

describe('Iubenda consent mirroring', () => {
  const renderAndLoad = async () => {
    renderComponent();
    await waitFor(() => expect(win._iub?.csConfiguration).toBeDefined());
  };

  it('writes through the necessary key, so a mirror never grants marketing', async () => {
    await renderAndLoad();
    // keyed on Marketing instead, every "no regime applies" callback would
    // grant the marketing cookie it is supposed to leave alone
    expect(mockUseConsentCookie).toHaveBeenCalledWith(GdprConsentKey.Necessary);
  });

  it('grants marketing when the visitor accepted purpose 5', async () => {
    await renderAndLoad();
    callbacks().onPreferenceExpressedOrNotNeeded({ purposes: { '5': true } });

    expect(saveCookies).toHaveBeenCalledWith([GdprConsentKey.Marketing], []);
  });

  it('revokes marketing when the visitor refused purpose 5', async () => {
    await renderAndLoad();
    callbacks().onPreferenceExpressedOrNotNeeded({ purposes: { '5': false } });

    expect(saveCookies).toHaveBeenCalledWith([], [GdprConsentKey.Marketing]);
  });

  it('records consent as settled when no regime applies, without granting marketing', async () => {
    await renderAndLoad();
    // null preference = iubenda found no regime for this country, so nothing
    // was ever asked. Necessary is recorded so gating knows the question is
    // closed, but marketing is never granted on nobody's behalf.
    callbacks().onPreferenceExpressedOrNotNeeded(null);

    expect(saveCookies).toHaveBeenCalledWith([], []);
  });

  it('grants from a non-TCF acceptance, which reports one verdict not purposes', async () => {
    await renderAndLoad();
    // an LGPD/USPR visitor pressing Accept all must reach the same gating as
    // a TCF one, or the CMP shows consent while our pixels stay revoked
    callbacks().onPreferenceExpressedOrNotNeeded({ consent: true });

    expect(saveCookies).toHaveBeenCalledWith([GdprConsentKey.Marketing], []);
  });

  it('revokes from a non-TCF refusal', async () => {
    await renderAndLoad();
    callbacks().onPreferenceExpressedOrNotNeeded({ consent: false });

    expect(saveCookies).toHaveBeenCalledWith([], [GdprConsentKey.Marketing]);
  });

  it('prefers the per-purpose answer when both are present', async () => {
    await renderAndLoad();
    callbacks().onPreferenceExpressedOrNotNeeded({
      consent: true,
      purposes: { '5': false },
    });

    expect(saveCookies).toHaveBeenCalledWith([], [GdprConsentKey.Marketing]);
  });

  it('asks the CMP when a preference carries no answer at all', async () => {
    await renderAndLoad();
    win._iub = { ...win._iub, cs: { api: { isConsentGiven: () => true } } };
    callbacks().onPreferenceExpressedOrNotNeeded({});

    expect(saveCookies).toHaveBeenCalledWith([GdprConsentKey.Marketing], []);
  });

  it('disarms the scrolled-to-bottom gate when the banner is shown', async () => {
    await renderAndLoad();
    const banner = document.createElement('div');
    banner.id = 'iubenda-cs-banner';
    banner.innerHTML = '<div class="iubenda-banner-content"></div>';
    document.body.appendChild(banner);
    const onScroll = jest.fn();
    const content = banner.querySelector('.iubenda-banner-content');
    content?.addEventListener('scroll', onScroll);

    callbacks().onBannerShown();

    // enhances a banner the watcher's cost cap may have missed, then clears
    // iubenda's scrolled-to-bottom gate so Accept works on the first press
    expect(enhanceIubendaBannerNow).toHaveBeenCalled();
    expect(onScroll).toHaveBeenCalled();
    banner.remove();
  });
});

it('keeps the first-layer stylesheet in the app module graph', () => {
  // applyStyles:false means iubenda ships no CSS for the banner; losing this
  // import renders the raw CMP markup and no test would otherwise notice
  const app = readFileSync(join(__dirname, '../pages/_app.tsx'), 'utf8');

  expect(app).toContain('styles/iubenda.css');
});

describe('openIubendaPreferences', () => {
  it('opens the CMP preferences when iubenda has loaded', () => {
    const openPreferences = jest.fn();
    win._iub = { cs: { api: { openPreferences } } };

    expect(openIubendaPreferences()).toBe(true);
    expect(openPreferences).toHaveBeenCalled();
  });

  it('reports failure when iubenda is blocked or still loading', () => {
    expect(openIubendaPreferences()).toBe(false);
  });

  it('reports failure when the CMP loaded without the preferences api', () => {
    win._iub = { cs: { api: {} } };

    expect(openIubendaPreferences()).toBe(false);
  });
});
