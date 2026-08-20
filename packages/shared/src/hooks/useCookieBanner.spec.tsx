import { renderHook } from '@testing-library/react';
import {
  GdprConsentKey,
  otherGdprConsents,
  useCookieBanner,
} from './useCookieBanner';
import { useConsentCookie } from './useCookieConsent';
import { useAuthContext } from '../contexts/AuthContext';
import { getIubendaConsent } from '../lib/iubenda';
import { isIOSNative } from '../lib/func';

jest.mock('./useCookieConsent', () => ({
  useConsentCookie: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../lib/iubenda', () => ({
  getIubendaConsent: jest.fn(),
}));

jest.mock('../lib/func', () => ({
  ...jest.requireActual('../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockUseConsentCookie = useConsentCookie as jest.MockedFunction<
  typeof useConsentCookie
>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockGetIubendaConsent = getIubendaConsent as jest.MockedFunction<
  typeof getIubendaConsent
>;
const mockIsIOSNative = isIOSNative as jest.MockedFunction<typeof isIOSNative>;

const saveCookies = jest.fn();

const setup = ({
  hasAccepted = false,
  isAuthReady = true,
}: {
  hasAccepted?: boolean;
  isAuthReady?: boolean;
} = {}) => {
  mockUseConsentCookie.mockReturnValue({
    saveCookies,
    cookieExists: hasAccepted,
  });
  mockUseAuthContext.mockReturnValue({ isAuthReady } as never);
};

describe('useCookieBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsIOSNative.mockReturnValue(false);
    localStorage.clear();
  });

  it('mirrors iubenda consent and grants marketing when purpose 5 is true', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    renderHook(() => useCookieBanner());

    expect(saveCookies).toHaveBeenCalledWith(otherGdprConsents);
  });

  it('mirrors necessary only when marketing was refused', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({
      necessary: true,
      marketing: false,
    });

    renderHook(() => useCookieBanner());

    expect(saveCookies).toHaveBeenCalledWith([]);
  });

  it('does not mirror when necessary consent is not granted', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({
      necessary: false,
      marketing: true,
    });

    renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
  });

  it('does nothing when there is no iubenda cookie', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue(undefined);

    renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
  });

  it('ignores iubenda when the user already has a daily.dev choice', () => {
    setup({ hasAccepted: true });
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    renderHook(() => useCookieBanner());

    expect(mockGetIubendaConsent).not.toHaveBeenCalled();
    expect(saveCookies).not.toHaveBeenCalled();
  });

  it('waits for auth to be ready before reading the cookie', () => {
    setup({ isAuthReady: false });
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
  });

  it('skips the mirror on the iOS native wrapper', () => {
    setup();
    mockIsIOSNative.mockReturnValue(true);
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
  });

  it('mirrors as soon as boot completes, not only on the first render', () => {
    setup({ isAuthReady: false });
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    const { rerender } = renderHook(() => useCookieBanner());
    expect(saveCookies).not.toHaveBeenCalled();

    setup({ isAuthReady: true });
    rerender();

    expect(saveCookies).toHaveBeenCalledWith(otherGdprConsents);
  });

  it('stops mirroring once the choice is recorded locally', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    const { rerender } = renderHook(() => useCookieBanner());
    setup({ hasAccepted: true });
    rerender();

    expect(saveCookies).toHaveBeenCalledTimes(1);
  });

  it('uses the marketing consent key for the additional cookie', () => {
    expect(otherGdprConsents).toEqual([GdprConsentKey.Marketing]);
  });
});
