import { act, renderHook, waitFor } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useCloseOnBack } from './useCloseOnBack';

type PopStateCallback = (state: unknown) => boolean;

describe('useCloseOnBack', () => {
  let beforePopState: PopStateCallback | undefined;
  // What Next did with each pop: true when it would route to the entry.
  let nextRouted: boolean[];

  // Next's own listener: registered first, it asks beforePopState before
  // routing to the entry the browser moved to.
  const nextOnPopState = (event: PopStateEvent) => {
    nextRouted.push(beforePopState ? beforePopState(event.state) : true);
  };

  beforeAll(() => {
    window.addEventListener('popstate', nextOnPopState);
  });

  afterAll(() => {
    window.removeEventListener('popstate', nextOnPopState);
  });

  beforeEach(() => {
    beforePopState = undefined;
    nextRouted = [];
    window.history.replaceState({ key: 'page', __N: true }, '');
    jest.mocked(useRouter).mockReturnValue({
      beforePopState: (cb: PopStateCallback) => {
        beforePopState = cb;
      },
      events: { on: jest.fn(), off: jest.fn() },
      push: jest.fn(),
    } as unknown as NextRouter);
  });

  const goBack = async () => {
    const count = nextRouted.length;
    act(() => window.history.back());
    await waitFor(() => expect(nextRouted).toHaveLength(count + 1));
  };

  it('closes on back without the page under it routing', async () => {
    const onBack = jest.fn();
    const { length } = window.history;
    renderHook(() => useCloseOnBack({ enabled: true, onBack }));

    expect(window.history.length).toBe(length + 1);
    expect(window.history.state).toMatchObject({ key: 'page' });

    await goBack();

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(nextRouted).toEqual([false]);
    expect(window.history.state).toEqual({ key: 'page', __N: true });
  });

  it('takes its entry back after a back it did not close on', async () => {
    const onBack = jest.fn();
    const { result } = renderHook(() =>
      useCloseOnBack({ enabled: true, onBack }),
    );

    await goBack();
    act(() => result.current.restore());
    await goBack();

    expect(onBack).toHaveBeenCalledTimes(2);
    expect(nextRouted).toEqual([false, false]);
  });

  it('releases its entry before a navigation, without closing', async () => {
    const onBack = jest.fn();
    const { result } = renderHook(() =>
      useCloseOnBack({ enabled: true, onBack }),
    );

    await act(() => result.current.release());

    expect(onBack).not.toHaveBeenCalled();
    expect(nextRouted).toEqual([false]);
    expect(window.history.state).toEqual({ key: 'page', __N: true });
  });

  it('releases its entry when the overlay closes some other way', async () => {
    const onBack = jest.fn();
    const { unmount } = renderHook(() =>
      useCloseOnBack({ enabled: true, onBack }),
    );

    unmount();
    await waitFor(() => expect(nextRouted).toEqual([false]));

    expect(onBack).not.toHaveBeenCalled();
    expect(window.history.state).toEqual({ key: 'page', __N: true });
    // A later back is the page's own again.
    expect(beforePopState?.({ key: 'previous' })).toBe(true);
  });

  it('leaves history alone when disabled', () => {
    const { length } = window.history;
    renderHook(() => useCloseOnBack({ enabled: false, onBack: jest.fn() }));

    expect(window.history.length).toBe(length);
    expect(beforePopState).toBeUndefined();
  });
});
