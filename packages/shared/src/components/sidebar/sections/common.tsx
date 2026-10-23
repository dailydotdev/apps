export type SidebarSectionProps = {
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
  title?: string;
  onNavTabClick?: (page: string) => void;
  // Rail-panel polish (hover-only collapse arrow + 1px item gap). Defaults off
  // for the other surfaces that render sections.
  isV2Panel?: boolean;
};

export const MARKETPLACE_DOT_ACCOUNTS_BEFORE = new Date('2026-10-08T00:00:00Z');
