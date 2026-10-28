import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
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
  return { ...actual, useIsHydrated: jest.fn() };
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
    mockedUseIsHydrated.mockReset();
    mockedUseIsHydrated.mockImplementation(
      jest.requireActual('../useIsHydrated').useIsHydrated,
    );
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

  // The mirror's contract: the markup the server produced hydrates without a
  // mismatch, and only then does the viewport take over.
  it('hydrates the painted shell without a mismatch, then reads the viewport', async () => {
    mockedUseViewSize.mockReturnValue(false);
    const Probe = () => <span>{String(useLaptopLayout())}</span>;
    const tree = (
      <LayoutVariantContext.Provider value="v2">
        <Probe />
      </LayoutVariantContext.Provider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    expect(container).toHaveTextContent('true');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      await act(async () => {
        hydrateRoot(container, tree);
      });

      expect(consoleError).not.toHaveBeenCalled();
      expect(container).toHaveTextContent('false');
    } finally {
      consoleError.mockRestore();
    }
  });
});
