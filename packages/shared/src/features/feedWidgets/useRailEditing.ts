import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { FeedWidget } from './types';
import {
  FeedWidgetSize,
  feedWidgetSizeLabel,
  feedWidgetSizeSpan,
} from './types';
import { moveFeedWidget } from './layout';
import { feedWidgetSizes } from './components';
import { getFeedWidgetDefinition } from './registry';

/** Material's standard curve: quick out of the gate, gentle landing. */
export const RAIL_EASE = 'cubic-bezier(0.2, 0, 0, 1)';
const DRAG_THRESHOLD = 4;
const TOUCH_HOLD_MS = 250;
const TOUCH_TOLERANCE = 5;
/** iOS's long-press length for entering widget edit mode. */
const HOLD_TO_EDIT_MS = 500;
const AUTO_SCROLL_ZONE = 64;
/** The reflow animation's length: no second swap lands while one plays. */
const SWAP_SETTLE_MS = 200;
/** How far the pointer must travel before the last swap may be undone. */
const REVERSE_DISTANCE = 48;
const FLASH_MS = 700;
const SETTLE_MS = 200;

export type RailCorner = 'tr' | 'br' | 'bl';

/** Which way each corner grows the widget: +1 right/down, -1 left/up. */
const cornerGrowth: Record<RailCorner, { x: 1 | -1; y: 1 | -1 }> = {
  tr: { x: 1, y: -1 },
  br: { x: 1, y: 1 },
  bl: { x: -1, y: 1 },
};

const sizeArea: Record<FeedWidgetSize, number> = {
  [FeedWidgetSize.Small]: 1,
  [FeedWidgetSize.Tall]: 2,
  [FeedWidgetSize.Large]: 4,
};

