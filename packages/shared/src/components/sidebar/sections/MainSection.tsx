import React, { ReactElement, useMemo } from 'react';
import { Section } from '../Section';
import { ListIcon, SidebarMenuItem } from '../common';
import { BookmarkIcon, DiscussIcon, HotIcon } from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { OtherFeedPage } from '../../../lib/query';
import { useActions } from '../../../hooks';
import { isExtension } from '../../../lib/func';
import { ActionType } from '../../../graphql/actions';
import { locationPush, SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { completeAction } = useActions();
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
          <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
        ),
        title: 'Bookmarks',
        path: `${webappUrl}bookmarks`,
        requiresLogin: true,
      },
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
          <ListIcon Icon={() => <DiscussIcon secondary={active} />} />
        ),
        title: 'Discussions',
        path: '/discussed',
        action: () => {
          if (user) {
            completeAction(ActionType.CommentFeed);
          }
          if (isExtension) {
            locationPush(OtherFeedPage.Discussed);
          }
        },
      },
    ].filter(Boolean);
  }, [completeAction, isLoggedIn, onNavTabClick, user]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
    />
  );
};
