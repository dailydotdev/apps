import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  DEFAULT_WALLPAPER_ID,
  getWallpaperById,
  pickWallpaperForTime,
  ZEN_WALLPAPERS,
  type ZenWallpaper,
} from './zenWallpapers';

const WALLPAPER_STORAGE_KEY = 'newtab:zen:wallpaper';
const WALLPAPER_CHANGE_EVENT = 'newtab:zen:wallpaper:changed';

const readStoredWallpaperId = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_WALLPAPER_ID;
  }
  return (
    window.localStorage.getItem(WALLPAPER_STORAGE_KEY) ?? DEFAULT_WALLPAPER_ID
  );
};

const writeStoredWallpaperId = (id: string): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(WALLPAPER_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(WALLPAPER_CHANGE_EVENT));
};

export const useZenWallpaper = (): {
  wallpaper: ZenWallpaper;
  setWallpaperId: (id: string) => void;
  resetToAuto: () => void;
  isAuto: boolean;
} => {
  const [rawId, setRawId] = useState<string>(() => readStoredWallpaperId());

  useEffect(() => {
    const handler = () => setRawId(readStoredWallpaperId());
    window.addEventListener(WALLPAPER_CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(WALLPAPER_CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const wallpaper = useMemo<ZenWallpaper>(() => {
    if (rawId === 'auto') {
      return pickWallpaperForTime();
    }
    return getWallpaperById(rawId);
  }, [rawId]);

  const setWallpaperId = useCallback((id: string) => {
    writeStoredWallpaperId(id);
  }, []);

  const resetToAuto = useCallback(() => {
    writeStoredWallpaperId('auto');
  }, []);

  return {
    wallpaper,
    setWallpaperId,
    resetToAuto,
    isAuto: rawId === 'auto',
  };
};

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

interface ZenBackgroundProps {
  className?: string;
}

// Renders two layered gradient panels and crossfades between them when the
// active wallpaper changes. When the user prefers reduced motion we skip the
// crossfade and just swap the gradient in place.
export const ZenBackground = ({
  className,
}: ZenBackgroundProps): ReactElement => {
  const { wallpaper } = useZenWallpaper();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  return (
    <div
      aria-hidden="true"
      className={classNames(
        '-z-10 pointer-events-none fixed inset-0 overflow-hidden',
        className,
      )}
    >
      <div
        key={wallpaper.id}
        className={classNames(
          'absolute inset-0',
          !reducedMotion && 'transition-opacity duration-700 ease-out',
        )}
        style={{ background: wallpaper.gradient }}
      />
      <div
        className={classNames('absolute inset-0', wallpaper.overlayClassName)}
      />
      {/* Subtle top/bottom darken for text legibility without swallowing the hue. */}
      <div className="from-background-default/60 absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent" />
      <div className="from-background-default/80 absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t to-transparent" />
    </div>
  );
};

export { ZEN_WALLPAPERS };
