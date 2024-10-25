import { renderHook, act } from '@testing-library/react-hooks';
import { useInView } from './useInView';
import { useIntersectionObserver } from './useIntersectionObserver';

jest.mock('./useIntersectionObserver');

describe('useInView hook', () => {
  const mockIntersectionObserver = useIntersectionObserver as jest.Mock;

  beforeEach(() => {
    mockIntersectionObserver.mockClear();
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
    const mockCallback = jest.fn();
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

  it('should update inView state when callback is triggered with intersecting entry', () => {
    const mockCallback = jest.fn();
    mockIntersectionObserver.mockImplementation((_, callback) => {
      mockCallback.mockImplementation(callback);
    });

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
    const mockCallback = jest.fn();
    mockIntersectionObserver.mockImplementation((_, callback) => {
      mockCallback.mockImplementation(callback);
    });

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
    const mockCallback = jest.fn();
    mockIntersectionObserver.mockImplementation((_, callback) => {
      mockCallback.mockImplementation(callback);
    });

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
