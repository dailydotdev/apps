import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Pointer distance (px) that promotes a pointerdown→pointerup into a drag
 * gesture instead of a click. Shared between dnd-kit's `PointerSensor`
 * `activationConstraint` and per-tile `didPointerTravel` calculations so the
 * "is this a click or a drag?" threshold agrees across layers.
 */
export const DRAG_ACTIVATION_DISTANCE_PX = 5;

/**
 * How long after a drag ends we continue to swallow stray clicks. Chrome
 * occasionally fires a second synthesized click when a drag crosses element
 * boundaries, and the first click can arrive on a different DOM target than
 * the tile the drag started from. 500ms covers both without meaningfully
 * blocking a deliberate follow-up click.
 */
export const POST_DRAG_SUPPRESSION_MS = 500;

/**
 * Shared guard for the "drag ended, browser fires a stray click on pointerup,
 * the click lands on an `<a href>` and navigates the tab" bug that plagues
 * dnd-kit sortable rows of anchor tiles.
 *
 * The previous fix scoped click suppression to the toolbar's `onClickCapture`,
 * which only catches clicks whose DOM target is a descendant of the toolbar.
 * When the user drags a tile *outside* the toolbar (e.g. several hundred pixels
 * to the left into the greeting area) and releases, the tile follows the
 * pointer via CSS transform but the hit-test at pointerup can land on a
 * sibling surface — or the synthetic click React dispatches can be routed to
 * a different root-attached listener before ours fires. A document-level
 * capture-phase listener sits above everything, so a single armed flag
 * reliably swallows the next click regardless of where it lands.
 *
 * Usage:
 *   const { armGuard, onClickCapture } = useDragClickGuard();
 *   <DndContext
 *     onDragStart={armGuard}
 *     onDragCancel={armGuard}
 *     onDragEnd={(event) => { armGuard(); ... }}
 *   />
 *   <div onClickCapture={onClickCapture}>...</div>
 *
 * `onClickCapture` stays wired on the toolbar as a React-side belt; the
 * native document listener is the suspenders.
 */
export function useDragClickGuard(): {
  armGuard: () => void;
  onClickCapture: (event: ReactMouseEvent) => void;
} {
  const activeRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const disarm = useCallback(() => {
    activeRef.current = false;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const armGuard = useCallback(() => {
    activeRef.current = true;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      activeRef.current = false;
      timerRef.current = null;
    }, POST_DRAG_SUPPRESSION_MS);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }
    // Capture phase runs before any React synthetic handler (React attaches
    // its own root listener in the bubble phase, and even with 17+'s root
    // delegation, capture still wins). stopImmediatePropagation keeps any
    // other capture-phase listener on the same target from re-triggering
    // navigation.
    const handler = (event: MouseEvent) => {
      if (!activeRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    document.addEventListener('click', handler, true);
    document.addEventListener('auxclick', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('auxclick', handler, true);
      disarm();
    };
  }, [disarm]);

  const onClickCapture = useCallback((event: ReactMouseEvent) => {
    if (!activeRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return { armGuard, onClickCapture };
}
