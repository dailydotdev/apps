import React, { ReactElement, useCallback, useMemo } from 'react';
import { Section } from '../Section';
import { ListIcon, SidebarMenuItem } from '../common';
import {
  BookmarkIcon,
  DevPlusIcon,
  EyeIcon,
  HotIcon,
  SquadIcon,
} from '../../icons';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { OtherFeedPage } from '../../../lib/query';
import { SidebarSectionProps } from './common';
import { webappUrl } from '../../../lib/constants';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../../lib/log';
import { useFollowingFeed } from '../../../hooks/feed/useFollowingFeed';

export const MainSection = ({
  isItemsButton,
  onNavTabClick,
  ...defaultRenderSectionProps
}: SidebarSectionProps): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { showPlusSubscription, isEnrolledNotPlus, logSubscriptionEvent } =
    usePlusSubscription();
  const { isActive } = useFollowingFeed();

  const onPlusClick = useCallback(() => {
    logSubscriptionEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_id: TargetId.Sidebar,
    });
  }, [logSubscriptionEvent]);

  const menuItems: SidebarMenuItem[] = useMemo(() => {
    const myFeed = isLoggedIn
      ? {
          title: 'My feed',
          path: '/',
          action: () => onNavTabClick?.('/'),
          icon: <ProfilePicture size={ProfileImageSize.XSmall} user={user} />,
        }
      : undefined;

    const plus = isEnrolledNotPlus
      ? {
          title: 'Upgrade to Plus',
          path: `${webappUrl}plus`,
          onClick: onPlusClick,
          isForcedLink: true,
          requiresLogin: true,
          icon: <DevPlusIcon />,
          color:
            'text-action-plus-default bg-action-plus-float hover:bg-action-plus-hover active:bg-action-plus-active',
        }
      : undefined;

    const following = isActive
      ? {
          title: 'Following',
          path: `${webappUrl}following`,
          action: () => onNavTabClick?.(OtherFeedPage.Following),
          icon: (active: boolean) => (
            <ListIcon Icon={() => <SquadIcon secondary={active} />} />
          ),
        }
      : undefined;

    return [
      myFeed,
      following,
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <HotIcon secondary={active} />} />
        ),
        title: 'Explore',
        path: '/posts',
        action: () => onNavTabClick?.(OtherFeedPage.Explore),
      },
      !showPlusSubscription && {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <BookmarkIcon secondary={active} />} />
        ),
        title: 'Bookmarks',
        path: `${webappUrl}bookmarks`,
        isForcedLink: true,
        requiresLogin: true,
      },
      {
        icon: (active: boolean) => (
          <ListIcon Icon={() => <EyeIcon secondary={active} />} />
        ),
        title: 'History',
        path: `${webappUrl}history`,
        isForcedLink: true,
        requiresLogin: true,
      },
      plus,
    ].filter(Boolean);
  }, [
    isLoggedIn,
    user,
    isEnrolledNotPlus,
    onPlusClick,
    isActive,
    onNavTabClick,
    showPlusSubscription,
  ]);

  return (
    <Section
      {...defaultRenderSectionProps}
      items={menuItems}
      isItemsButton={isItemsButton}
    />
  );
};
