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
  isGdprCovered = true,
  user = null,
  isAuthReady = true,
}: {
  hasAccepted?: boolean;
  isGdprCovered?: boolean;
  user?: unknown;
  isAuthReady?: boolean;
} = {}) => {
  mockUseConsentCookie.mockReturnValue({
    saveCookies,
    cookieExists: hasAccepted,
  });
  mockUseAuthContext.mockReturnValue({
    isAuthReady,
    user,
    isGdprCovered,
  } as never);
};

describe('useCookieBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsIOSNative.mockReturnValue(false);
    localStorage.clear();
  });

  it('applies iubenda consent and grants marketing when purpose 5 is true', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    const { result } = renderHook(() => useCookieBanner());

    expect(saveCookies).toHaveBeenCalledWith(otherGdprConsents);
    expect(result.current.showBanner).toBe(false);
  });

  it('applies iubenda consent with necessary only when marketing is false', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({
      necessary: true,
      marketing: false,
    });

    const { result } = renderHook(() => useCookieBanner());

    expect(saveCookies).toHaveBeenCalledWith([]);
    expect(result.current.showBanner).toBe(false);
  });

  it('does not apply iubenda when necessary consent is not granted', () => {
    setup({ isGdprCovered: true, user: null });
    mockGetIubendaConsent.mockReturnValue({
      necessary: false,
      marketing: true,
    });

    const { result } = renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
    expect(result.current.showBanner).toBe(true);
  });

  it('ignores iubenda when the user already has a daily.dev choice', () => {
    setup({ hasAccepted: true });
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    const { result } = renderHook(() => useCookieBanner());

    expect(mockGetIubendaConsent).not.toHaveBeenCalled();
    expect(saveCookies).not.toHaveBeenCalled();
    expect(result.current.showBanner).toBe(false);
  });

  it('shows the banner as before when there is no iubenda cookie', () => {
    setup({ isGdprCovered: true, user: null });
    mockGetIubendaConsent.mockReturnValue(undefined);

    const { result } = renderHook(() => useCookieBanner());

    expect(saveCookies).not.toHaveBeenCalled();
    expect(result.current.showBanner).toBe(true);
  });

  it('sets the acknowledged flag when applying an iubenda choice', () => {
    setup();
    mockGetIubendaConsent.mockReturnValue({ necessary: true, marketing: true });

    renderHook(() => useCookieBanner());

    expect(localStorage.getItem('cookie_acknowledged')).toBe('true');
  });

  it('uses the marketing consent key for the additional cookie', () => {
    expect(otherGdprConsents).toEqual([GdprConsentKey.Marketing]);
  });
});
