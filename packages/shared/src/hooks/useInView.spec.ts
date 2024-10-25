import { renderHook, act } from '@testing-library/react-hooks';
import { useInView } from './useInView';
import { useIntersectionObserver } from './useIntersectionObserver';

jest.mock('./useIntersectionObserver');

describe('useInView hook', () => {
  const mockIntersectionObserver = useIntersectionObserver as jest.Mock;
  const mockCallback = jest.fn();
  mockIntersectionObserver.mockImplementation((_, callback) => {
    mockCallback.mockImplementation(callback);
  });

  beforeEach(() => {
    mockIntersectionObserver.mockClear();
    mockCallback.mockClear();
  });

  it('should call useIntersectionObserver with the correct parameters and function', () => {
    renderHook(() =>
      useInView({
        threshold: 0.5,
        rootMargin: '10px',
        triggerOnce: true,
        initialInView: true,
      }),
    );

    const [ref, callback, options] = mockIntersectionObserver.mock.calls[0];
    expect(ref).toHaveProperty('current');
    expect(options).toEqual({ threshold: 0.5, rootMargin: '10px', root: null });
    expect(typeof callback).toBe('function');

    const mockEntry = [{ isIntersecting: true, target: ref.current }];
    const mockObserver = {
      disconnect: jest.fn(),
    } as unknown as IntersectionObserver;
    callback(mockEntry, mockObserver);
    expect(mockObserver.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should set ref correctly and trigger observer on ref change', () => {
    mockIntersectionObserver.mockImplementation((ref, callback) => {
      mockCallback.mockImplementation(callback);
    });

    const { result } = renderHook(() => useInView());
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      { current: div },
      expect.any(Function),
      { threshold: 0, rootMargin: '0px', root: null },
    );
  });

  it('should immediately set inView to true if element is already intersecting on ref assignment', () => {
    const { result } = renderHook(() => useInView({ initialInView: true }));
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(result.current.inView).toBe(true);
  });

  it('should avoid redundant updates for inView and entry', () => {
    const { result } = renderHook(() => useInView());
    const div = document.createElement('div');

    // Initial ref assignment
    act(() => {
      result.current.ref(div);
    });

    // First call with intersecting entry
    act(() => {
      mockCallback(
        [{ isIntersecting: true, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });
    expect(result.current.inView).toBe(true);

    // Second call with same intersecting entry (no state change expected)
    act(() => {
      mockCallback(
        [{ isIntersecting: true, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });
    expect(result.current.inView).toBe(true); // Ensure `inView` remains true

    // Call with non-intersecting entry
    act(() => {
      mockCallback(
        [{ isIntersecting: false, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });
    expect(result.current.inView).toBe(false); // `inView` should update to false on change

    // Final call to ensure no redundant updates
    act(() => {
      mockCallback(
        [{ isIntersecting: false, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });
    expect(result.current.inView).toBe(false); // `inView` should still be false
  });

  it('should handle array threshold and update inView state at each threshold', () => {
    const { result } = renderHook(() => useInView({ threshold: [0, 0.5, 1] }));
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    act(() => {
      mockCallback(
        [{ isIntersecting: true, intersectionRatio: 0.5, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });

    expect(result.current.inView).toBe(true);
  });

  it('should re-call useIntersectionObserver with updated threshold and rootMargin', () => {
    const { rerender } = renderHook(
      ({ threshold, rootMargin }) => useInView({ threshold, rootMargin }),
      { initialProps: { threshold: 0.5, rootMargin: '10px' } },
    );

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
      { threshold: 0.5, rootMargin: '10px', root: null },
    );

    // Update the options
    rerender({ threshold: 0.8, rootMargin: '20px' });

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Function),
      { threshold: 0.8, rootMargin: '20px', root: null },
    );
  });

  it('should update inView state when callback is triggered with intersecting entry', () => {
    const { result } = renderHook(() => useInView());
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    act(() => {
      mockCallback(
        [{ isIntersecting: true, target: div }],
        new IntersectionObserver(mockCallback),
      );
    });

    expect(result.current.inView).toBe(true);
  });

  it('should not observe again if triggerOnce is true and element has been viewed', () => {
    const { result } = renderHook(() =>
      useInView({ triggerOnce: true, initialInView: true }),
    );
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
    expect(result.current.inView).toBe(true);

    act(() => {
      result.current.ref(null);
      result.current.ref(div);
    });

    expect(mockIntersectionObserver).toHaveBeenCalledTimes(1);
  });

  it('should clean up observer on component unmount', () => {
    const { result, unmount } = renderHook(() => useInView());
    const div = document.createElement('div');

    act(() => {
      result.current.ref(div);
    });

    unmount();

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should apply correct rootMargin and threshold options', () => {
    renderHook(() =>
      useInView({
        rootMargin: '10px',
        threshold: 0.5,
      }),
    );

    const observerOptions = mockIntersectionObserver.mock.calls[0][2];
    expect(observerOptions.rootMargin).toBe('10px');
    expect(observerOptions.threshold).toBe(0.5);
  });
});
