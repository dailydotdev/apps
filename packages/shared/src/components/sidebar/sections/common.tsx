export type SidebarSectionProps = {
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
  title?: string;
  onNavTabClick?: (page: string) => void;
  // v2 single-panel sidebar: render compact (Linear-style) rows + headers.
  compact?: boolean;
};
