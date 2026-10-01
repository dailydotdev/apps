import {
  getScrollPosition,
  isScrollRestoring,
  restoreScrollPosition,
  saveScrollPosition,
} from './scrollRestoration';

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

it('keeps restoring through clicks inside a dialog, but not outside one', () => {
  document.body.innerHTML =
    '<div aria-modal="true"><button type="button">Pick</button></div>';
  restoreScrollPosition(100000);

  document
    .querySelector('button')
    ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  expect(isScrollRestoring()).toBe(true);

  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  expect(isScrollRestoring()).toBe(false);
});
