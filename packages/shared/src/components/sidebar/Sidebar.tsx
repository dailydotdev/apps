import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
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
        additionalButtons={additionalButtons}
        isNavButtons={isNavButtons}
        showFeedbackWidget={showFeedbackWidget}
        onNavTabClick={onNavTabClick}
        onLogoClick={onLogoClick}
      />
    );
  }

  return null;
};
