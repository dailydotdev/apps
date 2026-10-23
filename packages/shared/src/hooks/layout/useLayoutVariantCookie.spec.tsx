import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useViewSize } from '../useViewSize';
import { useLayoutVariantCookie } from './useLayoutVariantCookie';

jest.mock('../useViewSize', () => {
  const actual = jest.requireActual('../useViewSize');
  return { ...actual, useViewSize: jest.fn() };
});
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockedUseViewSize = useViewSize as jest.Mock;
const mockedUseAuthContext = useAuthContext as jest.Mock;

const readCookie = (): string | undefined =>
  document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${LAYOUT_VARIANT_COOKIE}=`));

describe('useLayoutVariantCookie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=; max-age=0`;
    mockedUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: true,
    });
    mockedUseViewSize.mockReturnValue(false);
  });

  it('records a logged-in laptop session', () => {
    mockedUseViewSize.mockReturnValue(true);

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBe(`${LAYOUT_VARIANT_COOKIE}=v2`);
  });

  it('expires the cookie below laptop', () => {
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=v2`;

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBeUndefined();
  });

  it('leaves logged-out sessions off the mirrored route', () => {
    mockedUseAuthContext.mockReturnValue({
      isAuthReady: true,
      isLoggedIn: false,
    });
    mockedUseViewSize.mockReturnValue(true);

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBeUndefined();
  });

  it('writes nothing before boot resolves', () => {
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=v2`;
    mockedUseAuthContext.mockReturnValue({
      isAuthReady: false,
      isLoggedIn: false,
    });
    mockedUseViewSize.mockReturnValue(true);

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBe(`${LAYOUT_VARIANT_COOKIE}=v2`);
  });
});
