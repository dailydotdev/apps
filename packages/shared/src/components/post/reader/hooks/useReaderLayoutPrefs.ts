import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_RAIL_OPEN = 'readerModal.railOpen';
const STORAGE_KEY_RAIL_WIDTH = 'readerModal.railWidthPx';

const DEFAULT_RAIL_WIDTH_PX = 356;
const MIN_RAIL_WIDTH_PX = 356;
const MAX_RAIL_WIDTH_PX = 720;

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

function readRailWidth(): number {
  if (typeof globalThis.window === 'undefined') {
    return DEFAULT_RAIL_WIDTH_PX;
  }

  try {
    const raw = globalThis.window.localStorage.getItem(STORAGE_KEY_RAIL_WIDTH);
    if (!raw) {
      return DEFAULT_RAIL_WIDTH_PX;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) {
      return DEFAULT_RAIL_WIDTH_PX;
    }
    return Math.min(MAX_RAIL_WIDTH_PX, Math.max(MIN_RAIL_WIDTH_PX, n));
  } catch {
    return DEFAULT_RAIL_WIDTH_PX;
  }
}

export function useReaderLayoutPrefs(): {
  isRailOpen: boolean;
  setRailOpen: (open: boolean) => void;
  railWidthPx: number;
  setRailWidthPx: (width: number) => void;
  minRailWidthPx: number;
  maxRailWidthPx: number;
} {
  const [isRailOpen, setRailOpenState] = useState(readRailOpen);
  const [railWidthPx, setRailWidthState] = useState(readRailWidth);

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
        STORAGE_KEY_RAIL_WIDTH,
        String(railWidthPx),
      );
    } catch {
      // ignore
    }
  }, [railWidthPx]);

  const setRailOpen = useCallback((open: boolean) => {
    setRailOpenState(open);
  }, []);

  const setRailWidthPx = useCallback((width: number) => {
    setRailWidthState(
      Math.min(MAX_RAIL_WIDTH_PX, Math.max(MIN_RAIL_WIDTH_PX, width)),
    );
  }, []);

  return {
    isRailOpen,
    setRailOpen,
    railWidthPx,
    setRailWidthPx,
    minRailWidthPx: MIN_RAIL_WIDTH_PX,
    maxRailWidthPx: MAX_RAIL_WIDTH_PX,
  };
}
