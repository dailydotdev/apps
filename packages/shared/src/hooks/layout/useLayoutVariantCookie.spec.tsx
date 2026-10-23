import { renderHook } from '@testing-library/react';
import { LAYOUT_VARIANT_COOKIE } from '../../lib/layoutVariant';
import { useViewSize } from '../useViewSize';
import { useLayoutVariantCookie } from './useLayoutVariantCookie';

jest.mock('../useViewSize', () => {
  const actual = jest.requireActual('../useViewSize');
  return { ...actual, useViewSize: jest.fn() };
});

const mockedUseViewSize = useViewSize as jest.Mock;

const readCookie = (): string | undefined =>
  document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${LAYOUT_VARIANT_COOKIE}=`));

describe('useLayoutVariantCookie', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=; max-age=0`;
    mockedUseViewSize.mockReturnValue(false);
  });

  it('records a laptop session', () => {
    mockedUseViewSize.mockReturnValue(true);

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBe(`${LAYOUT_VARIANT_COOKIE}=v2`);
  });

  it('expires the cookie below laptop', () => {
    document.cookie = `${LAYOUT_VARIANT_COOKIE}=v2`;

    renderHook(() => useLayoutVariantCookie());

    expect(readCookie()).toBeUndefined();
  });
});
