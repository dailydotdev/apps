import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { isExtension } from '../../lib/func';

const SidebarTablet = dynamic(() =>
  import(/* webpackChunkName: "sidebarTablet" */ './SidebarTablet').then(
    (mod) => mod.SidebarTablet,
  ),
);
const SidebarDesktop = dynamic(() =>
  import(/* webpackChunkName: "sidebarDesktop" */ './SidebarDesktop').then(
    (mod) => mod.SidebarDesktop,
  ),
);
const SidebarDesktopV2 = dynamic(() =>
  import(/* webpackChunkName: "sidebarDesktopV2" */ './SidebarDesktopV2').then(
    (mod) => mod.SidebarDesktopV2,
  ),
);

interface SidebarProps {
  activePage: string;
  additionalButtons?: ReactNode;
  isNavButtons?: boolean;
  showFeedbackWidget?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

export const Sidebar = ({
  additionalButtons,
  isNavButtons,
  showFeedbackWidget,
  onNavTabClick,
  onLogoClick,
  activePage,
}: SidebarProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isTablet = useViewSize(ViewSize.Tablet);
  const featureTheme = useFeatureTheme();
  const { isV2 } = useLayoutVariant();

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
    if (isV2) {
      return (
        <SidebarDesktopV2
          activePage={isExtension ? activePage : undefined}
          featureTheme={featureTheme}
          additionalButtons={additionalButtons}
          isNavButtons={isNavButtons}
          showFeedbackWidget={showFeedbackWidget}
          onNavTabClick={onNavTabClick}
          onLogoClick={onLogoClick}
        />
      );
    }
    return (
      <SidebarDesktop
        activePage={isExtension ? activePage : undefined}
        featureTheme={featureTheme}
        isNavButtons={isNavButtons}
        onNavTabClick={onNavTabClick}
      />
    );
  }

  return null;
};
