import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const PREVIEW_MIN_WIDTH = 360;
const PREVIEW_RESTORE_WIDTH = 380;
const FLOATING_PREVIEW_ANIMATION_MS = 300;
const TABLET_TOGGLE_SETTLE_MS = 350;
const REM_IN_PX = 16;

// Post content fixed column (matches grid-cols-[22rem_...] on laptop)
const POST_COLUMN_REM = 22;
// Widgets sidebar width (matches w-[21.25rem] on laptop)
const WIDGETS_COLUMN_REM = 21.25;

const PREVIEW_LAYOUT_MIN_WIDTH =
  (POST_COLUMN_REM + WIDGETS_COLUMN_REM) * REM_IN_PX + PREVIEW_MIN_WIDTH;

export enum FloatingPreviewPhase {
  Hidden = 'hidden',
  Entering = 'entering',
  Visible = 'visible',
  Exiting = 'exiting',
}

interface UseArticlePreviewPanelOptions {
  postId: string;
  isEnabled: boolean;
  isTablet: boolean;
  isLaptop: boolean;
}

interface UseArticlePreviewPanelResult {
  layoutRef: MutableRefObject<HTMLDivElement | null>;
  columnRef: MutableRefObject<HTMLDivElement | null>;
  isDismissed: boolean;
  isUnavailable: boolean;
  isMobileOpen: boolean;
  isPreviewNarrow: boolean;
  isPreviewFloating: boolean;
  floatingPhase: FloatingPreviewPhase;
  isTabletToggling: boolean;
  shouldShowColumn: boolean;
  toggle: () => void;
  markUnavailable: () => void;
  closeMobile: () => void;
}

export const useArticlePreviewPanel = ({
  postId,
  isEnabled,
  isTablet,
  isLaptop,
}: UseArticlePreviewPanelOptions): UseArticlePreviewPanelResult => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPreviewNarrow, setIsPreviewNarrow] = useState(false);
  const [isTabletToggling, setIsTabletToggling] = useState(false);
  const [floatingPhase, setFloatingPhase] = useState<FloatingPreviewPhase>(
    FloatingPreviewPhase.Hidden,
  );

  const layoutRef = useRef<HTMLDivElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const ignoreResizeRef = useRef(false);
  const resizeResetTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const floatingCloseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const floatingEnterFrameRef = useRef<number>();

  const shouldShowColumn = isEnabled && !isDismissed;
  const isPreviewFloating = isLaptop && shouldShowColumn && isPreviewNarrow;

  const evaluateWidth = useCallback((width: number) => {
    setIsPreviewNarrow((prev) => {
      if (!prev && width < PREVIEW_MIN_WIDTH) {
        return true;
      }
      if (prev && width >= PREVIEW_RESTORE_WIDTH) {
        return false;
      }
      return prev;
    });
  }, []);

  const clearFloatingTimers = useCallback(() => {
    if (floatingCloseTimeoutRef.current) {
      globalThis.clearTimeout(floatingCloseTimeoutRef.current);
      floatingCloseTimeoutRef.current = undefined;
    }
    if (floatingEnterFrameRef.current) {
      globalThis.cancelAnimationFrame(floatingEnterFrameRef.current);
      floatingEnterFrameRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearFloatingTimers();
      if (resizeResetTimeoutRef.current) {
        globalThis.clearTimeout(resizeResetTimeoutRef.current);
      }
    };
  }, [clearFloatingTimers]);

  useEffect(() => {
    clearFloatingTimers();
    setIsDismissed(false);
    setIsUnavailable(false);
    setIsMobileOpen(false);
    setIsPreviewNarrow(false);
    setIsTabletToggling(false);
    setFloatingPhase(FloatingPreviewPhase.Hidden);
  }, [postId, clearFloatingTimers]);

  useEffect(() => {
    clearFloatingTimers();

    if (isPreviewFloating) {
      setFloatingPhase(FloatingPreviewPhase.Entering);
      floatingEnterFrameRef.current = globalThis.requestAnimationFrame(() => {
        setFloatingPhase(FloatingPreviewPhase.Visible);
      });
      return;
    }

    setFloatingPhase((prev) => {
      if (prev === FloatingPreviewPhase.Hidden) {
        return prev;
      }

      floatingCloseTimeoutRef.current = globalThis.setTimeout(() => {
        setFloatingPhase(FloatingPreviewPhase.Hidden);
      }, FLOATING_PREVIEW_ANIMATION_MS);

      return FloatingPreviewPhase.Exiting;
    });
  }, [clearFloatingTimers, isPreviewFloating]);

  useEffect(() => {
    const node = columnRef.current;

    if (!isLaptop || !shouldShowColumn || !node) {
      setIsPreviewNarrow(false);
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (ignoreResizeRef.current) {
        return;
      }

      const { width } = entry.contentRect;
      if (width < 1) {
        return;
      }

      evaluateWidth(width);
    });

    observer.observe(node);
    if (!ignoreResizeRef.current) {
      evaluateWidth(node.getBoundingClientRect().width);
    }

    return () => observer.disconnect();
  }, [evaluateWidth, isLaptop, shouldShowColumn]);

  const toggle = useCallback(() => {
    if (!isTablet) {
      setIsMobileOpen((prev) => !prev);
      return;
    }

    const isOpening = isDismissed;
    let shouldForceFloating = false;

    if (isOpening && isLaptop) {
      const layoutWidth = layoutRef.current?.getBoundingClientRect().width;
      if (layoutWidth && layoutWidth < PREVIEW_LAYOUT_MIN_WIDTH) {
        setIsPreviewNarrow(true);
        shouldForceFloating = true;
      }
    }

    if (isOpening) {
      clearFloatingTimers();
      setFloatingPhase(FloatingPreviewPhase.Hidden);
    }

    ignoreResizeRef.current = true;
    if (resizeResetTimeoutRef.current) {
      globalThis.clearTimeout(resizeResetTimeoutRef.current);
    }
    resizeResetTimeoutRef.current = globalThis.setTimeout(() => {
      ignoreResizeRef.current = false;
      setIsTabletToggling(false);
      const width = columnRef.current?.getBoundingClientRect().width;
      if (!width || width < 1) {
        setIsPreviewNarrow(false);
        return;
      }
      evaluateWidth(width);
    }, TABLET_TOGGLE_SETTLE_MS);

    setIsDismissed((prev) => !prev);
    if (!shouldForceFloating) {
      setIsPreviewNarrow(false);
    }
    setIsTabletToggling(true);
  }, [clearFloatingTimers, evaluateWidth, isDismissed, isLaptop, isTablet]);

  const markUnavailable = useCallback(() => {
    setIsUnavailable(true);
    setIsDismissed(true);
    setIsMobileOpen(false);
  }, []);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return {
    layoutRef,
    columnRef,
    isDismissed,
    isUnavailable,
    isMobileOpen,
    isPreviewNarrow,
    isPreviewFloating,
    floatingPhase,
    isTabletToggling,
    shouldShowColumn,
    toggle,
    markUnavailable,
    closeMobile,
  };
};
