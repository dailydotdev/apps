import type { RefObject } from 'react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const STORAGE_KEY_RAIL_OPEN = 'readerModal.railOpen';
const STORAGE_KEY_RAIL_WIDTH_RATIO = 'readerModal.railWidthRatio';
// Legacy pixel-based key, migrated to the ratio key on first read.
const LEGACY_STORAGE_KEY_RAIL_WIDTH_PX = 'readerModal.railWidthPx';

// Persisted rail width is stored as a fraction of the layout container so the
// chosen proportion carries across screen sizes and between the reader modal
// (capped container) and the standalone post page (full-width container).
const DEFAULT_RAIL_WIDTH_RATIO = 0.3;
const MIN_RAIL_WIDTH_RATIO = 0.2;
const MAX_RAIL_WIDTH_RATIO = 0.55;
// Absolute pixel bounds keep the rail usable on very small or very large
// viewports where the ratio alone would produce unreadable widths.
const ABSOLUTE_MIN_RAIL_WIDTH_PX = 320;
const ABSOLUTE_MAX_RAIL_WIDTH_PX = 960;
const FALLBACK_CONTAINER_PX = 1280;

function clampRatio(ratio: number): number {
  return Math.min(MAX_RAIL_WIDTH_RATIO, Math.max(MIN_RAIL_WIDTH_RATIO, ratio));
}

function ratioToPx(ratio: number, container: number): number {
  const raw = Math.round(ratio * container);
  return Math.min(
    ABSOLUTE_MAX_RAIL_WIDTH_PX,
    Math.max(ABSOLUTE_MIN_RAIL_WIDTH_PX, raw),
  );
}

function readRailOpen(): boolean {
  if (typeof globalThis.window === 'undefined') {
    return true;
  }

  try {
    const raw = globalThis.window.localStorage.getItem(STORAGE_KEY_RAIL_OPEN);
    if (raw === null) {
      return true;
    }
    return raw === '1';
  } catch {
    return true;
  }
}

function readRailWidthRatio(legacyBasisPx: number): number {
  if (typeof globalThis.window === 'undefined') {
    return DEFAULT_RAIL_WIDTH_RATIO;
  }

  try {
    const raw = globalThis.window.localStorage.getItem(
      STORAGE_KEY_RAIL_WIDTH_RATIO,
    );
    if (raw) {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) {
        return clampRatio(n);
      }
    }

    const legacyRaw = globalThis.window.localStorage.getItem(
      LEGACY_STORAGE_KEY_RAIL_WIDTH_PX,
    );
    if (legacyRaw) {
      globalThis.window.localStorage.removeItem(
        LEGACY_STORAGE_KEY_RAIL_WIDTH_PX,
      );
      const px = Number.parseInt(legacyRaw, 10);
      if (Number.isFinite(px) && legacyBasisPx > 0) {
        return clampRatio(px / legacyBasisPx);
      }
    }

    return DEFAULT_RAIL_WIDTH_RATIO;
  } catch {
    return DEFAULT_RAIL_WIDTH_RATIO;
  }
}

export function useReaderLayoutPrefs(
  containerRef?: RefObject<HTMLElement | null>,
): {
  isRailOpen: boolean;
  setRailOpen: (open: boolean) => void;
  railWidthPx: number;
  setRailWidthPx: (width: number) => void;
  minRailWidthPx: number;
  maxRailWidthPx: number;
} {
  const [isRailOpen, setRailOpenState] = useState(readRailOpen);
  const [containerWidth, setContainerWidth] = useState(FALLBACK_CONTAINER_PX);
  const [railWidthRatio, setRailWidthRatio] = useState(() =>
    readRailWidthRatio(FALLBACK_CONTAINER_PX),
  );

  useLayoutEffect(() => {
    const node = containerRef?.current;
    if (!node) {
      return undefined;
    }

    const update = () => {
      const width = node.getBoundingClientRect().width;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    update();

    if (typeof globalThis.ResizeObserver === 'undefined') {
      globalThis.window?.addEventListener('resize', update);
      return () => globalThis.window?.removeEventListener('resize', update);
    }

    const observer = new globalThis.ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [containerRef]);

  useEffect(() => {
    try {
      globalThis.window?.localStorage.setItem(
        STORAGE_KEY_RAIL_OPEN,
        isRailOpen ? '1' : '0',
      );
    } catch {
      // ignore quota / private mode
    }
  }, [isRailOpen]);

  useEffect(() => {
    try {
      globalThis.window?.localStorage.setItem(
        STORAGE_KEY_RAIL_WIDTH_RATIO,
        railWidthRatio.toFixed(4),
      );
    } catch {
      // ignore
    }
  }, [railWidthRatio]);

  const setRailOpen = useCallback((open: boolean) => {
    setRailOpenState(open);
  }, []);

  const setRailWidthPx = useCallback(
    (width: number) => {
      if (containerWidth <= 0) {
        return;
      }
      setRailWidthRatio(clampRatio(width / containerWidth));
    },
    [containerWidth],
  );

  const railWidthPx = ratioToPx(railWidthRatio, containerWidth);
  const minRailWidthPx = ratioToPx(MIN_RAIL_WIDTH_RATIO, containerWidth);
  const maxRailWidthPx = ratioToPx(MAX_RAIL_WIDTH_RATIO, containerWidth);

  return {
    isRailOpen,
    setRailOpen,
    railWidthPx,
    setRailWidthPx,
    minRailWidthPx,
    maxRailWidthPx,
  };
}
