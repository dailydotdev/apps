import { webappUrl } from '../../../lib/constants';

export const locationPush = (path: string) => (): void =>
  window.location.assign(`${webappUrl}${path}`);

export type SidebarSectionProps = {
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
  title?: string;
  onNavTabClick?: (page: string) => void;
};
