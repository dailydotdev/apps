import type { CSSProperties, ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { MinusIcon } from '@dailydotdev/shared/src/components/icons/Minus';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/common';
import type { WidgetKind, WidgetSize } from './catalog';
import {
  sizeLabel,
  sizeSpan,
  widgetCatalog,
  WidgetContent,
  WidgetSurface,
} from './catalog';
import type { CampaignStrip } from './adSlot';
import { AdSlot } from './adSlot';
import { isCardWidget } from './production';
import { CustomizeButton, WidgetGallery } from './frame';

export type RailWidget = { id: string; kind: WidgetKind; size: WidgetSize };

const AD_ID = 'ad-slot';
const RAIL_SIZES: WidgetSize[] = ['s', 'm', 'l'];
/** Material's standard curve: quick out of the gate, gentle landing. */
const EASE = 'cubic-bezier(0.2, 0, 0, 1)';
const DRAG_THRESHOLD = 4;
const TOUCH_HOLD_MS = 250;
const TOUCH_TOLERANCE = 5;
const AUTO_SCROLL_ZONE = 64;
const UNDO_MS = 6000;
/** iOS's long-press length for entering widget edit mode. */
const HOLD_TO_EDIT_MS = 500;
/** The reflow animation's length: no second swap lands while one plays. */
const SWAP_SETTLE_MS = 200;
/** How far the pointer must travel before the last swap may be undone. */
const REVERSE_DISTANCE = 48;

let railUid = 0;
export const rw = (kind: WidgetKind, size: WidgetSize): RailWidget => {
  railUid += 1;
  return { id: `${kind}-rail-${railUid}`, kind, size };
};

const railCss = `
@keyframes railJiggle {
  0% { transform: rotate(-0.45deg); }
  50% { transform: rotate(0.45deg); }
  100% { transform: rotate(-0.45deg); }
}
.rail-jiggle { animation: railJiggle 300ms ease-in-out infinite; }
.rail-jiggle:nth-child(2n) { animation-delay: -150ms; }
@keyframes railFlash {
  0% { box-shadow: 0 0 0 2px var(--theme-accent-cabbage-default); }
  100% { box-shadow: 0 0 0 2px transparent; }
}
.rail-flash { animation: railFlash 700ms cubic-bezier(0.25, 0.1, 0.25, 1) both; border-radius: 1rem; }
@keyframes railControlsIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: none; }
}
.rail-controls-in { animation: railControlsIn 180ms ${EASE} both; }
@keyframes railToastIn {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
.rail-toast { animation: railToastIn 220ms ${EASE} both; }
@keyframes railSheetIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: none; }
}
.rail-sheet { animation: railSheetIn 260ms ${EASE} both; }
@media (prefers-reduced-motion: reduce) {
  .rail-jiggle, .rail-flash, .rail-controls-in, .rail-toast, .rail-sheet { animation: none; }
}
`;

const allowedSizes = (kind: WidgetKind): WidgetSize[] =>
  RAIL_SIZES.filter((size) => widgetCatalog[kind].sizes.includes(size));

const spanStyle = (size: WidgetSize): CSSProperties => ({
  gridColumn: `span ${sizeSpan[size].cols}`,
  gridRow: `span ${sizeSpan[size].rows}`,
});

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates every rail item from where it was to where it is now (FLIP), so a
 * reorder, resize, add or remove reflows instead of jumping.
 */
const useFlip = (container: React.RefObject<HTMLElement>, deps: unknown[]) => {
  const rects = useRef(new Map<string, DOMRect>());

  useLayoutEffect(() => {
    const node = container.current;
    if (!node) {
      return;
    }
    const reduce = prefersReducedMotion();
    node.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((element) => {
      const id = element.dataset.flipId as string;
      const next = element.getBoundingClientRect();
      const previous = rects.current.get(id);
      rects.current.set(id, next);
      if (!previous || reduce) {
        return;
      }
      const dx = previous.left - next.left;
      const dy = previous.top - next.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        return;
      }
      element.animate(
        [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
        { duration: 180, easing: EASE },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return useCallback(() => {
    container.current
      ?.querySelectorAll<HTMLElement>('[data-flip-id]')
      .forEach((element) =>
        rects.current.set(
          element.dataset.flipId as string,
          element.getBoundingClientRect(),
        ),
      );
  }, [container]);
};

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

type Corner = 'tr' | 'br' | 'bl';

/** Which way each corner grows the widget: +1 right/down, -1 left/up. */
const cornerGrowth: Record<Corner, { x: 1 | -1; y: 1 | -1 }> = {
  tr: { x: 1, y: -1 },
  br: { x: 1, y: 1 },
  bl: { x: -1, y: 1 },
};

/** The outline grows away from the corner opposite the one being dragged. */
const cornerAnchor: Record<Corner, CSSProperties> = {
  tr: { left: 0, bottom: 0 },
  br: { left: 0, top: 0 },
  bl: { right: 0, top: 0 },
};

const cornerClassName: Record<Corner, string> = {
  tr: '-right-1.5 -top-1.5 cursor-nesw-resize rounded-tr-[1.375rem] border-r-[0.1875rem] border-t-[0.1875rem]',
  br: '-bottom-1.5 -right-1.5 cursor-nwse-resize rounded-br-[1.375rem] border-b-[0.1875rem] border-r-[0.1875rem]',
  bl: '-bottom-1.5 -left-1.5 cursor-nesw-resize rounded-bl-[1.375rem] border-b-[0.1875rem] border-l-[0.1875rem]',
};

const sizeArea: Record<WidgetSize, number> = { s: 1, m: 2, w: 2, l: 4 };

/** The size a dragged footprint means, or the nearest one the widget has. */
const sizeForFootprint = (
  kind: WidgetKind,
  cols: number,
  rows: number,
): WidgetSize => {
  const wanted: WidgetSize = cols > 1 ? 'l' : rows > 1 ? 'm' : 's';
  const sizes = allowedSizes(kind);
  if (sizes.includes(wanted)) {
    return wanted;
  }
  return [...sizes].sort(
    (first, second) =>
      Math.abs(sizeArea[first] - sizeArea[wanted]) -
      Math.abs(sizeArea[second] - sizeArea[wanted]),
  )[0];
};

/**
 * The resize grip from iOS and macOS edit mode: a quarter of the widget's own
 * corner, drawn just outside it, on every corner but the one that removes.
 */
const ResizeHandle = ({
  corner,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  corner: Corner;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
}): ReactElement => (
  <span
    aria-hidden
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
    className={classNames(
      'rail-controls-in absolute z-3 size-7 touch-none border-text-primary transition-transform duration-150 before:absolute before:-inset-2 hover:scale-110 motion-reduce:transition-none',
      cornerClassName[corner],
    )}
  />
);

type MenuAction =
  | { type: 'size'; size: WidgetSize }
  | { type: 'move'; to: 'start' | 'left' | 'right' | 'end' }
  | { type: 'remove' };

/**
 * Every widget's menu, in and out of edit mode: the non-drag way to resize,
 * reorder and remove, as WCAG 2.5.7 asks and as Windows does it.
 */
const WidgetMenu = ({
  widget,
  canMoveLeft,
  canMoveRight,
  onAction,
}: {
  widget: RailWidget;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onAction: (action: MenuAction) => void;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const def = widgetCatalog[widget.kind];

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [isOpen]);

  const run = (action: MenuAction) => {
    onAction(action);
    setIsOpen(false);
  };

  const item =
    'flex h-8 w-full items-center rounded-8 px-2 text-left text-text-secondary typo-footnote hover:bg-surface-hover hover:text-text-primary disabled:pointer-events-none disabled:opacity-40';
  const moves: [MenuAction & { type: 'move' }, string, boolean][] = [
    [{ type: 'move', to: 'start' }, 'Move to start', canMoveLeft],
    [{ type: 'move', to: 'left' }, 'Move left', canMoveLeft],
    [{ type: 'move', to: 'right' }, 'Move right', canMoveRight],
    [{ type: 'move', to: 'end' }, 'Move to end', canMoveRight],
  ];

  return (
    <div
      ref={root}
      data-rail-overlay
      onPointerDown={(event) => event.stopPropagation()}
      className="absolute right-2.5 top-3.5 z-2"
    >
      <button
        type="button"
        aria-label={`${def.name} options`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className={classNames(
          'flex size-7 items-center justify-center rounded-8 text-text-tertiary transition-opacity hover:bg-surface-hover hover:text-text-primary focus-visible:opacity-100',
          isOpen
            ? 'bg-surface-hover opacity-100'
            : 'opacity-0 group-hover/rail-item:opacity-100',
        )}
      >
        <MenuIcon className="rotate-90" size={IconSize.Size16} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="rail-controls-in absolute right-0 top-8 flex w-48 flex-col gap-0.5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-1.5 shadow-3"
        >
          <span className="px-2 pb-1 pt-0.5 text-text-quaternary typo-caption2">
            Size
          </span>
          <div className="flex gap-0.5 px-1 pb-1">
            {allowedSizes(widget.kind).map((size) => (
              <button
                key={size}
                type="button"
                role="menuitemradio"
                aria-checked={size === widget.size}
                onClick={() => run({ type: 'size', size })}
                className={classNames(
                  'h-7 flex-1 rounded-8 typo-caption1',
                  size === widget.size
                    ? 'bg-text-primary font-bold text-surface-invert'
                    : 'text-text-tertiary hover:bg-surface-hover',
                )}
              >
                {sizeLabel[size]}
              </button>
            ))}
          </div>
          <span className="mx-1 my-1 h-px bg-border-subtlest-tertiary" />
          {moves.map(([action, label, isEnabled]) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              disabled={!isEnabled}
              onClick={() => run(action)}
              className={item}
            >
              {label}
            </button>
          ))}
          <span className="mx-1 my-1 h-px bg-border-subtlest-tertiary" />
          <button
            type="button"
            role="menuitem"
            onClick={() => run({ type: 'remove' })}
            className={classNames(item, '!text-accent-ketchup-default')}
          >
            Remove widget
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* The rail                                                            */
/* ------------------------------------------------------------------ */

type DragState = {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  x: number;
  y: number;
  startIndex: number;
  /** Set on release: the lifted copy glides here, then the widget takes over. */
  settleTo?: { x: number; y: number };
};

export type RailController = {
  add: (kind: WidgetKind, size: WidgetSize) => void;
  openGallery: () => void;
  kinds: WidgetKind[];
};

export type WidgetRailProps = {
  initialWidgets: RailWidget[];
  strips?: CampaignStrip[];
  isPlus?: boolean;
  /** Feed columns visible at once; the rail scrolls beyond them. */
  columns?: number;
  cellHeight?: string;
  startEditing?: boolean;
  /** Phone: two columns and the edge of a third, swiped. */
  isPhone?: boolean;
  /**
   * Below the small-screen breakpoint the slot leaves the rail and the ad goes
   * back to its place in the feed, second, after the first post.
   */
  showAdSlot?: boolean;
  /**
   * How the rail's controls sit: a quiet controls row (today), a greeting
   * row that gives Customize and the arrows a title to sit beside, or no
   * row at all, with the arrows floating on the rail's edges and Customize
   * as the rail's last tile.
   */
  header?: 'controls' | 'greeting' | 'floating' | 'none';
  /**
   * Edit mode owned by the page, for entry points that live outside the
   * rail (a toolbar, the feed's tab row, a banner). Controls outside the
   * rail mark themselves `data-rail-overlay`, so clicking them is not read
   * as a click away that ends editing.
   */
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  /** A pencil on each widget's corner on hover: edit starts from the widget. */
  hasHoverEdit?: boolean;
  /** A dashed "Add a widget" tile in view, after the widget at this index. */
  ghostSlotAfter?: number;
  /** Lets an entry point outside the rail add widgets or open the gallery. */
  controllerRef?: React.MutableRefObject<RailController | null>;
  greeting?: { title: string; subtitle: string };
};

/**
 * V1: the widget rail. The reader's widgets in one horizontal row on the
 * feed's columns, with our ad slot locked in second place.
 */
export const WidgetRail = ({
  initialWidgets,
  strips = [],
  isPlus = false,
  columns = 5,
  cellHeight = '13.25rem',
  startEditing = false,
  isPhone = false,
  showAdSlot = true,
  header = 'controls',
  greeting,
  isEditing: controlledEditing,
  onEditingChange,
  hasHoverEdit = false,
  ghostSlotAfter,
  controllerRef,
}: WidgetRailProps): ReactElement => {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [ownEditing, setOwnEditing] = useState(startEditing);
  const isEditing = controlledEditing ?? ownEditing;
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;
  const setIsEditing = useCallback(
    (next: boolean | ((value: boolean) => boolean)) => {
      const value =
        typeof next === 'function' ? next(isEditingRef.current) : next;
      isEditingRef.current = value;
      setOwnEditing(value);
      onEditingChange?.(value);
    },
    [onEditingChange],
  );
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [lifted, setLifted] = useState<{
    id: string;
    startIndex: number;
  } | null>(null);
  const [removed, setRemoved] = useState<{
    widget: RailWidget;
    index: number;
  } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [flashId, setFlashId] = useState<string | null>(null);
  const [edges, setEdges] = useState({ start: false, end: true });
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdTimer = useRef<ReturnType<typeof setTimeout>>();
  const holdOrigin = useRef<{ x: number; y: number } | null>(null);
  const didHold = useRef(false);
  const pressStart = useRef<{
    x: number;
    y: number;
    id: string;
    pointerId: number;
    type: string;
  } | null>(null);
  const focusAfter = useRef<string | null>(null);
  const swapLock = useRef<{ id: string; until: number } | null>(null);
  const lastSwapAt = useRef(0);
  const lastPointer = useRef({ x: 0, y: 0 });
  const heading = useRef(0);
  // Lives outside the drag effect, which re-subscribes on every pointer
  // move: a pointer resting at the rail's edge must keep it scrolling.
  const autoScroll = useRef({ speed: 0, since: 0 });
  const lastMove = useRef<{ from: number; x: number; y: number } | null>(null);

  const remember = useFlip(grid, [widgets, isEditing]);
  const [resizing, setResizing] = useState<{
    id: string;
    corner: Corner;
    width: number;
    height: number;
  } | null>(null);
  const resizeStart = useRef<{
    id: string;
    kind: WidgetKind;
    corner: Corner;
    x: number;
    y: number;
    width: number;
    height: number;
    unitWidth: number;
    unitHeight: number;
    columnGap: number;
    rowGap: number;
  } | null>(null);

  // The ad slot is not in the reader's list: it is placed second on render,
  // so no reorder, add or remove can ever move it.
  const items: (RailWidget | typeof AD_ID)[] = showAdSlot
    ? [...widgets.slice(0, 1), AD_ID, ...widgets.slice(1)]
    : widgets;
  const total = items.length;
  const positionOf = (index: number) =>
    showAdSlot && index >= 1 ? index + 2 : index + 1;
  const nameOf = (id: string) =>
    widgetCatalog[
      widgets.find((widget) => widget.id === id)?.kind ?? 'happening'
    ].name;

  const updateEdges = useCallback(() => {
    const node = scroller.current;
    if (!node) {
      return;
    }
    setEdges({
      start: node.scrollLeft > 4,
      end: node.scrollLeft + node.clientWidth < node.scrollWidth - 4,
    });
    remember();
  }, [remember]);

  useEffect(() => {
    updateEdges();
  }, [updateEdges, widgets, isEditing]);

  useEffect(() => {
    if (!flashId) {
      return undefined;
    }
    const timer = setTimeout(() => setFlashId(null), 700);
    return () => clearTimeout(timer);
  }, [flashId]);

  // Focus follows the widget the reader just moved, resized, added or
  // restored, and is scrolled into view if it left the rail's window.
  useEffect(() => {
    if (!focusAfter.current) {
      return;
    }
    const target = grid.current?.querySelector<HTMLElement>(
      `[data-flip-id="${focusAfter.current}"]`,
    );
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
    focusAfter.current = null;
  });

  const scrollByPage = (direction: 1 | -1) =>
    scroller.current?.scrollBy({
      left: direction * scroller.current.clientWidth * 0.85,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });

  /* ---------------- actions ---------------- */

  const move = useCallback((id: string, toIndex: number) => {
    setWidgets((current) => {
      const from = current.findIndex((widget) => widget.id === id);
      const to = Math.max(0, Math.min(current.length - 1, toIndex));
      if (from === -1 || from === to) {
        return current;
      }
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const resize = (id: string, size: WidgetSize) => {
    setWidgets((current) =>
      current.map((widget) =>
        widget.id === id ? { ...widget, size } : widget,
      ),
    );
    focusAfter.current = id;
    setAnnouncement(`${nameOf(id)} is now ${sizeLabel[size]}.`);
  };

  /*
   * Corner resize: the outline follows the pointer exactly, while the widget
   * itself snaps to a size as soon as the outline passes halfway into the
   * next cell, and its neighbours reflow around it. Letting go keeps the
   * snapped size; the outline just fades.
   */
  const onResizeStart = (
    event: React.PointerEvent,
    widget: RailWidget,
    corner: Corner,
  ) => {
    if (event.button !== 0) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    const item = (event.currentTarget as HTMLElement).closest<HTMLElement>(
      '[data-flip-id]',
    );
    const gridNode = grid.current;
    if (!item || !gridNode) {
      return;
    }
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const rect = item.getBoundingClientRect();
    const styles = getComputedStyle(gridNode);
    const columnGap = parseFloat(styles.columnGap) || 0;
    const rowGap = parseFloat(styles.rowGap) || 0;
    const { cols, rows } = sizeSpan[widget.size];
    resizeStart.current = {
      id: widget.id,
      kind: widget.kind,
      corner,
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height,
      unitWidth: (rect.width - columnGap * (cols - 1)) / cols,
      unitHeight: (rect.height - rowGap * (rows - 1)) / rows,
      columnGap,
      rowGap,
    };
    setResizing({
      id: widget.id,
      corner,
      width: rect.width,
      height: rect.height,
    });
  };

  const onResizeMove = (event: React.PointerEvent) => {
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
    const cols = width > start.unitWidth * 1.5 + start.columnGap / 2 ? 2 : 1;
    const rows = height > start.unitHeight * 1.5 + start.rowGap / 2 ? 2 : 1;
    const next = sizeForFootprint(start.kind, cols, rows);
    setWidgets((current) =>
      current.map((widget) =>
        widget.id === start.id && widget.size !== next
          ? { ...widget, size: next }
          : widget,
      ),
    );
    setResizing({ id: start.id, corner: start.corner, width, height });
  };

  const onResizeEnd = () => {
    const start = resizeStart.current;
    if (!start) {
      return;
    }
    resizeStart.current = null;
    setResizing(null);
    const size = widgets.find((widget) => widget.id === start.id)?.size;
    if (size) {
      setAnnouncement(`${nameOf(start.id)} is now ${sizeLabel[size]}.`);
    }
  };

  const remove = (id: string) => {
    const index = widgets.findIndex((widget) => widget.id === id);
    if (index === -1) {
      return;
    }
    const neighbour = widgets[index + 1] ?? widgets[index - 1];
    focusAfter.current = neighbour?.id ?? null;
    setRemoved({ widget: widgets[index], index });
    setWidgets((current) => current.filter((widget) => widget.id !== id));
    setAnnouncement(`${nameOf(id)} removed. Undo is available.`);
  };

  const undo = () => {
    if (!removed) {
      return;
    }
    setWidgets((current) => {
      const next = [...current];
      next.splice(removed.index, 0, removed.widget);
      return next;
    });
    setFlashId(removed.widget.id);
    focusAfter.current = removed.widget.id;
    setAnnouncement(`${widgetCatalog[removed.widget.kind].name} restored.`);
    setRemoved(null);
  };

  useEffect(() => {
    if (!removed) {
      return undefined;
    }
    const timer = setTimeout(() => setRemoved(null), UNDO_MS);
    return () => clearTimeout(timer);
  }, [removed]);

  const add = (kind: WidgetKind, size: WidgetSize) => {
    const sizes = allowedSizes(kind);
    const widget = rw(kind, sizes.includes(size) ? size : sizes[0]);
    setWidgets((current) => [...current, widget]);
    setFlashId(widget.id);
    focusAfter.current = widget.id;
    setIsGalleryOpen(false);
    setAnnouncement(
      `${widgetCatalog[kind].name} added at position ${total + 1} of ${
        total + 1
      }.`,
    );
  };

  if (controllerRef) {
    controllerRef.current = {
      add: (kind, size) => {
        setIsEditing(true);
        add(kind, size);
      },
      openGallery: () => {
        setIsEditing(true);
        setIsGalleryOpen(true);
      },
      kinds: widgets.map((widget) => widget.kind),
    };
  }

  const runMenu = (id: string, action: MenuAction) => {
    const index = widgets.findIndex((widget) => widget.id === id);
    if (action.type === 'size') {
      resize(id, action.size);
      return;
    }
    if (action.type === 'remove') {
      remove(id);
      return;
    }
    const to = Math.max(
      0,
      Math.min(
        widgets.length - 1,
        {
          start: 0,
          left: index - 1,
          right: index + 1,
          end: widgets.length - 1,
        }[action.to],
      ),
    );
    move(id, to);
    setFlashId(id);
    focusAfter.current = id;
    setAnnouncement(
      `${nameOf(id)} moved from position ${positionOf(index)} to ${positionOf(
        to,
      )} of ${total}.`,
    );
  };

  /* ---------------- pointer drag ---------------- */

  const startDrag = (
    id: string,
    pointerId: number,
    clientX: number,
    clientY: number,
  ) => {
    const element = grid.current?.querySelector<HTMLElement>(
      `[data-flip-id="${id}"]`,
    );
    if (!element) {
      return;
    }
    const rect = element.getBoundingClientRect();
    swapLock.current = null;
    lastMove.current = null;
    lastPointer.current = { x: clientX, y: clientY };
    heading.current = 0;
    autoScroll.current = { speed: 0, since: 0 };
    setDrag({
      id,
      pointerId,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
      width: rect.width,
      height: rect.height,
      x: clientX,
      y: clientY,
      startIndex: widgets.findIndex((widget) => widget.id === id),
    });
    setAnnouncement(`Picked up ${nameOf(id)}.`);
  };

  useEffect(() => {
    if (!drag || drag.settleTo) {
      return undefined;
    }
    /*
     * Reorders when the dragged widget's center rests over another one. Runs
     * on every pointer move, and on every auto-scroll frame, since a rail
     * scrolling under a still pointer moves widgets under it too.
     */
    const reorderAt = (
      clientX: number,
      clientY: number,
      dx: number,
      dy: number,
    ) => {
      // Swap on the dragged widget's center, not the cursor, so a grab near
      // an edge does not twitch the neighbours. Hit-testing reads layout
      // offsets, which ignore the reflow animation's transforms: a neighbour
      // still sliding past the pointer is not a target.
      const gridNode = grid.current;
      if (gridNode) {
        const origin = gridNode.getBoundingClientRect();
        const centerX = clientX - drag.offsetX + drag.width / 2 - origin.left;
        const centerY = clientY - drag.offsetY + drag.height / 2 - origin.top;
        const target = Array.from(
          gridNode.querySelectorAll<HTMLElement>('[data-flip-id]'),
        ).find(
          (element) =>
            element.dataset.flipId !== drag.id &&
            element.dataset.flipId !== AD_ID &&
            centerX >= element.offsetLeft &&
            centerX < element.offsetLeft + element.offsetWidth &&
            centerY >= element.offsetTop &&
            centerY < element.offsetTop + element.offsetHeight,
        );
        const targetId = target?.dataset.flipId;
        const now = performance.now();
        // The widget just traded with stays locked until the center leaves
        // it; a second swap never lands while the first one's reflow plays;
        // and undoing the last move needs real travel, not a jitter, so a
        // Small and a Large (or the dense grid refilling a gap) cannot flip
        // the row back and forth under a still pointer.
        if (swapLock.current && swapLock.current.id !== targetId) {
          swapLock.current = null;
        }
        const fromIndex = widgets.findIndex((widget) => widget.id === drag.id);
        const toIndex = targetId
          ? widgets.findIndex((widget) => widget.id === targetId)
          : -1;
        const last = lastMove.current;
        // Only targets the pointer is heading towards count. A dense grid
        // refills the gap a move leaves, so the slot just vacated can land
        // a widget from behind under the pointer; accepting it would undo
        // the move. Stacked Smalls still swap on a vertical move.
        if (Math.abs(dx) > 1) {
          heading.current = Math.sign(dx);
        }
        const isVertical = Math.abs(dy) > Math.abs(dx);
        const isAhead =
          isVertical ||
          heading.current === 0 ||
          Math.sign(toIndex - fromIndex) === heading.current;
        const isReversal =
          !!last &&
          toIndex === last.from &&
          Math.hypot(clientX - last.x, clientY - last.y) < REVERSE_DISTANCE;
        if (
          toIndex !== -1 &&
          toIndex !== fromIndex &&
          !swapLock.current &&
          now - lastSwapAt.current > SWAP_SETTLE_MS &&
          isAhead &&
          !isReversal
        ) {
          move(drag.id, toIndex);
          swapLock.current = { id: targetId as string, until: now };
          lastSwapAt.current = now;
          lastMove.current = {
            from: fromIndex,
            x: clientX,
            y: clientY,
          };
        }
      }
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== drag.pointerId) {
        return;
      }
      setDrag(
        (current) =>
          current && { ...current, x: event.clientX, y: event.clientY },
      );
      reorderAt(
        event.clientX,
        event.clientY,
        event.clientX - lastPointer.current.x,
        event.clientY - lastPointer.current.y,
      );
      lastPointer.current = { x: event.clientX, y: event.clientY };
      // Auto-scroll near the rail's ends, faster the closer to the edge.
      const node = scroller.current;
      if (node) {
        const bounds = node.getBoundingClientRect();
        const fromStart = event.clientX - bounds.left;
        const fromEnd = bounds.right - event.clientX;
        const previous = autoScroll.current.speed;
        let speed = 0;
        if (fromStart < AUTO_SCROLL_ZONE) {
          speed = -((AUTO_SCROLL_ZONE - fromStart) / AUTO_SCROLL_ZONE);
        } else if (fromEnd < AUTO_SCROLL_ZONE) {
          speed = (AUTO_SCROLL_ZONE - fromEnd) / AUTO_SCROLL_ZONE;
        }
        autoScroll.current = {
          speed,
          since:
            !previous && speed ? performance.now() : autoScroll.current.since,
        };
      }
    };
    let raf = 0;
    const frame = (now: number) => {
      const { speed, since } = autoScroll.current;
      if (speed && scroller.current) {
        // And faster the longer it stays there, so it starts gently.
        const ramp = Math.min(1, (now - since) / 600);
        scroller.current.scrollLeft += speed * (4 + 16 * ramp);
        // The rail moving under the pointer reads as the pointer moving
        // the other way along it.
        reorderAt(lastPointer.current.x, lastPointer.current.y, speed * 2, 0);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onUp = () => {
      autoScroll.current = { speed: 0, since: 0 };
      const element = grid.current?.querySelector<HTMLElement>(
        `[data-flip-id="${drag.id}"]`,
      );
      const rect = element?.getBoundingClientRect();
      if (!rect || prefersReducedMotion()) {
        setDrag(null);
      } else {
        setDrag(
          (current) =>
            current && {
              ...current,
              settleTo: {
                x: rect.left + current.offsetX,
                y: rect.top + current.offsetY,
              },
            },
        );
      }
      const index = widgets.findIndex((widget) => widget.id === drag.id);
      setFlashId(drag.id);
      setAnnouncement(
        `${nameOf(drag.id)} dropped, moved from position ${positionOf(
          drag.startIndex,
        )} to ${positionOf(index)} of ${total}.`,
      );
    };
    const onCancel = () => {
      autoScroll.current = { speed: 0, since: 0 };
      move(drag.id, drag.startIndex);
      setDrag(null);
      setAnnouncement('Move cancelled.');
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, move, widgets, total]);

  useEffect(() => {
    if (!drag?.settleTo) {
      return undefined;
    }
    const timer = setTimeout(() => setDrag(null), 200);
    return () => clearTimeout(timer);
  }, [drag?.settleTo]);

  /*
   * On touch screens, the iOS way in: press and hold any widget and the rail
   * enters edit mode. A hold that turns into a swipe is let go, and the tap
   * a completed hold would fire is swallowed. Desktop gets explicit
   * controls instead; a hidden hold is not discoverable with a mouse.
   */
  const startHoldToEdit = (event: React.PointerEvent) => {
    if (event.pointerType !== 'touch') {
      return;
    }
    const origin = { x: event.clientX, y: event.clientY };
    holdOrigin.current = origin;
    clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      holdOrigin.current = null;
      didHold.current = true;
      setIsEditing(true);
      setAnnouncement('Editing widgets. Drag to reorder, Esc when done.');
    }, HOLD_TO_EDIT_MS);
  };

  const cancelHoldToEdit = (event?: React.PointerEvent) => {
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

  const onItemPointerDown = (event: React.PointerEvent, id: string) => {
    if (!isEditing) {
      startHoldToEdit(event);
      return;
    }
    if (event.button !== 0) {
      return;
    }
    pressStart.current = {
      x: event.clientX,
      y: event.clientY,
      id,
      pointerId: event.pointerId,
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

  const onItemPointerMove = (event: React.PointerEvent) => {
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
    clearTimeout(pressTimer.current);
    pressStart.current = null;
  };

  /* ---------------- keyboard ---------------- */

  const onItemKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (!isEditing || event.target !== event.currentTarget) {
      return;
    }
    const index = widgets.findIndex((widget) => widget.id === id);
    const name = nameOf(id);
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (lifted?.id === id) {
        setLifted(null);
        setFlashId(id);
        setAnnouncement(
          `${name} dropped, moved from position ${positionOf(
            lifted.startIndex,
          )} to ${positionOf(index)} of ${total}.`,
        );
      } else {
        setLifted({ id, startIndex: index });
        setAnnouncement(
          `${name} picked up at position ${positionOf(
            index,
          )} of ${total}. Arrow keys move it, space drops it, escape cancels.`,
        );
      }
      return;
    }
    if (
      lifted?.id === id &&
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
      move(id, to);
      focusAfter.current = id;
      const skipped =
        showAdSlot && ((index === 0 && to === 1) || (index === 1 && to === 0));
      setAnnouncement(
        `${name}, position ${positionOf(to)} of ${total}.${
          skipped ? ' The sponsored slot stays second.' : ''
        }`,
      );
      return;
    }
    if (!lifted && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      remove(id);
    }
  };

  // Escape: cancel a keyboard move, close the gallery, then leave edit mode.
  // A click outside the rail leaves edit mode too.
  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (lifted) {
        move(lifted.id, lifted.startIndex);
        focusAfter.current = lifted.id;
        setLifted(null);
        setAnnouncement('Move cancelled.');
      } else if (isGalleryOpen) {
        setIsGalleryOpen(false);
      } else {
        setIsEditing(false);
      }
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (
        !root.current?.contains(target) &&
        !target.closest('[data-rail-overlay]')
      ) {
        setIsEditing(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [isEditing, isGalleryOpen, lifted, move]);

  /*
   * The slot before the ad is one column the hero's full height, and one
   * Small cannot fill it: the grid would pull a widget from behind the ad
   * into the hole and the whole row would jump. A Small there shows as
   * Tall, and goes back to Small when it moves on.
   */
  const shownSize = (widget: RailWidget, index: number): WidgetSize => {
    if (!showAdSlot || index !== 0 || widget.size !== 's') {
      return widget.size;
    }
    return (
      allowedSizes(widget.kind).find((option) => option !== 's') ?? widget.size
    );
  };

  const draggedWidget = drag
    ? widgets.find((widget) => widget.id === drag.id)
    : undefined;
  const isEmpty = widgets.length === 0;

  return (
    <div ref={root} className="group/rail relative flex flex-col gap-3">
      <style>{railCss}</style>
      {header !== 'none' && (header !== 'floating' || isEditing) && (
        <div
          className={classNames(
            'flex items-center gap-2',
            header === 'greeting' ? 'min-h-12' : 'min-h-8',
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col">
            {header === 'greeting' && greeting && (
              <span className="truncate font-bold text-text-primary typo-title3">
                {greeting.title}
              </span>
            )}
            {isEditing ? (
              <span className="rail-controls-in inline-block text-text-tertiary typo-caption1">
                Drag to reorder, drag a corner to resize, or use each widget’s
                menu. The second slot is ours. Esc when done.
              </span>
            ) : (
              header === 'greeting' &&
              greeting && (
                <span className="truncate text-text-tertiary typo-footnote">
                  {greeting.subtitle}
                </span>
              )
            )}
          </div>
          {!isPhone && header !== 'floating' && (
            <div
              className={classNames(
                'flex items-center gap-1',
                header === 'controls' &&
                  'opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/rail:opacity-100',
              )}
            >
              {(['start', 'end'] as const).map((side) => (
                <Button
                  key={side}
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={
                    <ArrowIcon
                      className={side === 'start' ? '-rotate-90' : 'rotate-90'}
                    />
                  }
                  aria-label={
                    side === 'start'
                      ? 'Scroll widgets left'
                      : 'Scroll widgets right'
                  }
                  disabled={!edges[side]}
                  onClick={() => scrollByPage(side === 'start' ? -1 : 1)}
                />
              ))}
            </div>
          )}
          <CustomizeButton
            isEditing={isEditing}
            onClick={() => {
              setIsEditing((value) => !value);
              setIsGalleryOpen(false);
              setLifted(null);
            }}
          />
        </div>
      )}
      {(header === 'floating' || header === 'none') &&
        !isPhone &&
        (['start', 'end'] as const).map((side) => (
          <span
            key={side}
            className={classNames(
              'absolute bottom-0 top-0 z-3 flex items-center opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover/rail:opacity-100',
              side === 'start' ? '-left-4' : '-right-4',
              !edges[side] && 'pointer-events-none !opacity-0',
            )}
          >
            <Button
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              className="shadow-2"
              icon={
                <ArrowIcon
                  className={side === 'start' ? '-rotate-90' : 'rotate-90'}
                />
              }
              aria-label={
                side === 'start'
                  ? 'Scroll widgets left'
                  : 'Scroll widgets right'
              }
              onClick={() => scrollByPage(side === 'start' ? -1 : 1)}
            />
          </span>
        ))}
      <div
        ref={scroller}
        role="region"
        aria-label="Your widgets"
        onScroll={updateEdges}
        className={classNames(
          'no-scrollbar -mx-2 overflow-x-auto overscroll-x-contain px-2 py-3',
          !drag && 'snap-x snap-mandatory',
        )}
        style={{
          scrollPaddingInline: '0.5rem',
          maskImage: `linear-gradient(to right, ${
            edges.start ? 'transparent' : 'black'
          }, black 2.5rem, black calc(100% - 2.5rem), ${
            edges.end ? 'transparent' : 'black'
          })`,
        }}
      >
        <div
          ref={grid}
          className={classNames(
            'relative grid grid-flow-col-dense',
            isPhone ? 'gap-3' : 'gap-x-8 gap-y-4',
          )}
          style={{
            gridTemplateRows: `repeat(2, ${cellHeight})`,
            // A phone shows one column and the edge of the next, so the rail
            // always says it scrolls and real cards keep a readable width.
            gridAutoColumns: isPhone
              ? 'calc((100% - 0.75rem) / 1.18)'
              : `calc((100% - ${(columns - 1) * 2}rem) / ${columns})`,
          }}
        >
          {items.map((item, position) => {
            if (item === AD_ID) {
              return (
                <div
                  key={AD_ID}
                  data-flip-id={AD_ID}
                  aria-label="Sponsored, always second"
                  className="flex min-h-0 snap-start"
                  style={spanStyle('m')}
                >
                  <AdSlot
                    className="flex-1"
                    strips={strips}
                    isPlus={isPlus}
                    isEditing={isEditing}
                  />
                </div>
              );
            }
            const index = widgets.indexOf(item);
            const isDragging = drag?.id === item.id;
            const isLifted = lifted?.id === item.id;
            const def = widgetCatalog[item.kind];
            const size = shownSize(item, index);
            return (
              <React.Fragment key={item.id}>
                <div
                  key={item.id}
                  data-flip-id={item.id}
                  role={isEditing ? 'button' : undefined}
                  aria-roledescription={
                    isEditing ? 'sortable widget' : undefined
                  }
                  aria-label={
                    isEditing
                      ? `${def.name}, ${sizeLabel[size]}, position ${
                          position + 1
                        } of ${total}`
                      : undefined
                  }
                  tabIndex={isEditing ? 0 : undefined}
                  onKeyDown={(event) => onItemKeyDown(event, item.id)}
                  onPointerDown={(event) => onItemPointerDown(event, item.id)}
                  onPointerMove={(event) => {
                    cancelHoldToEdit(event);
                    onItemPointerMove(event);
                  }}
                  onPointerUp={(event) => {
                    cancelHoldToEdit();
                    onItemPointerUp();
                  }}
                  onPointerCancel={() => cancelHoldToEdit()}
                  onClickCapture={(event) => {
                    if (didHold.current) {
                      didHold.current = false;
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  style={
                    {
                      ...spanStyle(size),
                      '--stack-inset': isEditing ? '2rem' : '0px',
                    } as CSSProperties
                  }
                  className={classNames(
                    'group/rail-item relative flex min-h-0 min-w-0 snap-start rounded-16 outline-none',
                    isEditing &&
                      !drag &&
                      !isLifted &&
                      resizing?.id !== item.id &&
                      'rail-jiggle cursor-grab',
                    isEditing && 'select-none',
                    flashId === item.id && 'rail-flash',
                    isLifted &&
                      'z-2 scale-[1.03] shadow-3 transition-transform duration-150',
                    'focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                  )}
                >
                  {isDragging ? (
                    <div className="flex-1 rounded-16 border-2 border-dashed border-border-subtlest-secondary bg-surface-float" />
                  ) : (
                    <WidgetSurface
                      className="flex-1"
                      isBare={isCardWidget(item.kind, size)}
                    >
                      <WidgetContent kind={item.kind} size={size} />
                    </WidgetSurface>
                  )}
                  {hasHoverEdit && !isEditing && (
                    <button
                      type="button"
                      aria-label={`Edit widgets, starting with ${def.name}`}
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        focusAfter.current = item.id;
                        setIsEditing(true);
                      }}
                      className="absolute -left-2 -top-2 z-3 flex size-7 items-center justify-center rounded-max bg-text-primary text-surface-invert opacity-0 shadow-2 transition-opacity duration-150 focus-visible:opacity-100 group-hover/rail-item:opacity-100"
                    >
                      <EditIcon size={IconSize.Size16} />
                    </button>
                  )}
                  {isEditing && !isDragging && (
                    <WidgetMenu
                      widget={item}
                      canMoveLeft={index > 0}
                      canMoveRight={index < widgets.length - 1}
                      onAction={(action) => runMenu(item.id, action)}
                    />
                  )}
                  {isEditing && !isDragging && (
                    <>
                      <button
                        type="button"
                        aria-label={`Remove ${def.name}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => remove(item.id)}
                        className="rail-controls-in absolute -left-2 -top-2 z-2 flex size-6 items-center justify-center rounded-max bg-text-primary text-surface-invert shadow-2"
                      >
                        <MinusIcon size={IconSize.Size16} />
                      </button>
                      {allowedSizes(item.kind).length > 1 &&
                        (['tr', 'br', 'bl'] as Corner[]).map((corner) => (
                          <ResizeHandle
                            key={corner}
                            corner={corner}
                            onPointerDown={(event) =>
                              onResizeStart(event, { ...item, size }, corner)
                            }
                            onPointerMove={onResizeMove}
                            onPointerUp={onResizeEnd}
                          />
                        ))}
                      {resizing?.id === item.id && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute z-2 rounded-16 border-2 border-accent-cabbage-default bg-accent-cabbage-default/[0.08]"
                          style={{
                            ...cornerAnchor[resizing.corner],
                            width: resizing.width,
                            height: resizing.height,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
                {ghostSlotAfter === index && !isEditing && (
                  <button
                    type="button"
                    data-rail-overlay
                    onClick={() => {
                      setIsEditing(true);
                      setIsGalleryOpen(true);
                    }}
                    style={spanStyle('m')}
                    className="flex snap-start flex-col items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:border-border-subtlest-primary hover:bg-surface-hover hover:text-text-primary"
                  >
                    <PlusIcon size={IconSize.Medium} />
                    <span className="font-bold typo-footnote">
                      Add a widget
                    </span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
          {header === 'floating' && !isEditing && !isEmpty && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={spanStyle('s')}
              className="flex snap-start flex-col items-center justify-center gap-2 self-start rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <EditIcon size={IconSize.Medium} />
              <span className="font-bold typo-footnote">Customize</span>
            </button>
          )}
          {(isEditing || isEmpty) && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setIsGalleryOpen(true);
              }}
              style={spanStyle('m')}
              className="rail-controls-in flex snap-start flex-col items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-secondary text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <PlusIcon size={IconSize.Medium} />
              <span className="font-bold typo-footnote">Add widgets</span>
            </button>
          )}
        </div>
      </div>

      {drag && draggedWidget && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-max flex"
          style={{
            left: (drag.settleTo?.x ?? drag.x) - drag.offsetX,
            top: (drag.settleTo?.y ?? drag.y) - drag.offsetY,
            width: drag.width,
            height: drag.height,
            transform: drag.settleTo ? 'none' : 'scale(1.03)',
            transition: drag.settleTo
              ? `left 200ms ${EASE}, top 200ms ${EASE}, transform 200ms ${EASE}, box-shadow 200ms ${EASE}`
              : `transform 150ms ${EASE}`,
            boxShadow: drag.settleTo
              ? 'none'
              : '0 0 0 1px rgb(255 255 255 / 0.06), 0 12px 32px -8px rgb(0 0 0 / 0.5), 0 24px 48px -12px rgb(0 0 0 / 0.4)',
            borderRadius: '1rem',
          }}
        >
          <WidgetSurface
            className="flex-1"
            isBare={isCardWidget(draggedWidget.kind, draggedWidget.size)}
          >
            <WidgetContent
              kind={draggedWidget.kind}
              size={draggedWidget.size}
            />
          </WidgetSurface>
        </div>
      )}

      {isGalleryOpen && (
        <div data-rail-overlay>
          <button
            type="button"
            aria-label="Close the gallery"
            onClick={() => setIsGalleryOpen(false)}
            className="fixed inset-0 z-max bg-overlay-quaternary-onion"
          />
          <div className="rail-sheet fixed inset-x-0 bottom-0 z-max mx-auto max-h-[75vh] w-full max-w-[46rem] overflow-y-auto rounded-t-24 shadow-3">
            <WidgetGallery
              onAdd={add}
              addedKinds={widgets.map((widget) => widget.kind)}
              hiddenKinds={['ad']}
              className="rounded-b-none"
            />
            <button
              type="button"
              onClick={() => setIsGalleryOpen(false)}
              className="absolute right-5 top-5 h-8 rounded-10 bg-surface-float px-3 font-bold text-text-secondary typo-footnote"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {removed && (
        <div
          data-rail-overlay
          className="rail-toast fixed bottom-6 left-1/2 z-max flex items-center gap-3 rounded-14 bg-text-primary px-4 py-2.5 text-surface-invert shadow-3"
        >
          <span className="typo-footnote">
            {widgetCatalog[removed.widget.kind].name} removed
          </span>
          <button
            type="button"
            onClick={undo}
            className="font-bold underline typo-footnote"
          >
            Undo
          </button>
        </div>
      )}

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
};
