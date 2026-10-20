import type { RefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

const FLASH_MS = 700;

/** Overlays that live outside the rail but belong to its edit session. */
const overlaySelector =
  '[data-feed-widget-overlay],[data-radix-popper-content-wrapper],[role="dialog"],[role="menu"]';

/**
 * Edit mode for the rail's menu path: Esc or a click outside the rail and
 * its menus leaves, a widget that just changed flashes, and each change is
 * announced to screen readers.
 */
export const useRailEditMode = ({
  isEditing,
  setIsEditing,
  isGalleryOpen,
  rootRef,
}: {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isGalleryOpen: boolean;
  rootRef: RefObject<HTMLElement>;
}): {
  flashId: string | null;
  flash: (id: string) => void;
  announcement: string;
  setAnnouncement: (message: string) => void;
} => {
  const [flashId, setFlashId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const flash = useCallback((id: string) => setFlashId(id), []);

  useEffect(() => {
    if (!flashId) {
      return undefined;
    }
    const timer = setTimeout(() => setFlashId(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashId]);

  useEffect(() => {
    if (!isEditing) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented && !isGalleryOpen) {
        setIsEditing(false);
      }
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
  }, [isEditing, isGalleryOpen, rootRef, setIsEditing]);

  return { flashId, flash, announcement, setAnnouncement };
};
