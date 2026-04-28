import type { DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import { isValidHttpUrl, withHttps } from '../../../lib/links';

/**
 * Drag-to-add drop zone for shortcuts rows.
 *
 * Historically only the small `AddShortcutTile` (the "+" button) listened for
 * external URL drops. That's a ~44px target in a flexible row that can be
 * hundreds of pixels wide, so users dragging a link from the browser's
 * bookmarks bar almost always missed it — and because the rest of the row
 * had no drop listeners, there was no visible "you can drop here" indicator
 * either. This hook turns the entire toolbar container into a single drop
 * target so a drop anywhere on the row counts.
 *
 * Drop lifecycle notes:
 * - `dragenter` / `dragleave` fire on every child boundary the pointer
 *   crosses, so a naive boolean state flickers as the drag moves across
 *   tiles. We use a depth counter: +1 on enter, −1 on leave, indicator is
 *   active while depth > 0. This is the well-known fix for the fact that
 *   `relatedTarget` is unreliable across browsers during a drag.
 * - During `dragenter`/`dragover` the spec disallows reading the dragged
 *   data for security, so we key the "is this a URL?" gate off
 *   `dataTransfer.types`. We only light up for `text/uri-list` at hover
 *   time — every real link-drag source (bookmarks bar, address bar, link
 *   elements) sets it, and gating on it alone avoids false-positive halos
 *   for plain-text drags (selected text, etc). At `drop` time we broaden
 *   to `text/plain` as a fallback since Firefox occasionally only sets
 *   that for link drags initiated from older sources.
 * - `dragover.preventDefault()` is required to make the drop event fire at
 *   all; without it browsers reject the drop as "not a valid target".
 */

// During `dragenter`/`dragover` the spec doesn't let us read the dragged data
// (security), so we pattern-match on `dataTransfer.types` instead. Browsers
// emit `text/uri-list` for real link drags — bookmarks bar, address-bar URL,
// link-to-link tab drags — so that's the only type we accept as a hover
// signal. `text/plain` is too permissive (any selected-text drag advertises
// it), so we save it for a fallback at *drop* time via `extractUrlFromDrop`.
const URL_HOVER_TYPE = 'text/uri-list';

const hasUrlHoverPayload = (event: DragEvent): boolean => {
  const { types } = event.dataTransfer;
  if (!types) {
    return false;
  }
  // `types` is an array-like DOMStringList; avoid `.includes` for older APIs.
  for (let i = 0; i < types.length; i += 1) {
    if (types[i] === URL_HOVER_TYPE) {
      return true;
    }
  }
  return false;
};

const parseUrlLine = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }
  const normalised = withHttps(trimmed);
  return isValidHttpUrl(normalised) ? normalised : null;
};

const extractUrlFromDrop = (event: DragEvent): string | null => {
  const uriList = event.dataTransfer.getData('text/uri-list');
  if (uriList) {
    const fromUriList = uriList
      .split(/\r?\n/)
      .map(parseUrlLine)
      .find((parsed): parsed is string => !!parsed);
    if (fromUriList) {
      return fromUriList;
    }
  }
  const plain = event.dataTransfer.getData('text/plain');
  if (plain) {
    return parseUrlLine(plain);
  }
  return null;
};

export interface ShortcutDropZoneHandlers {
  onDragEnter: (event: DragEvent<HTMLElement>) => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

export interface UseShortcutDropZoneResult {
  isDropTarget: boolean;
  dropHandlers: ShortcutDropZoneHandlers | undefined;
}

export function useShortcutDropZone(
  onDropUrl: ((url: string) => void) | undefined,
  enabled: boolean = true,
): UseShortcutDropZoneResult {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const depthRef = useRef(0);
  const canAccept = !!onDropUrl && enabled;

  const handleDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!canAccept || !hasUrlHoverPayload(event)) {
        return;
      }
      event.preventDefault();
      depthRef.current += 1;
      setIsDropTarget(true);
    },
    [canAccept],
  );

  const handleDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!canAccept || !hasUrlHoverPayload(event)) {
        return;
      }
      // Required to mark the element a valid drop target; without it the
      // browser won't fire `drop` and the copy cursor never appears.
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      event.dataTransfer.dropEffect = 'copy';
      // Safety net: if a drag crosses browser windows or starts inside the
      // zone, `dragenter` can be skipped — keep the indicator on while the
      // pointer is actively hovering the zone.
      if (depthRef.current === 0) {
        depthRef.current = 1;
        setIsDropTarget(true);
      }
    },
    [canAccept],
  );

  const handleDragLeave = useCallback(() => {
    if (!canAccept) {
      return;
    }
    depthRef.current = Math.max(0, depthRef.current - 1);
    if (depthRef.current === 0) {
      setIsDropTarget(false);
    }
  }, [canAccept]);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (!canAccept) {
        return;
      }
      event.preventDefault();
      depthRef.current = 0;
      setIsDropTarget(false);
      const url = extractUrlFromDrop(event);
      if (url && onDropUrl) {
        onDropUrl(url);
      }
    },
    [canAccept, onDropUrl],
  );

  return {
    isDropTarget: canAccept && isDropTarget,
    dropHandlers: canAccept
      ? {
          onDragEnter: handleDragEnter,
          onDragOver: handleDragOver,
          onDragLeave: handleDragLeave,
          onDrop: handleDrop,
        }
      : undefined,
  };
}
