import { act, renderHook } from '@testing-library/react';
import { useScrollToHashComment } from './useScrollToHashComment';

const advanceFrames = (count = 1) =>
  act(() => jest.advanceTimersByTime(16 * count));

let container: HTMLDivElement;
let target: HTMLDivElement;
let targetTop: number;
let parentTop: number;
let parentHeight: number;
let scrollIntoView: jest.Mock;

const renderScroll = (attached = true) => {
  const commentRef = { current: attached ? target : null };
  const view = renderHook(() =>
    useScrollToHashComment({
      containerRef: { current: container },
      commentRef,
      postId: 'p1',
      enabled: true,
    }),
  );
  return { ...view, commentRef };
};

beforeEach(() => {
  jest.useFakeTimers();
  window.history.replaceState({}, '', '/posts/p1#c-c1');
  container = document.createElement('div');
  target = document.createElement('div');
  container.appendChild(target);
  document.body.appendChild(container);
  targetTop = 1200;
  parentTop = 100;
  parentHeight = 600;
  jest
    .spyOn(target, 'getBoundingClientRect')
    .mockImplementation(() => ({ top: targetTop, height: 100 } as DOMRect));
  scrollIntoView = jest.fn(() => {
    targetTop = parentTop + parentHeight / 2 - 50;
  });
  target.scrollIntoView = scrollIntoView;
});

afterEach(() => {
  container.remove();
  jest.restoreAllMocks();
  jest.useRealTimers();
  window.history.replaceState({}, '', '/');
});

it('waits for a ref to attach after the comments render', () => {
  const { commentRef } = renderScroll(false);
  advanceFrames(30);
  expect(scrollIntoView).not.toHaveBeenCalled();

  commentRef.current = target;
  advanceFrames();
  expect(scrollIntoView).toHaveBeenCalledTimes(1);
});

it('corrects relative to a resized overflow container', () => {
  container.style.overflowY = 'auto';
  jest
    .spyOn(container, 'getBoundingClientRect')
    .mockImplementation(
      () => ({ top: parentTop, height: parentHeight } as DOMRect),
    );
  Object.defineProperty(container, 'clientHeight', {
    get: () => parentHeight,
  });
  renderScroll();
  advanceFrames();
  expect(targetTop).toBe(350);

  parentHeight = 400;
  advanceFrames();
  expect(scrollIntoView).toHaveBeenCalledTimes(2);
  expect(targetTop - parentTop).toBe(150);
});

it('re-anchors when the mobile visual viewport changes', () => {
  const viewport = { height: 600, offsetTop: 0 };
  const descriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport,
  });
  renderScroll();
  advanceFrames();
  viewport.height = 500;
  advanceFrames();
  expect(scrollIntoView).toHaveBeenCalledTimes(2);
  if (descriptor) {
    Object.defineProperty(window, 'visualViewport', descriptor);
  } else {
    Reflect.deleteProperty(window, 'visualViewport');
  }
});

it('stops after settling and releases its listeners', () => {
  const removeListener = jest.spyOn(window, 'removeEventListener');
  renderScroll();
  advanceFrames(100);
  expect(jest.getTimerCount()).toBe(0);
  expect(removeListener).toHaveBeenCalledWith('wheel', expect.any(Function));
  targetTop += 500;
  advanceFrames();
  expect(scrollIntoView).toHaveBeenCalledTimes(1);
});

it('gives up at the deadline even if layout keeps shifting', () => {
  renderScroll();
  for (let index = 0; index < 125; index += 1) {
    targetTop += 20;
    advanceFrames();
  }
  const callsAtDeadline = scrollIntoView.mock.calls.length;
  expect(callsAtDeadline).toBeGreaterThan(1);
  targetTop += 100;
  advanceFrames(100);
  expect(scrollIntoView).toHaveBeenCalledTimes(callsAtDeadline);
  expect(jest.getTimerCount()).toBe(0);
});

it('cancels pending frames and input listeners on unmount', () => {
  const removeListener = jest.spyOn(window, 'removeEventListener');
  const { unmount } = renderScroll();
  unmount();
  advanceFrames();
  expect(scrollIntoView).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
  ['wheel', 'touchmove', 'keydown', 'mousedown', 'hashchange'].forEach(
    (event) => {
      expect(removeListener).toHaveBeenCalledWith(event, expect.any(Function));
    },
  );
});

it('does not arm for unrelated hashes', () => {
  window.history.replaceState({}, '', '/posts/p1#discussion');
  renderScroll();
  expect(jest.getTimerCount()).toBe(0);
  advanceFrames();
  expect(scrollIntoView).not.toHaveBeenCalled();
});
