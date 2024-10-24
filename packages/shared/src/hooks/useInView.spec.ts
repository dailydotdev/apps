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

    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn((callback, options = {}) => ({
      root: options.root || null,
      rootMargin: options.rootMargin || '0px', // Default to '0px' if undefined
      thresholds: Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold || 0], // Default to [0] if undefined
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

    // Initially, observe should not be called because the ref is not set yet
    expect(observeMock).not.toHaveBeenCalled();

    const div = document.createElement('div');

    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // After setting the ref, observe should be called
    expect(observeMock).toHaveBeenCalledTimes(1);
    expect(observeMock).toHaveBeenCalledWith(div);
  });

  it('should update inView state when the element enters the viewport', () => {
    const { result } = renderHook(() => useInView());

    // Set up the ref for a div element
    const div = document.createElement('div');
    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // Simulate the IntersectionObserver callback with the element intersecting
    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: true, target: div }]);
    });

    // The inView state should be true
    expect(result.current.inView).toBe(true);
  });

  it('should not update inView if the element is not intersecting', () => {
    const { result } = renderHook(() => useInView());

    const div = document.createElement('div');
    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // Simulate the IntersectionObserver callback with the element not intersecting
    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: false, target: div }]);
    });

    // The inView state should be false
    expect(result.current.inView).toBe(false);
  });

  it('should disconnect observer if triggerOnce is true after the element enters the viewport', () => {
    const { result, unmount } = renderHook(() =>
      useInView({ triggerOnce: true }),
    );

    const div = document.createElement('div');

    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // Initially, observer.observe should have been called
    expect(observeMock).toHaveBeenCalledTimes(1);

    // Simulate the IntersectionObserver callback with the element intersecting
    act(() => {
      observerMock.mock.calls[0][0]([{ isIntersecting: true, target: div }]);
    });

    // Assert that the disconnect is called once after the intersection
    expect(disconnectMock).toHaveBeenCalledTimes(1);

    // Unmount the hook and check if `disconnect` is called again during cleanup
    act(() => {
      unmount();
    });

    // The total number of disconnect calls should still be 1 (not counting cleanup)
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('should not observe the element again if triggerOnce is true and the element is already in view', () => {
    const { result } = renderHook(() =>
      useInView({ triggerOnce: true, initialInView: true }),
    );

    const div = document.createElement('div');

    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // Ensure that observer.observe is not called since the element is already in view
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('should clean up the observer when unmounted', () => {
    const { result, unmount } = renderHook(() => useInView());

    const div = document.createElement('div');
    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // The observer should be observing the element
    expect(observeMock).toHaveBeenCalledTimes(1);

    // Unmount the hook
    unmount();

    // The observer should be disconnected
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('should use the correct threshold and rootMargin options', () => {
    // Render the hook
    const { result } = renderHook(() =>
      useInView({ threshold: 0.5, rootMargin: '10px' }),
    );

    // Create a DOM element (e.g., a div) to use as the ref
    const div = document.createElement('div');

    // Set the ref to the div element
    act(() => {
      result.current.ref(div);
    });

    // Now that the ref is set, IntersectionObserver should have been initialized
    const observerOptions = observerMock.mock.calls[0][1];

    // Ensure the observer was created with the correct options
    expect(observerOptions.threshold).toBe(0.5);
    expect(observerOptions.rootMargin).toBe('10px');
  });
});
