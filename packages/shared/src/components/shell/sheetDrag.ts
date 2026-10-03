import { motion } from './constants';

// A bottom sheet is under the finger the whole time: it rides down 1:1,
// grows upward as the finger pulls it toward the top, and shrinks back as
// the finger comes down from full height. Nothing snaps while a finger is
// down. A release settles on the nearest stop (resting height, full
// height) with a flick deciding first, and a release past a third of the
// resting height, or a quick downward flick, dismisses. The drag starts
// only when the sheet's own content is scrolled to the top, so a list
// inside keeps scrolling. The dismiss leaves --sheet-drag on the panel so
// a closing animation can start from where the finger let go.
interface SheetDragOptions {
  // The element whose scroll position decides whether a downward touch
  // drags the sheet or scrolls its content; the panel by default.
  scroller?: () => HTMLElement | null;
  // A sheet grows to the top as the finger pulls it, and shrinks back.
  expandable?: boolean;
}

const flick = 0.6;
const upFlick = -0.5;

export const attachSheetDrag = (
  panel: HTMLElement,
  onDismiss: (event: TouchEvent) => void,
  { scroller = () => panel, expandable = true }: SheetDragOptions = {},
): (() => void) => {
  const { style } = panel;
  let startY = 0;
  let startTime = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0;
  let dy = 0;
  let tracking = false;
  let dragging = false;
  let startedExpanded = false;
  let restHeight = 0;
  let fullHeight = 0;

  const isExpanded = () => panel.getAttribute('data-expanded') === 'true';
  // The height of a sheet at the top: its overlay's, or the viewport's
  // for a sheet that is not inside one (the menu sheet).
  const measureFull = () =>
    panel.closest<HTMLElement>('.shell-sheet-overlay')?.clientHeight ??
    window.visualViewport?.height ??
    window.innerHeight;

  const settle = () => {
    panel.removeAttribute('data-dragging');
    style.transform = '';
    style.height = '';
    style.maxHeight = '';
    style.transition = '';
  };

  const settleTo = (expanded: boolean) => {
    panel.removeAttribute('data-dragging');
    style.transition = `height ${motion.snap}ms ${motion.interaction}, transform ${motion.snap}ms ${motion.interaction}`;
    style.transform = '';
    if (expanded) {
      panel.setAttribute('data-expanded', 'true');
      // The attribute's rule carries the full height; the inline height
      // only had to be a number for the transition to start from.
      style.height = `${fullHeight}px`;
    } else {
      panel.removeAttribute('data-expanded');
      style.height = `${restHeight}px`;
    }
    const done = () => {
      style.transition = '';
      style.maxHeight = '';
      if (!isExpanded()) {
        style.height = '';
      }
      panel.removeEventListener('transitionend', done);
    };
    panel.addEventListener('transitionend', done);
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
    lastY = startY;
    startTime = event.timeStamp;
    lastTime = startTime;
    velocity = 0;
    dy = 0;
    tracking = true;
    dragging = false;
  };

  const beginDrag = () => {
    dragging = true;
    startedExpanded = isExpanded();
    fullHeight = measureFull();
    const current = panel.offsetHeight;
    if (!startedExpanded || !restHeight) {
      restHeight = startedExpanded
        ? Math.min(restHeight || current, current)
        : current;
    }
    if (startedExpanded && !restHeight) {
      restHeight = current;
    }
    panel.setAttribute('data-dragging', 'true');
    panel.setAttribute('data-entered', 'true');
    // The inline height drives the sheet while a finger is down.
    panel.removeAttribute('data-expanded');
    style.transition = 'none';
    style.maxHeight = 'none';
    style.height = `${current}px`;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!tracking) {
      return;
    }
    const y = event.touches[0].clientY;
    dy = y - startY;
    const dt = event.timeStamp - lastTime;
    if (dt > 0) {
      velocity = (y - lastY) / dt;
    }
    lastY = y;
    lastTime = event.timeStamp;

    if (!dragging) {
      if (Math.abs(dy) < 6) {
        return;
      }
      if (dy < 0 && !expandable) {
        tracking = false;
        return;
      }
      beginDrag();
    }
    event.preventDefault();

    const base = startedExpanded ? fullHeight : restHeight;
    // Above the resting height the finger changes the sheet's height; below
    // it the sheet rides down whole.
    const wanted = base - dy;
    if (wanted >= restHeight) {
      style.height = `${Math.min(fullHeight, wanted)}px`;
      style.transform = '';
    } else {
      style.height = `${restHeight}px`;
      style.transform = `translateY(${restHeight - wanted}px)`;
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (!tracking) {
      return;
    }
    tracking = false;
    if (!dragging) {
      return;
    }
    dragging = false;

    const base = startedExpanded ? fullHeight : restHeight;
    const wanted = base - dy;
    const below = restHeight - wanted;
    const overallVelocity = dy / Math.max(1, event.timeStamp - startTime);

    if (
      below > 0 &&
      (below > restHeight / 3 || velocity > flick || overallVelocity > flick)
    ) {
      settle();
      style.setProperty('--sheet-drag', `${Math.max(0, below)}px`);
      onDismiss(event);
      return;
    }

    if (!expandable) {
      settleTo(false);
      return;
    }
    if (velocity < upFlick) {
      settleTo(true);
      return;
    }
    if (velocity > flick) {
      settleTo(false);
      return;
    }
    settleTo(wanted > (restHeight + fullHeight) / 2);
  };

  // Once the sheet has entered, its enter animation is over for good; a
  // drag that removes and restores the panel's state must not replay it.
  const onAnimationEnd = (event: AnimationEvent) => {
    if (event.target === panel) {
      panel.setAttribute('data-entered', 'true');
    }
  };

  panel.addEventListener('animationend', onAnimationEnd);
  panel.addEventListener('touchstart', onTouchStart, { passive: true });
  panel.addEventListener('touchmove', onTouchMove, { passive: false });
  panel.addEventListener('touchend', onTouchEnd);
  panel.addEventListener('touchcancel', onTouchEnd);

  return () => {
    panel.removeEventListener('animationend', onAnimationEnd);
    panel.removeEventListener('touchstart', onTouchStart);
    panel.removeEventListener('touchmove', onTouchMove);
    panel.removeEventListener('touchend', onTouchEnd);
    panel.removeEventListener('touchcancel', onTouchEnd);
    settle();
    panel.removeAttribute('data-expanded');
  };
};
