/* eslint-disable no-underscore-dangle -- _iub is iubenda's mandated global */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { MODAL_KEY } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { GdprConsentKey } from '@dailydotdev/shared/src/hooks/useCookieBanner';

import { expireCookie, getCookies } from '@dailydotdev/shared/src/lib/cookie';
import type { AcceptCookiesCallback } from '@dailydotdev/shared/src/hooks/useCookieConsent';
import PrivacyPage from '../pages/settings/privacy';

jest.mock('next/router', () => ({
  useRouter: () => ({ isFallback: false, push: jest.fn() }),
}));

jest.mock('@dailydotdev/shared/src/lib/func', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/lib/func'),
  isIOSNative: jest.fn(),
}));

const mockIsIOSNative = isIOSNative as jest.MockedFunction<typeof isIOSNative>;

type IubendaWindow = typeof globalThis & {
  _iub?: { cs?: { api?: { openPreferences?: () => void } } };
};

const win = globalThis as IubendaWindow;

const consentCookies = (): Partial<Record<GdprConsentKey, string>> =>
  getCookies(Object.values(GdprConsentKey)) ?? {};

let client: QueryClient;

const renderPage = (auth: Partial<AuthContextData> = {}) => {
  client = new QueryClient();
  return render(
    <TestBootProvider
      client={client}
      auth={{ user: loggedUser, isAuthReady: true, ...auth }}
    >
      <PrivacyPage />
    </TestBootProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsIOSNative.mockReturnValue(false);
  delete win._iub;
  Object.values(GdprConsentKey).forEach((key) => expireCookie(key));
});

it('offers cookie preferences to a GDPR-covered visitor', async () => {
  renderPage({ isGdprCovered: true });

  expect(
    await screen.findByText('Manage cookie preferences'),
  ).toBeInTheDocument();
});

it('offers cookie preferences outside GDPR, where LGPD or USPR may apply', async () => {
  // iubenda now collects consent in those regions too, so withdrawal has to
  // stay reachable for visitors this page used to hide the section from
  renderPage({ isGdprCovered: false });

  expect(
    await screen.findByText('Manage cookie preferences'),
  ).toBeInTheDocument();
});

it('opens the CMP preferences when iubenda has loaded', async () => {
  const openPreferences = jest.fn();
  win._iub = { cs: { api: { openPreferences } } };
  renderPage({ isGdprCovered: true });

  fireEvent.click(await screen.findByText('Manage cookie preferences'));

  expect(openPreferences).toHaveBeenCalled();
  expect(client.getQueryData(MODAL_KEY)).toBeFalsy();
});

it('falls back to the in-house modal when iubenda is blocked', async () => {
  renderPage({ isGdprCovered: true });

  fireEvent.click(await screen.findByText('Manage cookie preferences'));

  const modal = client.getQueryData(MODAL_KEY) as { type: string };
  expect(modal?.type).toEqual(LazyModal.CookieConsent);
});

it('keeps the manual toggles in the iOS wrapper, which never loads iubenda', async () => {
  mockIsIOSNative.mockReturnValue(true);

  renderPage({ isGdprCovered: true });

  expect(await screen.findByText('Marketing cookies')).toBeInTheDocument();
  expect(
    screen.queryByText('Manage cookie preferences'),
  ).not.toBeInTheDocument();
});

it('records a refusal in the fallback modal as necessary only', async () => {
  // the modal reports "Reject all" by calling back with no arguments, and
  // `saveCookies` always writes the key it was created with — so a
  // marketing-keyed callback here would grant exactly what was refused
  renderPage({ isGdprCovered: true });
  fireEvent.click(await screen.findByText('Manage cookie preferences'));

  const modal = client.getQueryData(MODAL_KEY) as {
    props: { onAcceptCookies: AcceptCookiesCallback };
  };
  modal.props.onAcceptCookies();

  const cookies = consentCookies();
  expect(cookies[GdprConsentKey.Necessary]).toEqual('true');
  expect(cookies[GdprConsentKey.Marketing]).toBeFalsy();
});

it('grants marketing from the fallback modal only when accept all is used', async () => {
  renderPage({ isGdprCovered: true });
  fireEvent.click(await screen.findByText('Manage cookie preferences'));

  const modal = client.getQueryData(MODAL_KEY) as {
    props: { onAcceptCookies: AcceptCookiesCallback };
  };
  modal.props.onAcceptCookies([GdprConsentKey.Marketing]);

  const cookies = consentCookies();
  expect(cookies[GdprConsentKey.Necessary]).toEqual('true');
  expect(cookies[GdprConsentKey.Marketing]).toEqual('true');
});

it('revokes an existing marketing consent through the fallback modal', async () => {
  document.cookie = `${GdprConsentKey.Marketing}=true`;
  expect(consentCookies()[GdprConsentKey.Marketing]).toEqual('true');
  renderPage({ isGdprCovered: true });
  fireEvent.click(await screen.findByText('Manage cookie preferences'));

  const modal = client.getQueryData(MODAL_KEY) as {
    props: { onAcceptCookies: AcceptCookiesCallback };
  };
  // exactly what CookieConsentModal's "Reject all" sends
  modal.props.onAcceptCookies();

  expect(consentCookies()[GdprConsentKey.Marketing]).toBeFalsy();
});
