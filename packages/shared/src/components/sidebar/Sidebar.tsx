import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { isExtension } from '../../lib/func';

const chunkReloadSessionKey = 'sidebar_chunk_reload_attempted';

const isChunkLoadError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name.includes('ChunkLoadError') ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('Failed to load chunk')
  );
};

const tryReloadOnChunkError = (error: unknown): never => {
  if (
    typeof window !== 'undefined' &&
    isChunkLoadError(error) &&
    !window.sessionStorage.getItem(chunkReloadSessionKey)
  ) {
    window.sessionStorage.setItem(chunkReloadSessionKey, '1');
    window.location.reload();
  }

  throw error;
};

const clearChunkReloadFlag = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(chunkReloadSessionKey);
};

const SidebarTablet = dynamic(() =>
  import('./SidebarTablet')
    .then((mod) => {
      clearChunkReloadFlag();
      return mod.SidebarTablet;
    })
    .catch(tryReloadOnChunkError),
);
const SidebarDesktop = dynamic(() =>
  import('./SidebarDesktop')
    .then((mod) => {
      clearChunkReloadFlag();
      return mod.SidebarDesktop;
    })
    .catch(tryReloadOnChunkError),
);

interface SidebarProps {
  activePage: string;
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

export const Sidebar = ({
  isNavButtons,
  onNavTabClick,
  onLogoClick,
  activePage,
}: SidebarProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const featureTheme = useFeatureTheme();

  if (!isLaptop && isTablet) {
    return (
      <SidebarTablet
        activePage={activePage}
        onLogoClick={onLogoClick}
        featureTheme={featureTheme}
      />
    );
  }

  if (isLaptop) {
    return (
      <SidebarDesktop
        // for extension we want to pass active page
        // because router does not update there
        activePage={isExtension ? activePage : undefined}
        featureTheme={featureTheme}
        isNavButtons={isNavButtons}
        onNavTabClick={onNavTabClick}
      />
    );
  }

  return null;
};
