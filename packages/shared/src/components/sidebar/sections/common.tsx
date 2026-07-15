export type SidebarSectionProps = {
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
  title?: string;
  onNavTabClick?: (page: string) => void;
  // v2 sidebar polish (hover-only collapse arrow + 1px item gap). Defaults off
  // so the v1 sidebar renders its sections unchanged.
  compact?: boolean;
};
