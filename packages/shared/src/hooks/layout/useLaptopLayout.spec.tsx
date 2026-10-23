import React from 'react';
import { renderHook } from '@testing-library/react';
import { LayoutVariantContext } from '../../contexts/LayoutVariantContext';
import type { LayoutVariant } from '../../lib/layoutVariant';
import { useIsHydrated } from '../useIsHydrated';
import { useViewSize } from '../useViewSize';
import { useLaptopLayout } from './useLaptopLayout';

jest.mock('../useViewSize', () => {
  const actual = jest.requireActual('../useViewSize');
  return { ...actual, useViewSize: jest.fn() };
});
jest.mock('../useIsHydrated', () => {
  const actual = jest.requireActual('../useIsHydrated');
  return { ...actual, useIsHydrated: jest.fn(actual.useIsHydrated) };
});

const mockedUseViewSize = useViewSize as jest.Mock;
const mockedUseIsHydrated = useIsHydrated as jest.Mock;

const wrapper = (variant?: LayoutVariant) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <LayoutVariantContext.Provider value={variant}>
      {children}
    </LayoutVariantContext.Provider>
  );
  Wrapper.displayName = 'LayoutVariantWrapper';

  return Wrapper;
};

describe('useLaptopLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseViewSize.mockReturnValue(true);
  });

  // A client-side navigation or the extension's new tab mounts outside
  // hydration, so the viewport is known on the first render and nothing
  // may render the tablet chrome first.
  it('reads the viewport on the first render of a client mount', () => {
    const renders: boolean[] = [];
    renderHook(() => {
      const isLaptopLayout = useLaptopLayout();
      renders.push(isLaptopLayout);
      return isLaptopLayout;
    });

    expect(renders[0]).toBe(true);
    expect(renders).not.toContain(false);
  });

  it('is false below laptop', () => {
    mockedUseViewSize.mockReturnValue(false);

    const { result } = renderHook(() => useLaptopLayout());

    expect(result.current).toBe(false);
  });

  describe('while hydrating', () => {
    beforeEach(() => {
      mockedUseIsHydrated.mockReturnValue(false);
    });

    it('holds the shell the mirrored route painted', () => {
      mockedUseViewSize.mockReturnValue(false);

      const { result } = renderHook(() => useLaptopLayout(), {
        wrapper: wrapper('v2'),
      });

      expect(result.current).toBe(true);
    });

    it('holds the header shell outside the mirror', () => {
      const { result } = renderHook(() => useLaptopLayout(), {
        wrapper: wrapper(),
      });

      expect(result.current).toBe(false);
    });
  });
});
