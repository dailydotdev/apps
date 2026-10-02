import { motion } from './constants';

// A bottom sheet follows the finger: down 1:1, up barely (a hint of
// rubber band), and a release past a third of its height or a quick flick
// dismisses it; anything less springs it back. The drag starts only when
// the sheet's own content is scrolled to the top, so a list inside keeps
// scrolling. The dismiss leaves --sheet-drag on the panel so a closing
// animation can start from where the finger let go.
interface SheetDragOptions {
  // The element whose scroll position decides whether a downward touch
  // drags the sheet or scrolls its content; the panel by default.
  scroller?: () => HTMLElement | null;
  // A sheet taller than its resting height grows to the top on the first
  // upward swipe and shrinks back on a short downward drag.
  expandable?: boolean;
}

const collapseDistance = 80;

export const attachSheetDrag = (
  panel: HTMLElement,
  onDismiss: (event: TouchEvent) => void,
  { scroller = () => panel, expandable = true }: SheetDragOptions = {},
): (() => void) => {
  const { style } = panel;
  let startY = 0;
  let startTime = 0;
  let dy = 0;
  let tracking = false;
  let dragging = false;
  let expanding = false;

  const isExpanded = () => panel.getAttribute('data-expanded') === 'true';
  const canExpand = () => {
    const content = scroller() ?? panel;
    return (
      expandable &&
      !isExpanded() &&
      content.scrollHeight > content.clientHeight + 1
    );
  };

  const settle = () => {
    panel.removeAttribute('data-dragging');
    style.transform = '';
    style.transition = '';
  };

  // A finger on a field, or inside a list that is scrolled, is not a drag.
  const startsInContent = (target: EventTarget | null): boolean => {
    let node = target as HTMLElement | null;
    while (node && node !== panel) {
      if (node.matches?.('input, textarea, select, [contenteditable="true"]')) {
        return true;
      }
      if (node.scrollTop > 0) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  };

  const onTouchStart = (event: TouchEvent) => {
    if (
      (scroller()?.scrollTop ?? 0) > 0 ||
      event.touches.length !== 1 ||
      startsInContent(event.target)
    ) {
      return;
    }
    startY = event.touches[0].clientY;
    startTime = event.timeStamp;
    dy = 0;
    tracking = true;
    dragging = false;
    expanding = false;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (expanding) {
      event.preventDefault();
      return;
    }
    if (!tracking) {
      return;
    }
    dy = event.touches[0].clientY - startY;
    if (!dragging) {
      if (dy > 6) {
        dragging = true;
        panel.setAttribute('data-dragging', 'true');
      } else if (dy < -6) {
        tracking = false;
        if (canExpand()) {
          expanding = true;
          panel.setAttribute('data-expanded', 'true');
          event.preventDefault();
        }
        return;
      } else {
        return;
      }
    }
    event.preventDefault();
    const offset = dy > 0 ? dy : dy * 0.05;
    style.transform = `translateY(${offset}px)`;
  };

  const onTouchEnd = (event: TouchEvent) => {
    expanding = false;
    if (!tracking) {
      return;
    }
    tracking = false;
    if (!dragging) {
      return;
    }
    dragging = false;
    const velocity = dy / Math.max(1, event.timeStamp - startTime);
    const far = dy > panel.offsetHeight / 3 || velocity > 0.6;
    if (far && isExpanded()) {
      panel.removeAttribute('data-expanded');
    } else if (far) {
      settle();
      style.setProperty('--sheet-drag', `${Math.max(0, dy)}px`);
      onDismiss(event);
      return;
    } else if (isExpanded() && dy > collapseDistance) {
      panel.removeAttribute('data-expanded');
    }
    panel.removeAttribute('data-dragging');
    style.transition = `transform ${motion.snap}ms ${motion.interaction}`;
    style.transform = '';
    const clear = () => {
      style.transition = '';
      panel.removeEventListener('transitionend', clear);
    };
    panel.addEventListener('transitionend', clear);
  };

  panel.addEventListener('touchstart', onTouchStart, { passive: true });
  panel.addEventListener('touchmove', onTouchMove, { passive: false });
  panel.addEventListener('touchend', onTouchEnd);
  panel.addEventListener('touchcancel', onTouchEnd);

  return () => {
    panel.removeEventListener('touchstart', onTouchStart);
    panel.removeEventListener('touchmove', onTouchMove);
    panel.removeEventListener('touchend', onTouchEnd);
    panel.removeEventListener('touchcancel', onTouchEnd);
    settle();
  };
};
