import { renderHook } from '@testing-library/react';
import { useAuthContext } from '../../contexts/AuthContext';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useLayoutVariantCookie } from './useLayoutVariantCookie';
import { useLayoutVariantFlag } from './useLayoutVariant';

jest.mock('./useLayoutVariant', () => ({
  useLayoutVariantFlag: jest.fn(),
}));
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

const mockedUseLayoutVariantFlag = useLayoutVariantFlag as jest.Mock;
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
    mockedUseAuthContext.mockReturnValue({ isLoggedIn: true });
    mockedUseLayoutVariantFlag.mockReturnValue({
      isV2: false,
      isLoading: false,
    });
  });

  it('records a logged-in v2 session', () => {
    mockedUseLayoutVariantFlag.mockReturnValue({
      isV2: true,
      isLoading: false,
    });

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBe(`${LAYOUT_VARIANT_COOKIE}=v2`);
  });

  it('expires the cookie once the flag turns off', () => {
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=v2`;

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBeUndefined();
  });

  it('leaves logged-out sessions off the mirrored route', () => {
    mockedUseAuthContext.mockReturnValue({ isLoggedIn: false });
    mockedUseLayoutVariantFlag.mockReturnValue({
      isV2: true,
      isLoading: false,
    });

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBeUndefined();
  });

  it('writes nothing before the flag resolves', () => {
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=v2`;
    mockedUseLayoutVariantFlag.mockReturnValue({
      isV2: false,
      isLoading: true,
    });

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBe(`${LAYOUT_VARIANT_COOKIE}=v2`);
  });
});
