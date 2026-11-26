import type { ReactElement } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { isExtension } from '../../lib/func';
import { isTesting } from '../../lib/constants';
import { laptop, tablet } from '../../styles/media';

const loadSidebarTablet = () =>
  import(/* webpackChunkName: "sidebarTablet" */ './SidebarTablet').then(
    (mod) => mod.SidebarTablet,
  );
const loadSidebarDesktopV2 = () =>
  import(/* webpackChunkName: "sidebarDesktopV2" */ './SidebarDesktopV2').then(
    (mod) => mod.SidebarDesktopV2,
  );

// Start fetching the sidebar this viewport renders as soon as this module
// runs, while boot is still in flight, instead of after the layout mounts.
const matchesMedia = (query: string): boolean =>
  !!globalThis.window?.matchMedia?.(query.replace('@media ', '')).matches;

if (!isTesting) {
  if (matchesMedia(laptop)) {
    loadSidebarDesktopV2().catch(() => undefined);
  } else if (matchesMedia(tablet)) {
    loadSidebarTablet().catch(() => undefined);
  }
}

const SidebarTablet = dynamic(loadSidebarTablet);
const SidebarDesktopV2 = dynamic(loadSidebarDesktopV2);

interface SidebarProps {
  activePage: string;
  isNavButtons?: boolean;
  showFeedbackWidget?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

export const Sidebar = ({
  isNavButtons,
  showFeedbackWidget,
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
      <SidebarDesktopV2
        activePage={isExtension ? activePage : undefined}
        featureTheme={featureTheme}
        isNavButtons={isNavButtons}
        showFeedbackWidget={showFeedbackWidget}
        onNavTabClick={onNavTabClick}
        onLogoClick={onLogoClick}
      />
    );
  }

  return null;
};
