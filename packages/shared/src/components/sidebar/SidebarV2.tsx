import React, { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { useViewSize, ViewSize } from '../../hooks';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';

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
  isNavButtons?: boolean;
  onNavTabClick?: (tab: string) => void;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

export const SidebarV2 = ({
  isNavButtons,
  onNavTabClick,
  onLogoClick,
  activePage,
}: SidebarProps): ReactElement => {
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

  return (
    <SidebarDesktop
      featureTheme={featureTheme}
      isNavButtons={isNavButtons}
      onNavTabClick={onNavTabClick}
    />
  );
};
