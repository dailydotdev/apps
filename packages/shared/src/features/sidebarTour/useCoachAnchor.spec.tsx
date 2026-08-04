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

describe('useCoachAnchor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
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

  it('stops listening for resizes once it unmounts', () => {
    mountRail(RAIL_RECT);
    mount('coach-target', TARGET_RECT);
    const removeListener = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useCoachAnchor(TARGET_SELECTOR, true));
    unmount();

    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    removeListener.mockRestore();
  });
});