/** The size a dragged footprint means, or the nearest one the widget has. */
const sizeForFootprint = (
  widget: FeedWidget,
  cols: number,
  rows: number,
): FeedWidgetSize => {
  let wanted = FeedWidgetSize.Small;
  if (cols > 1) {
    wanted = FeedWidgetSize.Large;
  } else if (rows > 1) {
    wanted = FeedWidgetSize.Tall;
  }
  const sizes = feedWidgetSizes(widget.kind);
  if (sizes.includes(wanted)) {
    return wanted;
  }
  return [...sizes].sort(
    (first, second) =>
      Math.abs(sizeArea[first] - sizeArea[wanted]) -
      Math.abs(sizeArea[second] - sizeArea[wanted]),
  )[0];
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

type DragState = {
  id: string;
  pointerId: number;
  /** Where on the widget it was grabbed. */
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  startOrder: FeedWidget[];
  isSettling?: boolean;
};

export type RailResizing = {
  id: string;
  corner: RailCorner;
  /** The outline under the pointer, rubber-banded past the largest size. */
  width: number;
  height: number;
  /** The size letting go would give, and its footprint on the grid. */
  size: FeedWidgetSize;
  targetWidth: number;
  targetHeight: number;
};

type ResizeStart = {
  widget: FeedWidget;
  corner: RailCorner;
  x: number;
  y: number;
  width: number;
  height: number;
  unitWidth: number;
  unitHeight: number;
  columnGap: number;
  rowGap: number;
  cols: 1 | 2;
  rows: 1 | 2;
};

/** How far past a boundary the outline must go before the preview flips. */
const RESIZE_HYSTERESIS = 16;

const itemSelector = (id: string): string => `[data-widget-id="${id}"]`;

/** Overlays that live outside the rail but belong to its edit session. */
const overlaySelector =
  '[data-feed-widget-overlay],[data-radix-popper-content-wrapper],[role="dialog"],[role="menu"]';

/**
 * Edit mode for the widget rail, after the home screens readers know: drag a
 * widget to reorder (a hold first on touch), drag a corner to resize, the
 * minus to remove, Space and the arrows to move without a pointer, and a
 * long press on touch or a tap outside to enter and leave.
 *
 * A drag or resize works on a local draft and writes the settings once, on
 * release, so a burst of swaps is one request.
 */
export const useRailEditing = ({
  widgets,
  isEditing,
  setIsEditing,
  isGalleryOpen,
  rootRef,
  gridRef,
  scrollerRef,
  replaceWidgets,
  moveWidget,
  onRemove,
}: {
  widgets: FeedWidget[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isGalleryOpen: boolean;
  rootRef: RefObject<HTMLElement>;
  gridRef: RefObject<HTMLDivElement>;
  scrollerRef: RefObject<HTMLDivElement>;
  replaceWidgets: (next: FeedWidget[]) => void;
  moveWidget: (id: string, toIndex: number) => void;
  onRemove: (widget: FeedWidget) => void;
}) => {
  const [draft, setDraft] = useState<FeedWidget[] | null>(null);
  const displayed = draft ?? widgets;
  const displayedRef = useRef(displayed);
  displayedRef.current = displayed;

  const [drag, setDrag] = useState<DragState | null>(null);
  const [lifted, setLifted] = useState<{
    id: string;
    startIndex: number;
  } | null>(null);
  const [resizing, setResizing] = useState<RailResizing | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const pointer = useRef({ x: 0, y: 0 });
  const pressStart = useRef<{
    id: string;
    pointerId: number;
    x: number;
    y: number;
    type: string;
  } | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdOrigin = useRef<{ x: number; y: number } | null>(null);
  const didHold = useRef(false);
  const swapLock = useRef<string | null>(null);
  const lastSwapAt = useRef(0);
  const lastMove = useRef<{ from: number; x: number; y: number } | null>(null);
  const heading = useRef(0);
  const autoScroll = useRef({ speed: 0, since: 0 });
  const resizeStart = useRef<ResizeStart | null>(null);
  const focusAfter = useRef<string | null>(null);

  const nameOf = useCallback((id: string): string => {
    const widget = displayedRef.current.find((item) => item.id === id);
    return widget ? getFeedWidgetDefinition(widget.kind).name : 'Widget';
  }, []);

  const flash = useCallback((id: string) => setFlashId(id), []);

  useEffect(() => {
    if (!flashId) {
      return undefined;
    }
    const timer = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  // Focus follows the widget the reader just moved with the keyboard.
  useEffect(() => {
    if (!focusAfter.current) {
      return;
    }
    const target = gridRef.current?.querySelector<HTMLElement>(
      itemSelector(focusAfter.current),
    );
    target?.focus({ preventScroll: true });
    target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    focusAfter.current = null;
  });

  /* ---------------- FLIP: everything reflows, nothing jumps ------------- */

  // Layout offsets, not client rects: they ignore the rail's scroll and the
  // transforms of reflows still in flight, so scrolling is never read as a
  // move and one animation never feeds the next.
  const positions = useRef(new Map<string, { left: number; top: number }>());
  const layoutKey = displayed.map(({ id, size }) => `${id}:${size}`).join(',');
  useLayoutEffect(() => {
    const node = gridRef.current;
    if (!node) {
      return;
    }
    const reduce = prefersReducedMotion();
    node.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((element) => {
      const id = element.dataset.flipId as string;
      const next = { left: element.offsetLeft, top: element.offsetTop };
      const previous = positions.current.get(id);
      positions.current.set(id, next);
      if (!previous || reduce || id === drag?.id || !element.animate) {
        return;
      }
      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        return;
      }
      element.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 180, easing: RAIL_EASE },
      );
    });
    // Only a new order or size reflows; any other render leaves them be.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutKey, gridRef]);

  /* ---------------- pointer drag ---------------- */

  /** Moves the lifted widget under the pointer, from its own grid slot. */
  const positionDragged = useCallback(() => {
    const current = drag;
    const gridNode = gridRef.current;
    if (!current || current.isSettling || !gridNode) {
      return;
    }
    const element = gridNode.querySelector<HTMLElement>(
      itemSelector(current.id),
    );
    if (!element) {
      return;
    }
    const origin = gridNode.getBoundingClientRect();
    const dx =
      pointer.current.x - current.offsetX - origin.left - element.offsetLeft;
    const dy =
      pointer.current.y - current.offsetY - origin.top - element.offsetTop;
    element.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
  }, [drag, gridRef]);

  useLayoutEffect(() => {
    positionDragged();
  }, [positionDragged, displayed]);

  const startDrag = (id: string, pointerId: number, x: number, y: number) => {
    const element = gridRef.current?.querySelector<HTMLElement>(
      itemSelector(id),
    );
    if (!element) {
      return;
    }
    const rect = element.getBoundingClientRect();
    pointer.current = { x, y };
    swapLock.current = null;
    lastMove.current = null;
    heading.current = 0;
    autoScroll.current = { speed: 0, since: 0 };
    setDraft(widgets);
    setDrag({
      id,
      pointerId,
      offsetX: x - rect.left,
      offsetY: y - rect.top,
      width: rect.width,
      height: rect.height,
      startOrder: widgets,
    });
    setAnnouncement(`Picked up ${nameOf(id)}.`);
  };

  useEffect(() => {
    if (!drag || drag.isSettling) {
      return undefined;
    }

    // Swap on the dragged widget's center, not the cursor, so a grab near an
    // edge does not twitch the neighbours. Hit-testing reads layout offsets,
    // which ignore the reflow animation's transforms: a neighbour still
    // sliding past is not a target.
    const reorderAt = (dx: number, dy: number) => {
      const gridNode = gridRef.current;
      if (!gridNode) {
        return;
      }
      const origin = gridNode.getBoundingClientRect();
      const centerX =
        pointer.current.x - drag.offsetX + drag.width / 2 - origin.left;
      const centerY =
        pointer.current.y - drag.offsetY + drag.height / 2 - origin.top;
      const target = Array.from(
        gridNode.querySelectorAll<HTMLElement>('[data-widget-id]'),
      ).find(
        (element) =>
          element.dataset.widgetId !== drag.id &&
          centerX >= element.offsetLeft &&
          centerX < element.offsetLeft + element.offsetWidth &&
          centerY >= element.offsetTop &&
          centerY < element.offsetTop + element.offsetHeight,
      );
      const targetId = target?.dataset.widgetId ?? null;
      if (swapLock.current && swapLock.current !== targetId) {
        swapLock.current = null;
      }
      const order = displayedRef.current;
      const fromIndex = order.findIndex(({ id }) => id === drag.id);
      const toIndex = targetId
        ? order.findIndex(({ id }) => id === targetId)
        : -1;
      if (Math.abs(dx) > 1) {
        heading.current = Math.sign(dx);
      }
      // Only targets the pointer is heading towards count, or the slot just
      // vacated refills under the pointer and undoes the move.
      const isVertical = Math.abs(dy) > Math.abs(dx);
      const isAhead =
        isVertical ||
        heading.current === 0 ||
        Math.sign(toIndex - fromIndex) === heading.current;
      const last = lastMove.current;
      const isReversal =
        !!last &&
        toIndex === last.from &&
        Math.hypot(pointer.current.x - last.x, pointer.current.y - last.y) <
          REVERSE_DISTANCE;
      const now = performance.now();
      if (
        toIndex !== -1 &&
        toIndex !== fromIndex &&
        !swapLock.current &&
        now - lastSwapAt.current > SWAP_SETTLE_MS &&
        isAhead &&
        !isReversal
      ) {
        setDraft(moveFeedWidget(order, drag.id, toIndex));
        swapLock.current = targetId;
        lastSwapAt.current = now;
        lastMove.current = {
          from: fromIndex,
          x: pointer.current.x,
          y: pointer.current.y,
        };
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) {
        return;
      }
      const dx = event.clientX - pointer.current.x;
      const dy = event.clientY - pointer.current.y;
      pointer.current = { x: event.clientX, y: event.clientY };
      positionDragged();
      reorderAt(dx, dy);
      // Auto-scroll near the rail's ends, faster the closer to the edge.
      const node = scrollerRef.current;
      if (node) {
        const bounds = node.getBoundingClientRect();
        const fromStart = event.clientX - bounds.left;
        const fromEnd = bounds.right - event.clientX;
        let speed = 0;
        if (fromStart < AUTO_SCROLL_ZONE) {
          speed = -((AUTO_SCROLL_ZONE - fromStart) / AUTO_SCROLL_ZONE);
        } else if (fromEnd < AUTO_SCROLL_ZONE) {
          speed = (AUTO_SCROLL_ZONE - fromEnd) / AUTO_SCROLL_ZONE;
        }
        autoScroll.current = {
          speed,
          since:
            !autoScroll.current.speed && speed
              ? performance.now()
              : autoScroll.current.since,
        };
      }
    };

    let raf = 0;
    const frame = (now: number) => {
      const { speed, since } = autoScroll.current;
      const node = scrollerRef.current;
      if (speed && node) {
        // And faster the longer it stays there, so it starts gently.
        const ramp = Math.min(1, (now - since) / 600);
        node.scrollLeft += speed * (4 + 16 * ramp);
        positionDragged();
        reorderAt(speed * 2, 0);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const finish = (commit: boolean) => {
      autoScroll.current = { speed: 0, since: 0 };
      const element = gridRef.current?.querySelector<HTMLElement>(
        itemSelector(drag.id),
      );
      const order = displayedRef.current;
      if (commit) {
        replaceWidgets(order);
        flash(drag.id);
        const from = drag.startOrder.findIndex(({ id }) => id === drag.id);
        const to = order.findIndex(({ id }) => id === drag.id);
        setAnnouncement(
          `${nameOf(drag.id)} dropped, moved from position ${from + 1} to ${
            to + 1
          }.`,
        );
      } else {
        setDraft(null);
        setAnnouncement('Move canceled.');
      }
      // The lifted widget glides into its slot, then the draft hands over.
      if (element && !prefersReducedMotion()) {
        element.style.transition = `transform ${SETTLE_MS}ms ${RAIL_EASE}`;
        element.style.transform = '';
        setDrag({ ...drag, isSettling: true });
        return;
      }
      if (element) {
        element.style.transform = '';
      }
      setDrag(null);
      setDraft(null);
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId === drag.pointerId) {
        finish(true);
      }
    };
    const onCancel = () => finish(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        finish(false);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [
    drag,
    flash,
    gridRef,
    nameOf,
    positionDragged,
    replaceWidgets,
    scrollerRef,
  ]);

  useEffect(() => {
    if (!drag?.isSettling) {
      return undefined;
    }
    const timer = setTimeout(() => {
      const element = gridRef.current?.querySelector<HTMLElement>(
        itemSelector(drag.id),
      );
      if (element) {
        element.style.transition = '';
      }
      setDrag(null);
      setDraft(null);
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [drag, gridRef]);

  // Once the settings hold what the draft showed, the draft has nothing to add.
  useEffect(() => {
    if (!drag && !resizing) {
      setDraft(null);
    }
  }, [widgets, drag, resizing]);

  /* ---------------- hold to edit (touch) ---------------- */

  const cancelHoldToEdit = (event?: ReactPointerEvent) => {
    const origin = holdOrigin.current;
    if (
      event &&
      origin &&
      Math.hypot(event.clientX - origin.x, event.clientY - origin.y) <
        TOUCH_TOLERANCE
    ) {
      return;
    }
    clearTimeout(holdTimer.current);
    holdOrigin.current = null;
  };

  const startHoldToEdit = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'touch') {
      return;
    }
    holdOrigin.current = { x: event.clientX, y: event.clientY };
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdOrigin.current = null;
      didHold.current = true;
      setIsEditing(true);
      setAnnouncement('Editing widgets. Drag to reorder, Esc when done.');
    }, HOLD_TO_EDIT_MS);
  };

  /* ---------------- item handlers ---------------- */

  const onItemPointerDown = (event: ReactPointerEvent, id: string) => {
    if (!isEditing) {
      startHoldToEdit(event);
      return;
    }
    if (event.button !== 0 || drag || resizing) {
      return;
    }
    pressStart.current = {
      id,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      type: event.pointerType,
    };
    // Touch waits for a hold, so a swipe still scrolls the rail.
    if (event.pointerType === 'touch') {
      pressTimer.current = setTimeout(() => {
        const start = pressStart.current;
        if (start) {
          startDrag(start.id, start.pointerId, start.x, start.y);
          pressStart.current = null;
        }
      }, TOUCH_HOLD_MS);
    }
  };

  const onItemPointerMove = (event: ReactPointerEvent) => {
    cancelHoldToEdit(event);
    const start = pressStart.current;
    if (!start || drag) {
      return;
    }
    const distance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (start.type === 'touch') {
      if (distance > TOUCH_TOLERANCE) {
        clearTimeout(pressTimer.current);
        pressStart.current = null;
      }
      return;
    }
    if (distance > DRAG_THRESHOLD) {
      startDrag(start.id, start.pointerId, event.clientX, event.clientY);
      pressStart.current = null;
    }
  };

  const onItemPointerUp = () => {
    cancelHoldToEdit();
    clearTimeout(pressTimer.current);
    pressStart.current = null;
  };

  // In edit mode a widget is a thing to arrange, so its links stay put; and
  // the tap that completes a hold-to-edit is not a click on the widget.
  const onItemClickCapture = (event: ReactMouseEvent) => {
    const target = event.target as HTMLElement;
    // Portaled menus bubble through the widget in React's tree, not the
    // DOM's; they are controls, never the widget's own links.
    const isInside = (event.currentTarget as HTMLElement).contains(target);
    const isControl = !!target.closest('[data-widget-control]');
    if (!isInside || isControl) {
      didHold.current = false;
      return;
    }
    if (didHold.current || isEditing) {
      didHold.current = false;
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /* ---------------- keyboard ---------------- */

  const onItemKeyDown = (event: ReactKeyboardEvent, widget: FeedWidget) => {
    if (!isEditing || event.target !== event.currentTarget) {
      return;
    }
    const index = widgets.findIndex(({ id }) => id === widget.id);
    const name = nameOf(widget.id);
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (lifted?.id === widget.id) {
        setLifted(null);
        flash(widget.id);
        setAnnouncement(`${name} dropped at position ${index + 1}.`);
      } else {
        setLifted({ id: widget.id, startIndex: index });
        setAnnouncement(
          `${name} picked up at position ${
            index + 1
          }. Arrow keys move it, space drops it, escape cancels.`,
        );
      }
      return;
    }
    if (
      lifted?.id === widget.id &&
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
    ) {
      event.preventDefault();
      const to = Math.max(
        0,
        Math.min(
          widgets.length - 1,
          index + (event.key === 'ArrowRight' ? 1 : -1),
        ),
      );
      moveWidget(widget.id, to);
      focusAfter.current = widget.id;
      setAnnouncement(`${name}, position ${to + 1} of ${widgets.length}.`);
      return;
    }
    if (!lifted && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      onRemove(widget);
    }
  };

  // Escape cancels a keyboard move, then leaves edit mode; a tap outside the
  // rail and its menus leaves too.
  useEffect(() => {
    if (!isEditing) {
      setLifted(null);
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isGalleryOpen || drag) {
        return;
      }
      if (lifted) {
        moveWidget(lifted.id, lifted.startIndex);
        focusAfter.current = lifted.id;
        setLifted(null);
        setAnnouncement('Move canceled.');
        return;
      }
      setIsEditing(false);
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        isGalleryOpen ||
        rootRef.current?.contains(target) ||
        target.closest?.(overlaySelector)
      ) {
        return;
      }
      setIsEditing(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [
    isEditing,
    isGalleryOpen,
    lifted,
    drag,
    moveWidget,
    rootRef,
    setIsEditing,
  ]);

  /* ---------------- corner resize ---------------- */

  /*
   * A preview, not a live reflow: the outline follows the pointer and a
   * snapped footprint shows the size letting go would give. Resizing in
   * place repacked the rail on every boundary, which could move the widget
   * out from under the pointer and flip it back. The size lands once, on
   * release, with one reflow.
   */
  const footprint = (start: ResizeStart, size: FeedWidgetSize) => {
    const { cols, rows } = feedWidgetSizeSpan[size];
    return {
      targetWidth: start.unitWidth * cols + start.columnGap * (cols - 1),
      targetHeight: start.unitHeight * rows + start.rowGap * (rows - 1),
    };
  };

  const onResizeStart = (
    event: ReactPointerEvent,
    widget: FeedWidget,
    corner: RailCorner,
  ) => {
    if (event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    const item = handle.closest<HTMLElement>('[data-widget-id]');
    const gridNode = gridRef.current;
    if (!item || !gridNode) {
      return;
    }
    handle.setPointerCapture?.(event.pointerId);
    const styles = getComputedStyle(gridNode);
    const columnGap = parseFloat(styles.columnGap) || 0;
    const rowGap = parseFloat(styles.rowGap) || 0;
    const { cols, rows } = feedWidgetSizeSpan[widget.size];
    // Layout size, not the client rect: the jiggle rotates the widget.
    const width = item.offsetWidth;
    const height = item.offsetHeight;
    const start: ResizeStart = {
      widget,
      corner,
      x: event.clientX,
      y: event.clientY,
      width,
      height,
      unitWidth: (width - columnGap * (cols - 1)) / cols,
      unitHeight: (height - rowGap * (rows - 1)) / rows,
      columnGap,
      rowGap,
      cols,
      rows,
    };
    resizeStart.current = start;
    setResizing({
      id: widget.id,
      corner,
      width,
      height,
      size: widget.size,
      ...footprint(start, widget.size),
    });
  };

  const onResizeMove = (event: ReactPointerEvent) => {
    const start = resizeStart.current;
    if (!start) {
      return;
    }
    const growth = cornerGrowth[start.corner];
    const maxWidth = start.unitWidth * 2 + start.columnGap;
    const maxHeight = start.unitHeight * 2 + start.rowGap;
    // Past the largest size the outline resists, like a rubber band.
    const rubber = (value: number, min: number, max: number) => {
      if (value > max) {
        return max + (value - max) * 0.2;
      }
      if (value < min) {
        return min - (min - value) * 0.2;
      }
      return value;
    };
    const width = rubber(
      start.width + growth.x * (event.clientX - start.x),
      start.unitWidth,
      maxWidth,
    );
    const height = rubber(
      start.height + growth.y * (event.clientY - start.y),
      start.unitHeight,
      maxHeight,
    );
    // Halfway into the next cell flips the preview, but only once the
    // outline is clearly past it, so a hand resting on the line holds still.
    const flip = (value: number, unit: number, gap: number, current: 1 | 2) => {
      const line = unit * 1.5 + gap / 2;
      if (current === 1) {
        return value > line + RESIZE_HYSTERESIS ? 2 : 1;
      }
      return value < line - RESIZE_HYSTERESIS ? 1 : 2;
    };
    start.cols = flip(width, start.unitWidth, start.columnGap, start.cols);
    start.rows = flip(height, start.unitHeight, start.rowGap, start.rows);
    const size = sizeForFootprint(start.widget, start.cols, start.rows);
    setResizing({
      id: start.widget.id,
      corner: start.corner,
      width,
      height,
      size,
      ...footprint(start, size),
    });
  };

  const onResizeEnd = () => {
    const start = resizeStart.current;
    if (!start) {
      return;
    }
    resizeStart.current = null;
    const size = resizing?.size ?? start.widget.size;
    setResizing(null);
    if (size === start.widget.size) {
      return;
    }
    replaceWidgets(
      widgets.map((widget) =>
        widget.id === start.widget.id ? { ...widget, size } : widget,
      ),
    );
    flash(start.widget.id);
    setAnnouncement(
      `${nameOf(start.widget.id)} is now ${feedWidgetSizeLabel[size]}.`,
    );
  };

  useEffect(() => {
    if (!resizing) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        resizeStart.current = null;
        setResizing(null);
        setAnnouncement('Resize canceled.');
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [resizing]);

  return {
    displayed,
    dragId: drag?.id ?? null,
    isDragging: !!drag,
    liftedId: lifted?.id ?? null,
    resizing,
    flashId,
    flash,
    announcement,
    setAnnouncement,
    onItemPointerDown,
    onItemPointerMove,
    onItemPointerUp,
    onItemPointerCancel: () => cancelHoldToEdit(),
    onItemClickCapture,
    onItemKeyDown,
    onResizeStart,
    onResizeMove,
    onResizeEnd,
  };
};
