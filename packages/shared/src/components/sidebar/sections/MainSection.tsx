import React, { ReactElement, useMemo } from 'react';
import { Section } from '../Section';
import { ListIcon, SidebarMenuItem } from '../common';
import { BookmarkIcon, EyeIcon, HotIcon } from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { OtherFeedPage } from '../../../lib/query';
import { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const myFeed = isLoggedIn
      ? {
          title: 'My feed',
          path: '/',
          action: () => onNavTabClick?.('/'),
          icon: <ProfilePicture size={ProfileImageSize.XSmall} user={user} />,
        }
      : undefined;

    return [
      myFeed,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotIcon secondary={active} />} />
        ),
        title: 'Explore',
        path: '/posts',
        action: () => onNavTabClick?.(OtherFeedPage.Explore),
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
        ),
        title: 'Bookmarks',
        path: `${webappUrl}bookmarks`,
        requiresLogin: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EyeIcon secondary={active} />} />
        ),
        title: 'History',
        path: `${webappUrl}history`,
        requiresLogin: true,
      },
    ].filter(Boolean);
  }, [isLoggedIn, onNavTabClick, user]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
    />
  );
};
