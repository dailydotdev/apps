import { act, renderHook } from '@testing-library/react';
import { useViewability } from './useViewability';
import { largeDisplayArea } from './viewability';

interface EntryOptions {
  ratio: number;
  width?: number;
  height?: number;
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  disconnected = false;

  constructor(
    private callback: IntersectionObserverCallback,
    public options: IntersectionObserverInit,
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  static get last(): MockIntersectionObserver {
    return MockIntersectionObserver.instances[
      MockIntersectionObserver.instances.length - 1
    ];
  }

  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn(() => {
    this.disconnected = true;
  });

  trigger({ ratio, width = 300, height = 250 }: EntryOptions): void {
    act(() => {
      this.callback(
        [
          {
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
            boundingClientRect: { width, height } as DOMRectReadOnly,
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      );
    });
  }
}

const setVisibility = (state: DocumentVisibilityState): void => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });
};

const renderViewability = (onViewable = jest.fn()) => {
  const { result, unmount } = renderHook(() => useViewability({ onViewable }));

  act(() => {
    result.current.ref(document.createElement('div'));
  });

  return { onViewable, result, unmount };
};

beforeEach(() => {
  jest.useFakeTimers();
  MockIntersectionObserver.instances = [];
  global.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
  setVisibility('visible');
  jest.spyOn(document, 'hasFocus').mockReturnValue(true);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useViewability', () => {
  it('should report once half the pixels held a full second', () => {
    const { onViewable, result } = renderViewability();

    MockIntersectionObserver.last.trigger({ ratio: 0.5 });
    expect(onViewable).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(onViewable).toHaveBeenCalledTimes(1);
    expect(onViewable).toHaveBeenCalledWith({
      ratio: 0.5,
      duration: 1_000,
      timeToViewable: 1_000,
    });
    expect(result.current.isViewable).toBe(true);
  });

  it('should not report below half the pixels', () => {
    const { onViewable } = renderViewability();

    MockIntersectionObserver.last.trigger({ ratio: 0.49 });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    expect(onViewable).not.toHaveBeenCalled();
  });

  it('should require the second to be continuous', () => {
    const { onViewable } = renderViewability();
    const observer = MockIntersectionObserver.last;

    observer.trigger({ ratio: 0.5 });

    act(() => {
      jest.advanceTimersByTime(900);
    });

    observer.trigger({ ratio: 0.2 });

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(onViewable).not.toHaveBeenCalled();

    observer.trigger({ ratio: 0.5 });

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(onViewable).toHaveBeenCalledTimes(1);
  });

  it('should only need 30% of a large creative', () => {
    const { onViewable } = renderViewability();

    MockIntersectionObserver.last.trigger({
      ratio: 0.3,
      width: 970,
      height: largeDisplayArea / 970,
    });

    act(() => {
      jest.advanceTimersByTime(1_000);
    });

    expect(onViewable).toHaveBeenCalledWith(
      expect.objectContaining({ ratio: 0.3 }),
    );
  });

  it('should not count time while the tab is in the background', () => {
    const { onViewable } = renderViewability();

    setVisibility('hidden');
    MockIntersectionObserver.last.trigger({ ratio: 1 });

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    expect(onViewable).not.toHaveBeenCalled();

    setVisibility('visible');
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      jest.advanceTimersByTime(1_000);
    });

    expect(onViewable).toHaveBeenCalledTimes(1);
  });

  it('should stop observing once reported', () => {
    const { onViewable } = renderViewability();
    const observer = MockIntersectionObserver.last;

    observer.trigger({ ratio: 1 });

    act(() => {
      jest.advanceTimersByTime(5_000);
    });

    expect(onViewable).toHaveBeenCalledTimes(1);
    expect(observer.disconnected).toBe(true);
  });
});
