import { renderHook, render } from '@testing-library/react';
import React, { useRef } from 'react';

import { useIntersectionObserver } from './useIntersectionObserver';

describe('useIntersectionObserver', () => {
  const observeSpy = jest.fn();
  const unobserveSpy = jest.fn();
  const disconnectSpy = jest.fn();
  const takeRecordsSpy = jest.fn();

  let IntersectionObserverSpy: jest.Mock<IntersectionObserver>;

  const initialIntersectionObserver = global.IntersectionObserver;

  beforeAll(() => {
    IntersectionObserverSpy = jest.fn(
      (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ): IntersectionObserver => {
        const threshold =
          options?.threshold === undefined ? 0 : options?.threshold;
        const thresholds = Array.isArray(threshold) ? threshold : [threshold];

        return {
          root: options?.root || null,
          rootMargin: options?.rootMargin || '0px 0px 0px 0px',
          thresholds,
          observe: observeSpy,
          unobserve: unobserveSpy,
          takeRecords: takeRecordsSpy,
          disconnect: disconnectSpy,
        };
      },
    );

    global.IntersectionObserver = IntersectionObserverSpy;
  });

  beforeEach(() => {
    observeSpy.mockClear();
    unobserveSpy.mockClear();
    disconnectSpy.mockClear();
    IntersectionObserverSpy.mockClear();
  });

  afterAll(() => {
    global.IntersectionObserver = initialIntersectionObserver;
  });

  it('should be defined', () => {
    expect(useIntersectionObserver).toBeDefined();
  });

  it('should render', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    const { result } = renderHook(() =>
      useIntersectionObserver(div, callbackSpy),
    );

    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(div);
    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
    expect(result.current).toBeUndefined();
  });

  it('should create IntersectionObserver instance only on first hook render', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    renderHook(() => useIntersectionObserver(div, callbackSpy));
    renderHook(() => useIntersectionObserver(div, callbackSpy));

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
  });

  it('should create IntersectionObserver instance only on first hook render with same options', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div,
        rootMargin: '3px 3px 3px 3px',
        threshold: 0.5,
      }),
    );
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div,
        rootMargin: '3px 3px 3px 3px',
        threshold: 0.5,
      }),
    );

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
  });

  it('should create IntersectionObserver instance for every hook render with different options', () => {
    const div = document.createElement('div');
    const div2 = document.createElement('div');
    const callbackSpy = jest.fn();
    renderHook(() => useIntersectionObserver(div, callbackSpy)); // no options
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div,
        rootMargin: '3px 3px 3px 3px',
        threshold: 0.5,
      }),
    ); // all options specified
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div2,
        rootMargin: '10px 10px 10px 10px',
        threshold: 0.8,
      }),
    ); // all options different
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div,
        rootMargin: '3px 3px 3px 3px',
        threshold: 0.8,
      }),
    ); // some options different
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        root: div2,
        rootMargin: '3px 3px 3px 3px',
        threshold: 0.5,
      }),
    ); // element different
    renderHook(() => useIntersectionObserver(div, callbackSpy, { root: div })); // only root option specified
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, {
        rootMargin: '3px 3px 3px 3px',
      }),
    ); // only rootMargin option specified
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy, { threshold: 0.8 }),
    ); // only threshold option specified

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(8);
  });

  it('should create IntersectionObserver instance after options change', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    const { rerender } = renderHook(
      ({ options }: { options?: IntersectionObserverInit }) =>
        useIntersectionObserver(div, callbackSpy, options),
      {
        initialProps: {},
      },
    );

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);

    rerender({ options: { root: div } });

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(2);

    rerender({ options: { root: div, rootMargin: '3px 3px 3px 3px' } });

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(3);

    rerender({
      options: { root: div, rootMargin: '3px 3px 3px 3px', threshold: 0.5 },
    });

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(4);
  });

  it('should update IntersectionObserver callback after callback change', () => {
    const div = document.createElement('div');
    const rect = document.createElement('div').getBoundingClientRect();
    const callbackSpy = jest.fn();
    const callbackSpy2 = jest.fn();

    const { rerender } = renderHook(
      ({ callback }: { callback: IntersectionObserverCallback }) =>
        useIntersectionObserver(div, callback),
      {
        initialProps: { callback: callbackSpy },
      },
    );

    const entries: IntersectionObserverEntry[] = [
      {
        target: div,
        boundingClientRect: rect,
        intersectionRatio: 0.5,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const observerInstance = IntersectionObserverSpy.mock.instances[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries, observerInstance);

    expect(callbackSpy).toHaveBeenCalledTimes(1);

    rerender({ callback: callbackSpy2 });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries, observerInstance);

    expect(callbackSpy).toHaveBeenCalledTimes(1);
    expect(callbackSpy2).toHaveBeenCalledTimes(1);
  });

  it('should not create IntersectionObserver instance when options stay the same', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    const { rerender } = renderHook(
      ({ options }: { options?: IntersectionObserverInit }) =>
        useIntersectionObserver(div, callbackSpy, options),
      {
        initialProps: {
          options: { root: div, rootMargin: '3px 3px 3px 3px', threshold: 0.5 },
        },
      },
    );

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);

    rerender({
      options: { root: div, rootMargin: '3px 3px 3px 3px', threshold: 0.5 },
    });

    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
  });

  it('should invoke each callback registered to same observer for single element', () => {
    const div = document.createElement('div');
    const rect = document.createElement('div').getBoundingClientRect();
    const callbackSpy = jest.fn();
    const callbackSpy2 = jest.fn();
    renderHook(() => useIntersectionObserver(div, callbackSpy));
    renderHook(() => useIntersectionObserver(div, callbackSpy2));

    expect(observeSpy).toHaveBeenCalledTimes(2);

    const entries: IntersectionObserverEntry[] = [
      {
        target: div,
        boundingClientRect: rect,
        intersectionRatio: 0.5,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const observerInstance = IntersectionObserverSpy.mock.instances[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries, observerInstance);

    expect(callbackSpy).toHaveBeenCalledWith(entries, observerInstance);
    expect(callbackSpy).toHaveBeenCalledTimes(1);

    expect(callbackSpy2).toHaveBeenCalledWith(entries, observerInstance);
    expect(callbackSpy2).toHaveBeenCalledTimes(1);
  });

  it('should invoke same callback registered to same observer for different elements', () => {
    const div = document.createElement('div');
    const div2 = document.createElement('div');
    const rect = document.createElement('div').getBoundingClientRect();
    const callbackSpy = jest.fn();
    renderHook(() => useIntersectionObserver(div, callbackSpy));
    renderHook(() => useIntersectionObserver(div2, callbackSpy));

    expect(observeSpy).toHaveBeenCalledTimes(2);

    const entries1: IntersectionObserverEntry[] = [
      {
        target: div,
        boundingClientRect: rect,
        intersectionRatio: 0.5,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const entries2: IntersectionObserverEntry[] = [
      {
        target: div2,
        boundingClientRect: rect,
        intersectionRatio: 0.7,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const observerInstance = IntersectionObserverSpy.mock.instances[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries1, observerInstance);
    expect(callbackSpy).toHaveBeenCalledWith(entries1, observerInstance);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries2, observerInstance);
    expect(callbackSpy).toHaveBeenCalledWith(entries2, observerInstance);
    expect(callbackSpy).toHaveBeenCalledTimes(2);
  });

  it('should invoke all callbacks registered to different observers', () => {
    const div = document.createElement('div');
    const rect = document.createElement('div').getBoundingClientRect();
    const callbackSpy = jest.fn();
    const callbackSpy2 = jest.fn();
    renderHook(() => useIntersectionObserver(div, callbackSpy));
    renderHook(() =>
      useIntersectionObserver(div, callbackSpy2, { threshold: 0.5 }),
    );

    expect(observeSpy).toHaveBeenCalledTimes(2);

    const entries: IntersectionObserverEntry[] = [
      {
        target: div,
        boundingClientRect: rect,
        intersectionRatio: 0.5,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const observerInstance = IntersectionObserverSpy.mock.instances[0];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[0][0](entries, observerInstance);

    const entries2: IntersectionObserverEntry[] = [
      {
        target: div,
        boundingClientRect: rect,
        intersectionRatio: 0.5,
        intersectionRect: rect,
        rootBounds: rect,
        time: Date.now(),
        isIntersecting: true,
      },
    ];
    const observerInstance2 = IntersectionObserverSpy.mock.instances[1];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    IntersectionObserverSpy.mock.calls[1][0](entries, observerInstance);

    expect(callbackSpy).toHaveBeenCalledWith(entries, observerInstance);
    expect(callbackSpy).toHaveBeenCalledTimes(1);
    expect(callbackSpy2).toHaveBeenCalledWith(entries2, observerInstance2);
    expect(callbackSpy2).toHaveBeenCalledTimes(1);
  });

  it('should cleanup on element change', () => {
    const div = document.createElement('div');
    const div2 = document.createElement('div');
    const callbackSpy = jest.fn();
    const { rerender } = renderHook(
      ({ element }) => useIntersectionObserver(element, callbackSpy),
      {
        initialProps: {
          element: div,
        },
      },
    );

    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(div);

    rerender({ element: div2 });

    expect(unobserveSpy).toHaveBeenCalledTimes(1);
    expect(unobserveSpy).toHaveBeenCalledWith(div);
    expect(observeSpy).toHaveBeenCalledTimes(2);
    expect(observeSpy).toHaveBeenCalledWith(div2);
  });

  it('should cleanup on component unmount', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    const { unmount } = renderHook(() =>
      useIntersectionObserver(div, callbackSpy),
    );

    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(div);

    unmount();

    expect(unobserveSpy).toHaveBeenCalledTimes(1);
    expect(unobserveSpy).toHaveBeenCalledWith(div);

    renderHook(() => useIntersectionObserver(div, callbackSpy));

    // after all active instances are unmounted
    // IntersectionObserver should be disconnected
    // and removed from the global observerPool
    // the first mount of the new instance should
    // create a new IntersectionObserver instance
    // this is the only way to validate proper cleanup
    // for observerPool after last hook unmount
    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(2);
  });

  it('should accept React ref as a target', () => {
    const div = document.createElement('div');
    const callbackSpy = jest.fn();
    const { result: resultReference } = renderHook(() => useRef(div));
    const { result } = renderHook(() =>
      useIntersectionObserver(resultReference.current, callbackSpy),
    );

    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(div);
    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
    expect(result.current).toBeUndefined();
  });

  it('should create IntersectionObserver instance when useRef object is passed', () => {
    const callbackSpy = jest.fn();

    const Component = () => {
      const reference = useRef<HTMLDivElement>(null);
      useIntersectionObserver(reference, callbackSpy);

      return <div ref={reference}>Test</div>;
    };

    render(<Component />);

    expect(observeSpy).toHaveBeenCalledTimes(1);
    expect(IntersectionObserverSpy).toHaveBeenCalledTimes(1);
  });
});
