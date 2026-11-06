import { act, renderHook } from '@testing-library/react';
import { useRevealOnEngagement } from './useRevealOnEngagement';
import { REVEAL_FALLBACK_MS, REVEAL_SHORT_PAGE_MS } from './commentsTeaser';

const setPage = ({
  scrollHeight,
  innerHeight,
  scrollY = 0,
}: {
  scrollHeight: number;
  innerHeight: number;
  scrollY?: number;
}) => {
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: innerHeight,
  });
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
};

const scrollTo = (scrollY: number) => {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: scrollY,
  });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
};

describe('useRevealOnEngagement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setPage({ scrollHeight: 4000, innerHeight: 800 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should stay hidden while disabled', () => {
    const { result } = renderHook(() => useRevealOnEngagement(false));
    act(() => {
      jest.advanceTimersByTime(REVEAL_FALLBACK_MS * 2);
    });
    expect(result.current).toBe(false);
  });

  it('should not show on load', () => {
    const { result } = renderHook(() => useRevealOnEngagement(true));
    expect(result.current).toBe(false);
  });

  it('should show after 5 seconds without any scrolling', () => {
    const { result } = renderHook(() => useRevealOnEngagement(true));
    act(() => {
      jest.advanceTimersByTime(REVEAL_FALLBACK_MS - 1);
    });
    expect(result.current).toBe(false);
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });

  it('should show once the reader has scrolled a full screen', () => {
    const { result } = renderHook(() => useRevealOnEngagement(true));
    scrollTo(799);
    expect(result.current).toBe(false);
    scrollTo(800);
    expect(result.current).toBe(true);
  });

  it('should show near the end of the page', () => {
    setPage({ scrollHeight: 1200, innerHeight: 800 });
    const { result } = renderHook(() => useRevealOnEngagement(true));
    scrollTo(300);
    expect(result.current).toBe(true);
  });

  it('should show on a page too short to scroll after 1.5 seconds', () => {
    setPage({ scrollHeight: 900, innerHeight: 800 });
    const { result } = renderHook(() => useRevealOnEngagement(true));
    act(() => {
      jest.advanceTimersByTime(REVEAL_SHORT_PAGE_MS);
    });
    expect(result.current).toBe(true);
  });
});
