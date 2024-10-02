import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { ReactElement } from 'react';

export interface FooterTab {
  path?: string | ((user: LoggedUser) => string);
  title: string;
  icon?: (active: boolean, unread?: number) => ReactElement;
  requiresLogin?: boolean;
  shouldShowLogin?: boolean;
  onClick?: () => void;
}

export interface FooterNavBarContainerProps {
  activeTab: string;
}

export const getNavPath = (
  path: FooterTab['path'],
  user: LoggedUser,
): string => {
  return typeof path === 'string' ? path : path(user);
};
