import { getScrollPosition, saveScrollPosition } from './scrollRestoration';

it('evicts old history entries while retaining recent positions', () => {
  for (let index = 0; index < 1000; index += 1) {
    window.history.replaceState({ key: `bounded-${index}` }, '', '/');
    saveScrollPosition('/', index);
  }
  expect(getScrollPosition('/')).toBe(999);
  window.history.replaceState({ key: 'bounded-0' }, '', '/');
  expect(getScrollPosition('/')).toBeUndefined();
});

it('keeps modal origins separate from scrolling the post entry', () => {
  window.history.replaceState({ key: 'modal-position' }, '', '/posts/test');
  saveScrollPosition('/posts/test', 5000, 'post-modal');
  saveScrollPosition('/posts/test', 0);

  expect(getScrollPosition('/posts/test', 'post-modal')).toBe(5000);
  expect(getScrollPosition('/posts/test')).toBe(0);
});
