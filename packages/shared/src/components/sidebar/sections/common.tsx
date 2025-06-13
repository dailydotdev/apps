export type SidebarSectionProps = {
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
  title?: string;
  onNavTabClick?: (page: string) => void;
};
