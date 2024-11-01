import { webappUrl } from '../../../lib/constants';

export const locationPush = (path: string) => (): void =>
  window.location.assign(`${webappUrl}${path}`);

export type SidebarSectionProps = {
  title?: string;
  isItemsButton: boolean;
  sidebarExpanded: boolean;
  shouldShowLabel: boolean;
  activePage: string;
};
