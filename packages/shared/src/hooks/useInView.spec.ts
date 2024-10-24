import { renderHook, act } from '@testing-library/react-hooks';
import { useInView } from './useInView';

describe('useInView Hook', () => {
  let observeMock: jest.Mock;
  let unobserveMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let observerMock: jest.Mock;

  beforeEach(() => {
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    disconnectMock = jest.fn();

    global.IntersectionObserver = jest.fn((callback, options = {}) => ({
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      thresholds: Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold || 0],
      observe: observeMock,
      unobserve: unobserveMock,
      disconnect: disconnectMock,
      takeRecords: jest.fn(),
    }));

    observerMock = global.IntersectionObserver as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should observe the element when the ref is set', () => {
    const { result } = renderHook(() => useInView());

    expect(observeMock).not.toHaveBeenCalled();

    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(observeMock).toHaveBeenCalledTimes(1);
    expect(observeMock).toHaveBeenCalledWith(div);
  });

  it('should update inView state when the element enters the viewport', () => {
    const { result } = renderHook(() => useInView());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: true, target: div }]);
    });

    expect(result.current.inView).toBe(true);
  });

  it('should not update inView if the element is not intersecting', () => {
    const { result } = renderHook(() => useInView());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: false, target: div }]);
    });

    expect(result.current.inView).toBe(false);
  });

  it('should disconnect observer if triggerOnce is true after the element enters the viewport', () => {
    const { result, unmount } = renderHook(() =>
      useInView({ triggerOnce: true }),
    );

    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(observeMock).toHaveBeenCalledTimes(1);

    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: true, target: div }]);
    });

    expect(disconnectMock).toHaveBeenCalledTimes(1);

    act(() => {
      unmount();
    });

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('should not observe the element again if triggerOnce is true and the element is already in view', () => {
    const { result } = renderHook(() =>
      useInView({ triggerOnce: true, initialInView: true }),
    );

    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(observeMock).not.toHaveBeenCalled();
  });

  it('should clean up the observer when unmounted', () => {
    const { result, unmount } = renderHook(() => useInView());

    const div = document.createElement('div');
    act(() => {
      result.current.ref(div);
    });

    expect(observeMock).toHaveBeenCalledTimes(1);

    unmount();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('should use the correct threshold and rootMargin options', () => {
    const { result } = renderHook(() =>
      useInView({ threshold: 0.5, rootMargin: '10px' }),
    );

    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    const observerOptions = observerMock.mock.calls[0][1];

    expect(observerOptions.threshold).toBe(0.5);
    expect(observerOptions.rootMargin).toBe('10px');
  });
});
