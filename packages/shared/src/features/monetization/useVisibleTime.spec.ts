import { act, renderHook } from '@testing-library/react';
import { useVisibleTime } from './useVisibleTime';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

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

  disconnect = jest.fn();

  trigger(ratio: number): void {
    act(() => {
      this.callback(
        [
          {
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
            boundingClientRect: { width: 300, height: 250 } as DOMRectReadOnly,
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

const hideTab = () => {
  setVisibility('hidden');
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
};

const advance = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

const renderVisibleTime = (props: { trackingKey?: string } = {}) => {
  const onReport = jest.fn();
  const { result, unmount, rerender } = renderHook(
    ({ trackingKey }: { trackingKey?: string }) =>
      useVisibleTime({ onReport, trackingKey, reportInterval: 10_000 }),
    { initialProps: props },
  );

  act(() => {
    result.current.ref(document.createElement('div'));
  });

  return { onReport, unmount, rerender };
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

describe('useVisibleTime', () => {
  it('should report the seconds seen once the element leaves the screen', () => {
    const { onReport } = renderVisibleTime();
    const observer = MockIntersectionObserver.last;

    observer.trigger(1);
    advance(3_000);
    observer.trigger(0);

    expect(onReport).toHaveBeenCalledTimes(1);
    expect(onReport).toHaveBeenCalledWith(3);
  });

  it('should not count below half the pixels', () => {
    const { onReport } = renderVisibleTime();
    const observer = MockIntersectionObserver.last;

    observer.trigger(0.49);
    advance(5_000);
    observer.trigger(0);

    expect(onReport).not.toHaveBeenCalled();
  });

  it('should report in increments while the element stays on screen', () => {
    const { onReport } = renderVisibleTime();

    MockIntersectionObserver.last.trigger(1);
    advance(25_000);

    expect(onReport.mock.calls).toEqual([[10], [10]]);
  });

  it('should carry a sub-second remainder into the next report', () => {
    const { onReport } = renderVisibleTime();
    const observer = MockIntersectionObserver.last;

    observer.trigger(1);
    advance(1_600);
    observer.trigger(0);
    observer.trigger(1);
    advance(1_600);
    observer.trigger(0);

    expect(onReport.mock.calls).toEqual([[1], [2]]);
  });

  it('should settle the open stretch when the tab goes to the background', () => {
    const { onReport } = renderVisibleTime();

    MockIntersectionObserver.last.trigger(1);
    advance(2_000);
    hideTab();
    advance(20_000);

    expect(onReport.mock.calls).toEqual([[2]]);
  });

  it('should settle the open stretch on unmount', () => {
    const { onReport, unmount } = renderVisibleTime();

    MockIntersectionObserver.last.trigger(1);
    advance(4_000);
    unmount();

    expect(onReport.mock.calls).toEqual([[4]]);
  });

  it('should close the stretch when the page is unloaded and not count time parked in the back-forward cache', () => {
    const { onReport } = renderVisibleTime();
    const observer = MockIntersectionObserver.last;

    observer.trigger(1);
    advance(4_000);
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });

    expect(onReport.mock.calls).toEqual([[4]]);

    advance(3_600_000);
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });
    advance(2_000);
    observer.trigger(0);

    expect(onReport.mock.calls).toEqual([[4], [2]]);
  });

  it('should hand over the count when the content swaps in place', () => {
    const { onReport, rerender } = renderVisibleTime({ trackingKey: 'a' });

    MockIntersectionObserver.last.trigger(1);
    advance(2_000);
    rerender({ trackingKey: 'b' });

    expect(onReport.mock.calls).toEqual([[2]]);
    expect(MockIntersectionObserver.instances).toHaveLength(2);
  });

  it('should report nothing for a stretch shorter than a second', () => {
    const { onReport } = renderVisibleTime();
    const observer = MockIntersectionObserver.last;

    observer.trigger(1);
    advance(500);
    observer.trigger(0);

    expect(onReport).not.toHaveBeenCalled();
  });
});
