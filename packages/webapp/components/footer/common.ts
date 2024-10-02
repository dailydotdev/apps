import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { ReactElement } from 'react';

interface TabPathProps {
  user: LoggedUser;
  isLaptop?: boolean;
}

export interface FooterTab {
  path?: string | ((props: TabPathProps) => string);
  title: string;
  icon?: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
}

export interface FooterNavBarContainerProps {
  activeTab: string;
}
