import { act, renderHook } from '@testing-library/react';
import { RAIL_ANCHOR_ATTRIBUTE } from '../giveback/components/GivebackGiftDock';
import { useCoachAnchor } from './useCoachAnchor';

const TARGET_SELECTOR = '#coach-target';
const COACH_GAP_PX = 8;
const SETTLE_MS = 350;

interface RectInput {
  left: number;
  top: number;
  width: number;
  height: number;
}

// This jsdom has no DOMRect constructor, so the fixtures build the full shape.
const toDomRect = ({ left, top, width, height }: RectInput): DOMRect => ({
  x: left,
  y: top,
  width,
  height,
  left,
  top,
  right: left + width,
  bottom: top + height,
  toJSON: () => undefined,
});

const stubRect = (element: HTMLElement, rect: RectInput): void => {
  Object.assign(element, { getBoundingClientRect: () => toDomRect(rect) });
};

const mount = (id: string, rect: RectInput): HTMLElement => {
  const element = document.createElement('div');
  element.id = id;
  stubRect(element, rect);
  document.body.appendChild(element);
  return element;
};

const mountRail = (rect: RectInput): HTMLElement => {
  const rail = document.createElement('div');
  rail.setAttribute(RAIL_ANCHOR_ATTRIBUTE, '');
  stubRect(rail, rect);
  document.body.appendChild(rail);
  return rail;
};

const RAIL_RECT: RectInput = { left: 0, top: 0, width: 64, height: 900 };
const TARGET_RECT: RectInput = { left: 8, top: 100, width: 48, height: 48 };

let observedElements: Element[] = [];
let observerCallbacks: ResizeObserverCallback[] = [];
let disconnect: jest.Mock;

const resizeObserved = () =>
  act(() => {
    observerCallbacks.forEach((callback) => callback([], {} as ResizeObserver));
  });

describe('useCoachAnchor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    observedElements = [];
    observerCallbacks = [];
    disconnect = jest.fn();
    global.ResizeObserver = jest
      .fn()
      .mockImplementation((callback: ResizeObserverCallback) => {
        observerCallbacks.push(callback);
        return {
          observe: (element: Element) => observedElements.push(element),
          unobserve: jest.fn(),
          disconnect,
        };
      }) as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('reports no anchor while the coach is closed', () => {
    mountRail(RAIL_RECT);
    mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, false));

    expect(result.current.rect).toBeNull();
    expect(result.current.left).toBe(0);
  });

  it('reports no anchor when the selector matches nothing', () => {
    mountRail(RAIL_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(result.current.rect).toBeNull();
    expect(result.current.left).toBe(0);
  });

  it('clears the context panel while it is open', () => {
    mountRail(RAIL_RECT);
    mount('sidebar-context-panel', {
      left: 64,
      top: 0,
      width: 240,
      height: 900,
    });
    mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(result.current.left).toBe(304 + COACH_GAP_PX);
    expect(result.current.rect?.top).toBe(TARGET_RECT.top);
  });

  it('clears the rail alone when the panel is collapsed', () => {
    mountRail(RAIL_RECT);
    mount('sidebar-context-panel', { left: 64, top: 0, width: 4, height: 900 });
    mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(result.current.left).toBe(64 + COACH_GAP_PX);
  });

  it('clears the rail alone when no panel is mounted', () => {
    mountRail(RAIL_RECT);
    mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(result.current.left).toBe(64 + COACH_GAP_PX);
  });

  it('re-measures the target on a window resize', () => {
    mountRail(RAIL_RECT);
    const target = mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    act(() => {
      jest.advanceTimersByTime(SETTLE_MS);
    });
    expect(result.current.rect?.top).toBe(TARGET_RECT.top);

    stubRect(target, { ...TARGET_RECT, top: 300 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.rect?.top).toBe(300);
  });

  it('holds the same anchor through re-measures that find nothing moved', () => {
    mountRail(RAIL_RECT);
    mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));
    const first = result.current;

    act(() => {
      jest.advanceTimersByTime(SETTLE_MS);
    });
    resizeObserved();
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // A new object here would hand `useAnchoredRailPopup` a fresh `targetRef`
    // and reposition the card mid-animation for nothing.
    expect(result.current).toBe(first);
  });

  it('stops listening for resizes once it unmounts', () => {
    mountRail(RAIL_RECT);
    mount('coach-target', TARGET_RECT);
    const removeListener = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));
    unmount();

    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(disconnect).toHaveBeenCalled();
    removeListener.mockRestore();
  });

  it('watches the rail, the panel and the target for size changes', () => {
    const rail = mountRail(RAIL_RECT);
    const panel = mount('sidebar-context-panel', {
      left: 64,
      top: 0,
      width: 240,
      height: 900,
    });
    const target = mount('coach-target', TARGET_RECT);

    renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(observedElements).toEqual([rail, panel, target]);
  });

  it('re-measures when the rail resizes without the window doing so', () => {
    const rail = mountRail(RAIL_RECT);
    const target = mount('coach-target', TARGET_RECT);

    const { result } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));

    expect(result.current.left).toBe(64 + COACH_GAP_PX);

    // Compact mode narrows the rail: no window resize, no step change, and the
    // two timed measures ran long ago.
    stubRect(rail, { ...RAIL_RECT, width: 48 });
    stubRect(target, { ...TARGET_RECT, top: 220 });
    resizeObserved();

    expect(result.current.left).toBe(48 + COACH_GAP_PX);
    expect(result.current.rect?.top).toBe(220);
  });
});
